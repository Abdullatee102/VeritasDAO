// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VeritasGovernanceToken
 * @dev ERC-20 governance token for VeritasDAO weighted voting.
 * Symbol: VRT
 * Decimals: 18
 */
contract VeritasGovernanceToken is ERC20, Ownable {
    uint256 public constant FAUCET_AMOUNT = 100 * 10 ** 18; // 100 VRT per faucet claim
    uint256 public constant FAUCET_COOLDOWN = 60; // 60 seconds cooldown per address

    mapping(address => uint256) public lastFaucetClaim;

    event FaucetClaimed(address indexed recipient, uint256 amount, uint256 timestamp);

    constructor(address initialOwner) ERC20("Veritas Governance Token", "VRT") Ownable(initialOwner) {
        // Mint initial governance supply to owner (1,000,000 VRT)
        _mint(initialOwner, 1_000_000 * 10 ** 18);
    }

    /**
     * @notice Allows any user to claim testnet governance tokens to participate in voting
     */
    function claimFaucet() external {
        require(
            lastFaucetClaim[msg.sender] == 0 || block.timestamp >= lastFaucetClaim[msg.sender] + FAUCET_COOLDOWN,
            "Faucet cooldown active. Please wait."
        );
        lastFaucetClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT, block.timestamp);
    }

    /**
     * @notice Allows claiming a specified amount of tokens to a specific address (for testing / initial distribution)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

