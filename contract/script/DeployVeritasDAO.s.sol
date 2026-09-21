// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/VeritasGovernanceToken.sol";
import "../src/VeritasDAO.sol";

contract DeployVeritasDAO is Script {
    function run() external {
        uint256 deployerPrivateKey;
        try vm.envUint("PRIVATE_KEY") returns (uint256 key) {
            deployerPrivateKey = key;
        } catch {
            bytes32 keyBytes = vm.envBytes32("PRIVATE_KEY");
            deployerPrivateKey = uint256(keyBytes);
        }
        address deployer = vm.addr(deployerPrivateKey);

        console.log("--------------------------------------------------");
        console.log("Deploying VeritasDAO from:", deployer);
        console.log("Chain ID:", block.chainid);
        console.log("--------------------------------------------------");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Governance Token (VRT)
        VeritasGovernanceToken token = new VeritasGovernanceToken(deployer);
        console.log("VeritasGovernanceToken deployed at:", address(token));

        // 2. Deploy VeritasDAO
        VeritasDAO dao = new VeritasDAO(address(token), deployer);
        console.log("VeritasDAO deployed at:", address(dao));

        // 3. Register deployer as voter & mint tokens
        dao.registerVoter();
        console.log("Deployer registered as voter in VeritasDAO.");

        // 4. Create Initial Sequential Elections
        // Election #1 (Concluded / Historical Showcase)
        uint256 e1Start = block.timestamp;
        uint256 e1End = block.timestamp + 1 days;
        uint256 e1 = dao.createElection(
            "Genesis Governance Council 2026",
            "Inaugural election to appoint the VeritasDAO Core Governance Council.",
            e1Start,
            e1End
        );
        dao.addCandidate(e1, "Alice Montgomery", "Senior Protocol Architect & Governance Lead");
        dao.addCandidate(e1, "Bob Richardson", "DeFi Operations & Treasury Strategist");
        dao.addCandidate(e1, "Charlie Vance", "Smart Contract Security Auditor");
        dao.openElection(e1);
        
        // Cast vote from deployer for Alice
        dao.vote(e1, 1);
        
        // Close and Finalize Election 1 so it permanently populates immutable history
        dao.closeElection(e1);
        dao.finalizeElection(e1);
        console.log("Election #1 created, voted, closed, and finalized.");

        // Election #2 (Active / Open for Live Voting)
        uint256 e2Start = block.timestamp;
        uint256 e2End = block.timestamp + 7 days;
        uint256 e2 = dao.createElection(
            "Treasury Capital Allocation Committee",
            "Elect the committee responsible for allocating 500,000 BOT from the DAO Treasury across liquidity and developer bounties.",
            e2Start,
            e2End
        );
        dao.addCandidate(e2, "David Sterling", "Fintech Quant & Liquidity Manager");
        dao.addCandidate(e2, "Elena Rostova", "Community Treasury Officer & Transparency Advocate");
        dao.addCandidate(e2, "Franklin Hayes", "Risk Management & Protocol Reserves Specialist");
        dao.openElection(e2);
        console.log("Election #2 created and opened for live voting.");

        // Election #3 (Upcoming / Created State)
        uint256 e3Start = block.timestamp + 2 days;
        uint256 e3End = block.timestamp + 9 days;
        uint256 e3 = dao.createElection(
            "Ecosystem Grants & Bounties Reviewer",
            "Selecting independent reviewers for Q4 Web3 Developer Grant Submissions.",
            e3Start,
            e3End
        );
        dao.addCandidate(e3, "Grace Hopper", "Developer Relations & SDK Lead");
        dao.addCandidate(e3, "Henry Higgins", "Open-Source Infrastructure Engineer");
        console.log("Election #3 created in setup stage.");

        // 5. Seed a Community Proposal (Stretch Goal)
        string[] memory propCandidates = new string[](2);
        propCandidates[0] = "Sarah Connor";
        propCandidates[1] = "John Connor";
        string[] memory propDescs = new string[](2);
        propDescs[0] = "AI Security & Defense Lead";
        propDescs[1] = "Resistance & Community Coordination";

        uint256 p1 = dao.proposeElection(
            "AI Security Audit Working Group",
            "Community-initiated proposal to establish an ongoing AI smart-contract audit committee.",
            block.timestamp + 3 days,
            block.timestamp + 10 days,
            propCandidates,
            propDescs
        );
        dao.supportProposal(p1);
        console.log("Decentralized Proposal #1 created and supported.");

        vm.stopBroadcast();

        console.log("--------------------------------------------------");
        console.log("DEPLOYMENT COMPLETE!");
        console.log("VRT Token:", address(token));
        console.log("VeritasDAO:", address(dao));
        console.log("--------------------------------------------------");
    }
}

