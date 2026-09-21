// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/VeritasGovernanceToken.sol";
import "../src/VeritasDAO.sol";

contract VeritasDAOTest is Test {
    VeritasGovernanceToken public token;
    VeritasDAO public dao;

    address public chairman = address(0xAA11);
    address public alice = address(0xA11CE);
    address public bob = address(0xB0B);
    address public charlie = address(0xCAFE);
    address public dave = address(0xDA7E);
    address public unregisteredUser = address(0xDEAD);

    uint256 public constant ALICE_BALANCE = 100 * 10 ** 18; // 100 VRT
    uint256 public constant BOB_BALANCE = 50 * 10 ** 18;   // 50 VRT
    uint256 public constant CHARLIE_BALANCE = 25 * 10 ** 18; // 25 VRT
    uint256 public constant DAVE_BALANCE = 10 * 10 ** 18;  // 10 VRT

    function setUp() public {
        vm.warp(1000);
        vm.startPrank(chairman);
        token = new VeritasGovernanceToken(chairman);
        dao = new VeritasDAO(address(token), chairman);

        // Distribute tokens to test voters
        token.transfer(alice, ALICE_BALANCE);
        token.transfer(bob, BOB_BALANCE);
        token.transfer(charlie, CHARLIE_BALANCE);
        token.transfer(dave, DAVE_BALANCE);
        vm.stopPrank();
    }

    // =========================================================================
    // 1. VOTER REGISTRATION TESTS
    // =========================================================================

    function test_RegisterVoter_Success() public {
        vm.prank(alice);
        dao.registerVoter();

        assertTrue(dao.isRegisteredVoter(alice));
        assertEq(dao.getRegisteredVotersCount(), 1);
    }

    function test_RegisterVoter_Duplicate_Reverts() public {
        vm.prank(alice);
        dao.registerVoter();

        vm.prank(alice);
        vm.expectRevert("Voter already registered");
        dao.registerVoter();
    }

    function test_MultipleVoters_RegisterOnce() public {
        vm.prank(alice);
        dao.registerVoter();

        vm.prank(bob);
        dao.registerVoter();

        vm.prank(charlie);
        dao.registerVoter();

        assertEq(dao.getRegisteredVotersCount(), 3);
        assertTrue(dao.isRegisteredVoter(alice));
        assertTrue(dao.isRegisteredVoter(bob));
        assertTrue(dao.isRegisteredVoter(charlie));
    }

    // =========================================================================
    // 2. ELECTION CREATION & CANDIDATE MANAGEMENT
    // =========================================================================

    function test_CreateElection_OwnerOnly() public {
        uint256 startTime = block.timestamp + 100;
        uint256 endTime = block.timestamp + 1000;

        vm.prank(alice);
        vm.expectRevert();
        dao.createElection("Treasury Council", "Election for treasury oversight", startTime, endTime);

        vm.prank(chairman);
        uint256 id = dao.createElection("Treasury Council", "Election for treasury oversight", startTime, endTime);
        assertEq(id, 1);

        VeritasDAO.Election memory election = dao.getElection(1);
        assertEq(election.title, "Treasury Council");
        assertEq(uint8(election.status), uint8(VeritasDAO.ElectionStatus.Created));
    }

    function test_InvalidElectionTiming_Reverts() public {
        vm.warp(2000);
        vm.startPrank(chairman);
        // End time in the past
        vm.expectRevert("End time must be in future");
        dao.createElection("Past Election", "Desc", block.timestamp - 1000, block.timestamp - 500);

        // End time before start time
        vm.expectRevert("End time must be after start time");
        dao.createElection("Bad Timing", "Desc", block.timestamp + 500, block.timestamp + 100);
        vm.stopPrank();
    }

    function test_AddCandidates_BeforeOpen() public {
        vm.startPrank(chairman);
        uint256 id = dao.createElection("Council 2026", "Desc", block.timestamp + 10, block.timestamp + 1000);

        dao.addCandidate(id, "Candidate One", "Platform One");
        dao.addCandidate(id, "Candidate Two", "Platform Two");
        dao.addCandidate(id, "Candidate Three", "Platform Three");

        VeritasDAO.Candidate[] memory candidates = dao.getCandidates(id);
        assertEq(candidates.length, 3);
        assertEq(candidates[0].name, "Candidate One");
        assertEq(candidates[1].name, "Candidate Two");
        assertEq(candidates[2].name, "Candidate Three");
        vm.stopPrank();
    }

    function test_OpenElection_RequiresAtLeastTwoCandidates() public {
        vm.startPrank(chairman);
        uint256 id = dao.createElection("Council", "Desc", block.timestamp + 10, block.timestamp + 1000);

        // 0 candidates
        vm.expectRevert("Must have at least 2 candidates to open");
        dao.openElection(id);

        // 1 candidate
        dao.addCandidate(id, "Solo Candidate", "Desc");
        vm.expectRevert("Must have at least 2 candidates to open");
        dao.openElection(id);

        // 2 candidates
        dao.addCandidate(id, "Second Candidate", "Desc");
        dao.openElection(id);

        VeritasDAO.Election memory election = dao.getElection(id);
        assertEq(uint8(election.status), uint8(VeritasDAO.ElectionStatus.Open));
        vm.stopPrank();
    }

    function test_CannotAddCandidates_AfterOpen() public {
        vm.startPrank(chairman);
        uint256 id = dao.createElection("Council", "Desc", block.timestamp + 10, block.timestamp + 1000);
        dao.addCandidate(id, "C1", "Desc1");
        dao.addCandidate(id, "C2", "Desc2");
        dao.openElection(id);

        vm.expectRevert("Election not in Created state");
        dao.addCandidate(id, "C3", "Desc3");
        vm.stopPrank();
    }

    // =========================================================================
    // 3. WEIGHTED VOTING TESTS
    // =========================================================================

    function test_WeightedVoting_CalculatesWeightAccurately() public {
        // Setup election
        vm.startPrank(chairman);
        uint256 id = dao.createElection("Treasury Council", "Vote for lead", block.timestamp, block.timestamp + 1000);
        dao.addCandidate(id, "Alice", "Alice for Treasury");
        dao.addCandidate(id, "Bob", "Bob for Treasury");
        dao.openElection(id);
        vm.stopPrank();

        // Register voters
        vm.prank(alice);
        dao.registerVoter();

        vm.prank(bob);
        dao.registerVoter();

        vm.prank(charlie);
        dao.registerVoter();

        // Alice (100 VRT) votes for Candidate 1 (Alice)
        vm.prank(alice);
        dao.vote(id, 1);

        // Bob (50 VRT) votes for Candidate 2 (Bob)
        vm.prank(bob);
        dao.vote(id, 2);

        // Charlie (25 VRT) votes for Candidate 1 (Alice)
        vm.prank(charlie);
        dao.vote(id, 1);

        // Verify Candidate totals
        VeritasDAO.Candidate memory c1 = dao.getCandidate(id, 1);
        VeritasDAO.Candidate memory c2 = dao.getCandidate(id, 2);

        assertEq(c1.voteWeight, 125 * 10 ** 18); // Alice 100 + Charlie 25
        assertEq(c1.voteCount, 2);

        assertEq(c2.voteWeight, 50 * 10 ** 18); // Bob 50
        assertEq(c2.voteCount, 1);

        VeritasDAO.Election memory election = dao.getElection(id);
        assertEq(election.totalVotes, 3);
        assertEq(election.totalVoteWeight, 175 * 10 ** 18);
    }

    function test_UnregisteredVoter_CannotVote() public {
        vm.startPrank(chairman);
        uint256 id = dao.createElection("Election", "Desc", block.timestamp, block.timestamp + 1000);
        dao.addCandidate(id, "C1", "D1");
        dao.addCandidate(id, "C2", "D2");
        dao.openElection(id);
        vm.stopPrank();

        vm.prank(unregisteredUser);
        vm.expectRevert("Voter not registered");
        dao.vote(id, 1);
    }

    function test_ZeroBalanceVoter_CannotVote() public {
        vm.startPrank(chairman);
        uint256 id = dao.createElection("Election", "Desc", block.timestamp, block.timestamp + 1000);
        dao.addCandidate(id, "C1", "D1");
        dao.addCandidate(id, "C2", "D2");
        dao.openElection(id);
        vm.stopPrank();

        address zeroBalanceVoter = address(0x9999);
        vm.prank(zeroBalanceVoter);
        dao.registerVoter();

        vm.prank(zeroBalanceVoter);
        vm.expectRevert("Zero governance token balance: cannot vote");
        dao.vote(id, 1);
    }

    function test_DuplicateVote_InSameElection_Reverts() public {
        vm.startPrank(chairman);
        uint256 id = dao.createElection("Election", "Desc", block.timestamp, block.timestamp + 1000);
        dao.addCandidate(id, "C1", "D1");
        dao.addCandidate(id, "C2", "D2");
        dao.openElection(id);
        vm.stopPrank();

        vm.prank(alice);
        dao.registerVoter();

        vm.prank(alice);
        dao.vote(id, 1);

        vm.prank(alice);
        vm.expectRevert("Voter already voted in this election");
        dao.vote(id, 2);
    }

    function test_TokenTransfer_AfterVote_DoesNotAlterRecordedVoteWeight() public {
        vm.startPrank(chairman);
        uint256 id = dao.createElection("Election", "Desc", block.timestamp, block.timestamp + 1000);
        dao.addCandidate(id, "C1", "D1");
        dao.addCandidate(id, "C2", "D2");
        dao.openElection(id);
        vm.stopPrank();

        vm.prank(alice);
        dao.registerVoter();

        // Alice votes with 100 VRT
        vm.prank(alice);
        dao.vote(id, 1);

        // Alice transfers all her tokens to Bob
        vm.prank(alice);
        token.transfer(bob, ALICE_BALANCE);
        assertEq(token.balanceOf(alice), 0);

        // Check vote record still holds 100 VRT
        VeritasDAO.VoteRecord memory record = dao.getVote(id, alice);
        assertEq(record.weight, 100 * 10 ** 18);

        VeritasDAO.Candidate memory c1 = dao.getCandidate(id, 1);
        assertEq(c1.voteWeight, 100 * 10 ** 18);
    }

    // =========================================================================
    // 4. WINNER DETERMINATION & TIE RESOLUTION
    // =========================================================================

    function test_FinalizeElection_DeterminesWinnerAccurately() public {
        vm.startPrank(chairman);
        uint256 id = dao.createElection("Council 2026", "Desc", block.timestamp, block.timestamp + 100);
        dao.addCandidate(id, "Alice", "Platform A");
        dao.addCandidate(id, "Bob", "Platform B");
        dao.addCandidate(id, "Charlie", "Platform C");
        dao.openElection(id);
        vm.stopPrank();

        vm.prank(alice);
        dao.registerVoter();
        vm.prank(bob);
        dao.registerVoter();
        vm.prank(charlie);
        dao.registerVoter();

        // Alice (100) votes for Alice (Candidate 1)
        vm.prank(alice);
        dao.vote(id, 1);

        // Bob (50) votes for Bob (Candidate 2)
        vm.prank(bob);
        dao.vote(id, 2);

        // Charlie (25) votes for Bob (Candidate 2)
        vm.prank(charlie);
        dao.vote(id, 2);

        // Total: C1 = 100 VRT, C2 = 75 VRT, C3 = 0 VRT -> Alice wins!
        vm.warp(block.timestamp + 150);
        dao.finalizeElection(id);

        VeritasDAO.Election memory finalized = dao.getElection(id);
        assertEq(uint8(finalized.status), uint8(VeritasDAO.ElectionStatus.Finalized));
        assertTrue(finalized.resultFinalized);
        assertFalse(finalized.isTie);
        assertEq(finalized.winnerCandidateId, 1);
        assertEq(finalized.winningVoteWeight, 100 * 10 ** 18);
    }

    function test_FinalizeElection_TieHandling() public {
        vm.startPrank(chairman);
        uint256 id = dao.createElection("Tie Test", "Desc", block.timestamp, block.timestamp + 100);
        dao.addCandidate(id, "Candidate A", "Platform A");
        dao.addCandidate(id, "Candidate B", "Platform B");
        dao.openElection(id);
        vm.stopPrank();

        // Give Dave equal tokens to Bob (50 VRT each)
        vm.prank(chairman);
        token.transfer(dave, 40 * 10 ** 18); // Dave now has 50 VRT

        vm.prank(bob);
        dao.registerVoter();
        vm.prank(dave);
        dao.registerVoter();

        // Bob (50) votes for Candidate 1
        vm.prank(bob);
        dao.vote(id, 1);

        // Dave (50) votes for Candidate 2
        vm.prank(dave);
        dao.vote(id, 2);

        vm.warp(block.timestamp + 150);
        dao.finalizeElection(id);

        VeritasDAO.Election memory finalized = dao.getElection(id);
        assertTrue(finalized.isTie);
        assertEq(finalized.winnerCandidateId, 0);
        assertEq(finalized.winningVoteWeight, 50 * 10 ** 18);
    }

    function test_FinalizedElection_IsImmutable() public {
        vm.startPrank(chairman);
        uint256 id = dao.createElection("Imm", "Desc", block.timestamp, block.timestamp + 100);
        dao.addCandidate(id, "C1", "D1");
        dao.addCandidate(id, "C2", "D2");
        dao.openElection(id);
        vm.stopPrank();

        vm.prank(alice);
        dao.registerVoter();
        vm.prank(alice);
        dao.vote(id, 1);

        vm.warp(block.timestamp + 150);
        dao.finalizeElection(id);

        // Cannot finalize again
        vm.expectRevert("Election already finalized");
        dao.finalizeElection(id);
    }

    // =========================================================================
    // 5. MULTIPLE SEQUENTIAL ELECTIONS (CORE REQUIREMENT)
    // =========================================================================

    function test_MultipleSequentialElections_IndependentHistory() public {
        // Register voters once
        vm.prank(alice);
        dao.registerVoter();
        vm.prank(bob);
        dao.registerVoter();
        vm.prank(charlie);
        dao.registerVoter();

        // ------------------ ELECTION #1 ------------------
        vm.startPrank(chairman);
        uint256 id1 = dao.createElection("Election 1: Treasury Lead", "Desc 1", block.timestamp, block.timestamp + 100);
        dao.addCandidate(id1, "Alice", "Treasury Platform");
        dao.addCandidate(id1, "Bob", "Ops Platform");
        dao.openElection(id1);
        vm.stopPrank();

        vm.prank(alice);
        dao.vote(id1, 1); // 100 to Alice
        vm.prank(bob);
        dao.vote(id1, 2);   // 50 to Bob

        vm.warp(1200);
        dao.finalizeElection(id1);

        // ------------------ ELECTION #2 ------------------
        vm.startPrank(chairman);
        uint256 t2Start = block.timestamp;
        uint256 t2End = block.timestamp + 500;
        uint256 id2 = dao.createElection("Election 2: Tech Council", "Desc 2", t2Start, t2End);
        dao.addCandidate(id2, "Charlie", "Security Lead");
        dao.addCandidate(id2, "Dave", "Smart Contract Lead");
        dao.openElection(id2);
        vm.stopPrank();

        // Same registered voters vote in Election 2 WITHOUT re-registering
        vm.prank(alice);
        dao.vote(id2, 2); // 100 to Dave
        vm.prank(bob);
        dao.vote(id2, 1);   // 50 to Charlie
        vm.prank(charlie);
        dao.vote(id2, 1); // 25 to Charlie

        vm.warp(2000);
        dao.finalizeElection(id2);

        // ------------------ VERIFY HISTORICAL ISOLATION ------------------
        VeritasDAO.Election memory e1 = dao.getElection(id1);
        VeritasDAO.Election memory e2 = dao.getElection(id2);

        // Election 1 winner is Alice (Candidate 1)
        assertEq(e1.winnerCandidateId, 1);
        assertEq(e1.winningVoteWeight, 100 * 10 ** 18);
        assertEq(e1.totalVotes, 2);

        // Election 2 winner is Dave (Candidate 2) (Alice's 100 > Charlie's 75)
        assertEq(e2.winnerCandidateId, 2);
        assertEq(e2.winningVoteWeight, 100 * 10 ** 18);
        assertEq(e2.totalVotes, 3);

        // Candidates are completely isolated
        VeritasDAO.Candidate[] memory cList1 = dao.getCandidates(id1);
        VeritasDAO.Candidate[] memory cList2 = dao.getCandidates(id2);
        assertEq(cList1[0].name, "Alice");
        assertEq(cList2[0].name, "Charlie");

        // History query returns both finalized elections
        VeritasDAO.Election[] memory history = dao.getElectionHistory();
        assertEq(history.length, 2);
    }

    // =========================================================================
    // 6. STRETCH GOAL: DECENTRALIZED PROPOSALS
    // =========================================================================

    function test_DecentralizedProposal_Workflow() public {
        string[] memory names = new string[](2);
        names[0] = "Community Candidate Alpha";
        names[1] = "Community Candidate Beta";

        string[] memory descriptions = new string[](2);
        descriptions[0] = "Alpha platform";
        descriptions[1] = "Beta platform";

        // Alice (100 VRT >= 50 VRT threshold) creates a proposal
        vm.prank(alice);
        uint256 propId = dao.proposeElection(
            "Community Safety Committee",
            "Decentralized proposal for safety lead",
            block.timestamp + 100,
            block.timestamp + 1000,
            names,
            descriptions
        );
        assertEq(propId, 1);

        // Alice supports proposal (100 VRT)
        vm.prank(alice);
        dao.supportProposal(propId);

        VeritasDAO.ElectionProposal memory prop = dao.getProposal(propId);
        assertEq(prop.supportWeight, 100 * 10 ** 18);
        assertEq(uint8(prop.status), uint8(VeritasDAO.ProposalStatus.Active));

        // Bob supports proposal (50 VRT) -> Total = 150 VRT >= 150 VRT threshold -> Approved!
        vm.prank(bob);
        dao.supportProposal(propId);

        prop = dao.getProposal(propId);
        assertEq(prop.supportWeight, 150 * 10 ** 18);
        assertEq(uint8(prop.status), uint8(VeritasDAO.ProposalStatus.Approved));

        // Execute approved proposal -> Creates real election with candidates
        uint256 newElectionId = dao.executeApprovedProposal(propId);
        assertEq(newElectionId, 1);

        VeritasDAO.Election memory created = dao.getElection(newElectionId);
        assertEq(created.title, "Community Safety Committee");
        assertEq(created.candidateCount, 2);

        VeritasDAO.Candidate[] memory cList = dao.getCandidates(newElectionId);
        assertEq(cList[0].name, "Community Candidate Alpha");
        assertEq(cList[1].name, "Community Candidate Beta");
    }

    // =========================================================================
    // 7. FAUCET TEST
    // =========================================================================

    function test_TokenFaucet() public {
        address newTester = address(0x7777);
        assertEq(token.balanceOf(newTester), 0);

        vm.prank(newTester);
        token.claimFaucet();
        assertEq(token.balanceOf(newTester), 100 * 10 ** 18);

        // Cannot claim immediately (cooldown)
        vm.prank(newTester);
        vm.expectRevert("Faucet cooldown active. Please wait.");
        token.claimFaucet();

        // Warp after cooldown
        vm.warp(block.timestamp + 61);
        vm.prank(newTester);
        token.claimFaucet();
        assertEq(token.balanceOf(newTester), 200 * 10 ** 18);
    }
}
