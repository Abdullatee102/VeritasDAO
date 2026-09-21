// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VeritasDAO
 * @notice Production-grade decentralized governance and sequential election platform.
 * Model: Register Once -> Hold Governance Tokens -> Join Elections -> Vote With Token Weight ->
 * Determine Winners On-Chain -> Preserve Permanent Immutable History.
 */
contract VeritasDAO is Ownable, ReentrancyGuard {
    // -------------------------------------------------------------------------
    // ENUMS & STRUCTS
    // -------------------------------------------------------------------------

    enum ElectionStatus {
        Created,
        Open,
        Closed,
        Finalized
    }

    enum ProposalStatus {
        Active,
        Approved,
        Executed,
        Rejected
    }

    struct Candidate {
        uint256 id;
        string name;
        string description;
        uint256 voteWeight;
        uint256 voteCount;
        bool active;
    }

    struct Election {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        ElectionStatus status;
        uint256 winnerCandidateId;
        uint256 winningVoteWeight;
        bool isTie;
        bool resultFinalized;
        uint256 totalVotes;
        uint256 totalVoteWeight;
        uint256 candidateCount;
        uint256 createdAt;
    }

    struct VoteRecord {
        address voter;
        uint256 candidateId;
        uint256 weight;
        uint256 timestamp;
    }

    struct ElectionProposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 proposedStartTime;
        uint256 proposedEndTime;
        uint256 supportWeight;
        uint256 supportCount;
        ProposalStatus status;
        uint256 createdAt;
        uint256 createdElectionId;
    }

    // -------------------------------------------------------------------------
    // STATE VARIABLES
    // -------------------------------------------------------------------------

    IERC20 public immutable governanceToken;

    uint256 public constant MAX_CANDIDATES_PER_ELECTION = 30;
    uint256 public constant PROPOSAL_CREATION_THRESHOLD = 50 * 10 ** 18; // 50 VRT to propose
    uint256 public constant PROPOSAL_SUPPORT_THRESHOLD = 150 * 10 ** 18; // 150 VRT total support to approve

    // Voter Registration (One-time registration)
    mapping(address => bool) public isRegisteredVoter;
    address[] public registeredVotersList;

    // Sequential Elections
    uint256 public electionCount;
    mapping(uint256 => Election) public elections;
    mapping(uint256 => Candidate[]) internal _electionCandidates;
    mapping(uint256 => mapping(address => bool)) public hasVotedInElection;
    mapping(uint256 => mapping(address => VoteRecord)) public electionVotes;

    // Community Proposals (Stretch Goal)
    uint256 public proposalCount;
    mapping(uint256 => ElectionProposal) public proposals;
    mapping(uint256 => string[]) internal _proposalCandidateNames;
    mapping(uint256 => string[]) internal _proposalCandidateDescriptions;
    mapping(uint256 => mapping(address => bool)) public hasSupportedProposal;

    // -------------------------------------------------------------------------
    // EVENTS
    // -------------------------------------------------------------------------

    event VoterRegistered(address indexed voter, uint256 timestamp);
    event ElectionCreated(
        uint256 indexed electionId,
        string title,
        uint256 startTime,
        uint256 endTime,
        address indexed creator,
        uint256 timestamp
    );
    event CandidateAdded(
        uint256 indexed electionId,
        uint256 indexed candidateId,
        string name,
        string description
    );
    event ElectionOpened(uint256 indexed electionId, uint256 startTime, uint256 endTime, uint256 timestamp);
    event VoteCast(
        uint256 indexed electionId,
        address indexed voter,
        uint256 indexed candidateId,
        uint256 weight,
        uint256 timestamp
    );
    event ElectionClosed(uint256 indexed electionId, uint256 timestamp);
    event ElectionFinalized(
        uint256 indexed electionId,
        uint256 winnerCandidateId,
        uint256 winningVoteWeight,
        bool isTie,
        uint256 timestamp
    );
    event ElectionProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        uint256 timestamp
    );
    event ElectionProposalSupported(
        uint256 indexed proposalId,
        address indexed supporter,
        uint256 supportWeight,
        uint256 newTotalSupportWeight
    );
    event ElectionProposalApproved(uint256 indexed proposalId, uint256 timestamp);
    event ElectionProposalExecuted(
        uint256 indexed proposalId,
        uint256 indexed createdElectionId,
        uint256 timestamp
    );

    // -------------------------------------------------------------------------
    // CONSTRUCTOR
    // -------------------------------------------------------------------------

    constructor(address _governanceToken, address _chairman) Ownable(_chairman) {
        require(_governanceToken != address(0), "Invalid token address");
        require(_chairman != address(0), "Invalid chairman address");
        governanceToken = IERC20(_governanceToken);
    }

    // -------------------------------------------------------------------------
    // VOTER REGISTRATION
    // -------------------------------------------------------------------------

    /**
     * @notice Register as an eligible voter in VeritasDAO.
     * @dev Voter registers once and remains eligible for all future elections.
     */
    function registerVoter() external {
        require(!isRegisteredVoter[msg.sender], "Voter already registered");
        isRegisteredVoter[msg.sender] = true;
        registeredVotersList.push(msg.sender);

        emit VoterRegistered(msg.sender, block.timestamp);
    }

    // -------------------------------------------------------------------------
    // CHAIRMAN / ORGANIZER - ELECTION LIFECYCLE
    // -------------------------------------------------------------------------

    /**
     * @notice Create a new election in `Created` state.
     * @param title Title of the election
     * @param description Overview / context of the election
     * @param startTime Intended start timestamp
     * @param endTime Intended end timestamp
     * @return electionId The newly created election ID
     */
    function createElection(
        string calldata title,
        string calldata description,
        uint256 startTime,
        uint256 endTime
    ) external onlyOwner returns (uint256) {
        return _createElectionInternal(title, description, startTime, endTime, msg.sender);
    }

    /**
     * @notice Internal helper to initialize an election
     */
    function _createElectionInternal(
        string memory title,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        address creator
    ) internal returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(endTime > startTime, "End time must be after start time");
        require(endTime > block.timestamp, "End time must be in future");

        electionCount++;
        uint256 newElectionId = electionCount;

        elections[newElectionId] = Election({
            id: newElectionId,
            title: title,
            description: description,
            startTime: startTime,
            endTime: endTime,
            status: ElectionStatus.Created,
            winnerCandidateId: 0,
            winningVoteWeight: 0,
            isTie: false,
            resultFinalized: false,
            totalVotes: 0,
            totalVoteWeight: 0,
            candidateCount: 0,
            createdAt: block.timestamp
        });

        emit ElectionCreated(newElectionId, title, startTime, endTime, creator, block.timestamp);
        return newElectionId;
    }

    /**
     * @notice Add a candidate to an election before it opens.
     * @param electionId ID of the election
     * @param name Name of the candidate
     * @param description Background / platform of candidate
     */
    function addCandidate(
        uint256 electionId,
        string calldata name,
        string calldata description
    ) external onlyOwner {
        require(electionId > 0 && electionId <= electionCount, "Invalid election ID");
        Election storage election = elections[electionId];
        require(election.status == ElectionStatus.Created, "Election not in Created state");
        require(bytes(name).length > 0, "Candidate name cannot be empty");
        require(
            election.candidateCount < MAX_CANDIDATES_PER_ELECTION,
            "Exceeded max candidates limit"
        );

        election.candidateCount++;
        uint256 candidateId = election.candidateCount;

        Candidate memory newCandidate = Candidate({
            id: candidateId,
            name: name,
            description: description,
            voteWeight: 0,
            voteCount: 0,
            active: true
        });

        _electionCandidates[electionId].push(newCandidate);

        emit CandidateAdded(electionId, candidateId, name, description);
    }

    /**
     * @notice Open an election for voting.
     * @dev Once opened, candidate sets are permanently locked and cannot be altered.
     * @param electionId ID of the election
     */
    function openElection(uint256 electionId) external onlyOwner {
        require(electionId > 0 && electionId <= electionCount, "Invalid election ID");
        Election storage election = elections[electionId];
        require(election.status == ElectionStatus.Created, "Election must be in Created state");
        require(election.candidateCount >= 2, "Must have at least 2 candidates to open");
        require(election.endTime > block.timestamp, "End time has already passed");

        // If configured startTime is in the past, adjust to current timestamp
        if (election.startTime < block.timestamp) {
            election.startTime = block.timestamp;
        }

        election.status = ElectionStatus.Open;

        emit ElectionOpened(electionId, election.startTime, election.endTime, block.timestamp);
    }

    /**
     * @notice Manually or automatically close an election when voting concludes.
     * @param electionId ID of the election
     */
    function closeElection(uint256 electionId) public {
        require(electionId > 0 && electionId <= electionCount, "Invalid election ID");
        Election storage election = elections[electionId];
        require(election.status == ElectionStatus.Open, "Election is not Open");
        
        // Anyone can close after endTime, or owner can close
        require(
            block.timestamp >= election.endTime || msg.sender == owner(),
            "Cannot close before end time unless owner"
        );

        election.status = ElectionStatus.Closed;
        emit ElectionClosed(electionId, block.timestamp);
    }

    /**
     * @notice Finalize an election, calculate winner from recorded vote weights, and seal permanent on-chain record.
     * @dev Calculates highest recorded vote weight. Explicitly resolves ties deterministically.
     * Once finalized, results are immutable and cannot be rewritten by anyone (including the Chairman).
     * @param electionId ID of the election
     */
    function finalizeElection(uint256 electionId) external nonReentrant {
        require(electionId > 0 && electionId <= electionCount, "Invalid election ID");
        Election storage election = elections[electionId];
        require(!election.resultFinalized && election.status != ElectionStatus.Finalized, "Election already finalized");
        require(
            election.status == ElectionStatus.Closed ||
            (election.status == ElectionStatus.Open && block.timestamp >= election.endTime) ||
            (election.status == ElectionStatus.Open && msg.sender == owner()),
            "Election cannot be finalized yet"
        );

        Candidate[] storage candidatesList = _electionCandidates[electionId];
        uint256 count = candidatesList.length;
        require(count > 0, "No candidates found");

        uint256 maxWeight = 0;
        uint256 topCandidateId = 0;
        bool tieFound = false;

        // Loop through candidate array to determine winner
        for (uint256 i = 0; i < count; i++) {
            Candidate storage c = candidatesList[i];
            if (c.voteWeight > maxWeight) {
                maxWeight = c.voteWeight;
                topCandidateId = c.id;
                tieFound = false;
            } else if (c.voteWeight == maxWeight && maxWeight > 0) {
                tieFound = true;
            }
        }

        // Edge case: zero votes cast across all candidates -> treated as tie / no winner
        if (maxWeight == 0 && election.totalVotes == 0) {
            tieFound = true;
            topCandidateId = 0;
        }

        election.status = ElectionStatus.Finalized;
        election.resultFinalized = true;
        election.isTie = tieFound;
        election.winnerCandidateId = tieFound ? 0 : topCandidateId;
        election.winningVoteWeight = maxWeight;

        emit ElectionFinalized(
            electionId,
            election.winnerCandidateId,
            maxWeight,
            tieFound,
            block.timestamp
        );
    }

    // -------------------------------------------------------------------------
    // VOTER ACTION - WEIGHTED VOTING
    // -------------------------------------------------------------------------

    /**
     * @notice Cast a weighted vote for a candidate in an active election.
     * @param electionId ID of the election
     * @param candidateId ID of candidate to vote for (1-indexed)
     */
    function vote(uint256 electionId, uint256 candidateId) external nonReentrant {
        require(isRegisteredVoter[msg.sender], "Voter not registered");
        require(electionId > 0 && electionId <= electionCount, "Invalid election ID");
        
        Election storage election = elections[electionId];
        require(election.status == ElectionStatus.Open, "Election is not open");
        require(block.timestamp >= election.startTime, "Voting period has not started");
        require(block.timestamp <= election.endTime, "Voting period has ended");
        require(!hasVotedInElection[electionId][msg.sender], "Voter already voted in this election");
        require(
            candidateId >= 1 && candidateId <= election.candidateCount,
            "Invalid candidate ID"
        );

        Candidate storage candidate = _electionCandidates[electionId][candidateId - 1];
        require(candidate.active, "Candidate is not active");

        // Read governance-token balance at the exact moment of voting
        uint256 voterWeight = governanceToken.balanceOf(msg.sender);
        require(voterWeight > 0, "Zero governance token balance: cannot vote");

        // Record voter participation
        hasVotedInElection[electionId][msg.sender] = true;
        electionVotes[electionId][msg.sender] = VoteRecord({
            voter: msg.sender,
            candidateId: candidateId,
            weight: voterWeight,
            timestamp: block.timestamp
        });

        // Update vote totals
        candidate.voteWeight += voterWeight;
        candidate.voteCount += 1;
        election.totalVotes += 1;
        election.totalVoteWeight += voterWeight;

        emit VoteCast(electionId, msg.sender, candidateId, voterWeight, block.timestamp);
    }

    // -------------------------------------------------------------------------
    // STRETCH GOAL - DECENTRALIZED ELECTION PROPOSALS
    // -------------------------------------------------------------------------

    /**
     * @notice Allows token holders holding >= 50 VRT to propose a new election.
     */
    function proposeElection(
        string calldata title,
        string calldata description,
        uint256 proposedStartTime,
        uint256 proposedEndTime,
        string[] calldata candidateNames,
        string[] calldata candidateDescriptions
    ) external returns (uint256) {
        require(
            governanceToken.balanceOf(msg.sender) >= PROPOSAL_CREATION_THRESHOLD,
            "Insufficient VRT to create proposal"
        );
        require(bytes(title).length > 0, "Title cannot be empty");
        require(candidateNames.length >= 2, "Must provide at least 2 candidates");
        require(
            candidateNames.length == candidateDescriptions.length,
            "Candidate names and descriptions length mismatch"
        );
        require(
            candidateNames.length <= MAX_CANDIDATES_PER_ELECTION,
            "Too many candidates"
        );
        require(
            proposedEndTime > proposedStartTime && proposedEndTime > block.timestamp,
            "Invalid proposed timing"
        );

        proposalCount++;
        uint256 newProposalId = proposalCount;

        proposals[newProposalId] = ElectionProposal({
            id: newProposalId,
            proposer: msg.sender,
            title: title,
            description: description,
            proposedStartTime: proposedStartTime,
            proposedEndTime: proposedEndTime,
            supportWeight: 0,
            supportCount: 0,
            status: ProposalStatus.Active,
            createdAt: block.timestamp,
            createdElectionId: 0
        });

        for (uint256 i = 0; i < candidateNames.length; i++) {
            _proposalCandidateNames[newProposalId].push(candidateNames[i]);
            _proposalCandidateDescriptions[newProposalId].push(candidateDescriptions[i]);
        }

        emit ElectionProposalCreated(newProposalId, msg.sender, title, block.timestamp);
        return newProposalId;
    }

    /**
     * @notice Support an active election proposal with voter's token weight.
     */
    function supportProposal(uint256 proposalId) external nonReentrant {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal ID");
        ElectionProposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.Active, "Proposal not active");
        require(!hasSupportedProposal[proposalId][msg.sender], "Already supported this proposal");

        uint256 weight = governanceToken.balanceOf(msg.sender);
        require(weight > 0, "Zero token balance");

        hasSupportedProposal[proposalId][msg.sender] = true;
        proposal.supportWeight += weight;
        proposal.supportCount += 1;

        emit ElectionProposalSupported(proposalId, msg.sender, weight, proposal.supportWeight);

        if (proposal.supportWeight >= PROPOSAL_SUPPORT_THRESHOLD) {
            proposal.status = ProposalStatus.Approved;
            emit ElectionProposalApproved(proposalId, block.timestamp);
        }
    }

    /**
     * @notice Execute an approved proposal, automatically creating the real on-chain election.
     */
    function executeApprovedProposal(uint256 proposalId) external nonReentrant returns (uint256) {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal ID");
        ElectionProposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.Approved, "Proposal not approved yet");

        proposal.status = ProposalStatus.Executed;

        uint256 createdId = _createElectionInternal(
            proposal.title,
            proposal.description,
            proposal.proposedStartTime,
            proposal.proposedEndTime,
            proposal.proposer
        );

        proposal.createdElectionId = createdId;

        string[] storage cNames = _proposalCandidateNames[proposalId];
        string[] storage cDescs = _proposalCandidateDescriptions[proposalId];

        Election storage createdElection = elections[createdId];
        for (uint256 i = 0; i < cNames.length; i++) {
            createdElection.candidateCount++;
            uint256 candidateId = createdElection.candidateCount;
            _electionCandidates[createdId].push(
                Candidate({
                    id: candidateId,
                    name: cNames[i],
                    description: cDescs[i],
                    voteWeight: 0,
                    voteCount: 0,
                    active: true
                })
            );
            emit CandidateAdded(createdId, candidateId, cNames[i], cDescs[i]);
        }

        emit ElectionProposalExecuted(proposalId, createdId, block.timestamp);
        return createdId;
    }

    // -------------------------------------------------------------------------
    // VIEW FUNCTIONS & PUBLIC GETTERS
    // -------------------------------------------------------------------------

    /**
     * @notice Retrieve election details by ID
     */
    function getElection(uint256 electionId) external view returns (Election memory) {
        require(electionId > 0 && electionId <= electionCount, "Invalid election ID");
        return elections[electionId];
    }

    /**
     * @notice Retrieve all candidates for a specific election
     */
    function getCandidates(uint256 electionId) external view returns (Candidate[] memory) {
        require(electionId > 0 && electionId <= electionCount, "Invalid election ID");
        return _electionCandidates[electionId];
    }

    /**
     * @notice Retrieve a specific candidate in an election
     */
    function getCandidate(uint256 electionId, uint256 candidateId) external view returns (Candidate memory) {
        require(electionId > 0 && electionId <= electionCount, "Invalid election ID");
        require(candidateId >= 1 && candidateId <= elections[electionId].candidateCount, "Invalid candidate ID");
        return _electionCandidates[electionId][candidateId - 1];
    }

    /**
     * @notice Retrieve vote details of a voter in an election
     */
    function getVote(uint256 electionId, address voter) external view returns (VoteRecord memory) {
        return electionVotes[electionId][voter];
    }

    /**
     * @notice Retrieve all elections
     */
    function getAllElections() external view returns (Election[] memory) {
        Election[] memory allElections = new Election[](electionCount);
        for (uint256 i = 1; i <= electionCount; i++) {
            allElections[i - 1] = elections[i];
        }
        return allElections;
    }

    /**
     * @notice Retrieve all finalized elections (Election History)
     */
    function getElectionHistory() external view returns (Election[] memory) {
        uint256 finalizedCount = 0;
        for (uint256 i = 1; i <= electionCount; i++) {
            if (elections[i].status == ElectionStatus.Finalized) {
                finalizedCount++;
            }
        }

        Election[] memory history = new Election[](finalizedCount);
        uint256 idx = 0;
        for (uint256 i = 1; i <= electionCount; i++) {
            if (elections[i].status == ElectionStatus.Finalized) {
                history[idx] = elections[i];
                idx++;
            }
        }
        return history;
    }

    /**
     * @notice Retrieve total registered voters count
     */
    function getRegisteredVotersCount() external view returns (uint256) {
        return registeredVotersList.length;
    }

    /**
     * @notice Retrieve registered voters with pagination
     */
    function getRegisteredVotersList(uint256 offset, uint256 limit) external view returns (address[] memory) {
        uint256 total = registeredVotersList.length;
        if (offset >= total) {
            return new address[](0);
        }
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        uint256 resultLength = end - offset;
        address[] memory page = new address[](resultLength);
        for (uint256 i = 0; i < resultLength; i++) {
            page[i] = registeredVotersList[offset + i];
        }
        return page;
    }

    /**
     * @notice Retrieve a specific proposal by ID
     */
    function getProposal(uint256 proposalId) external view returns (ElectionProposal memory) {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal ID");
        return proposals[proposalId];
    }

    /**
     * @notice Retrieve all proposals (Stretch Goal)
     */
    function getAllProposals() external view returns (ElectionProposal[] memory) {
        ElectionProposal[] memory allProps = new ElectionProposal[](proposalCount);
        for (uint256 i = 1; i <= proposalCount; i++) {
            allProps[i - 1] = proposals[i];
        }
        return allProps;
    }

    /**
     * @notice Retrieve candidate names and descriptions for a proposal
     */
    function getProposalCandidates(uint256 proposalId)
        external
        view
        returns (string[] memory names, string[] memory descriptions)
    {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal ID");
        return (_proposalCandidateNames[proposalId], _proposalCandidateDescriptions[proposalId]);
    }

    /**
     * @notice Summary stats for dashboard display
     */
    function getSummaryStats()
        external
        view
        returns (
            uint256 totalElections,
            uint256 openElections,
            uint256 finalizedElections,
            uint256 totalRegisteredVoters,
            uint256 totalVotesCast,
            uint256 totalVoteWeight
        )
    {
        totalElections = electionCount;
        totalRegisteredVoters = registeredVotersList.length;

        for (uint256 i = 1; i <= electionCount; i++) {
            if (elections[i].status == ElectionStatus.Open) {
                openElections++;
            } else if (elections[i].status == ElectionStatus.Finalized) {
                finalizedElections++;
            }
            totalVotesCast += elections[i].totalVotes;
            totalVoteWeight += elections[i].totalVoteWeight;
        }
    }
}
