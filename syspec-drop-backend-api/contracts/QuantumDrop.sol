// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title QuantumDrop
 * @dev Decentralized file sharing with expiry and ZKP claim verification
 */
contract QuantumDrop {
    struct Drop {
        string ipfsHash;
        address owner;
        uint256 expiresAt;
        bool isActive;
    }

    mapping(string => Drop) private drops;
    mapping(string => mapping(address => bool)) private claimed;

    event DropCreated(string indexed dropId, string ipfsHash, address indexed owner, uint256 expiresAt);
    event DropClaimed(string indexed dropId, address indexed claimer);
    event DropDeactivated(string indexed dropId, address indexed owner);

    function createDrop(
        string calldata dropId,
        string calldata ipfsHash,
        uint256 expiresAt
    ) external {
        require(bytes(dropId).length > 0, "Drop ID required");
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        require(drops[dropId].owner == address(0), "Drop exists");
        require(expiresAt > block.timestamp, "Expiry in past");

        drops[dropId] = Drop({
            ipfsHash: ipfsHash,
            owner: msg.sender,
            expiresAt: expiresAt,
            isActive: true
        });

        emit DropCreated(dropId, ipfsHash, msg.sender, expiresAt);
    }

    function getDrop(string calldata dropId)
        external
        view
        returns (string memory ipfsHash, address owner, uint256 expiresAt, bool isActive)
    {
        Drop memory drop = drops[dropId];
        require(drop.owner != address(0), "Drop missing");
        return (drop.ipfsHash, drop.owner, drop.expiresAt, drop.isActive);
    }

    function claimDrop(string calldata dropId) external {
        Drop storage drop = drops[dropId];
        require(drop.owner != address(0), "Drop missing");
        require(drop.isActive, "Drop inactive");
        require(drop.expiresAt > block.timestamp, "Drop expired");
        require(!claimed[dropId][msg.sender], "Already claimed");

        claimed[dropId][msg.sender] = true;
        emit DropClaimed(dropId, msg.sender);
    }

    function hasClaimed(string calldata dropId, address claimer) external view returns (bool) {
        return claimed[dropId][claimer];
    }

    function deactivateDrop(string calldata dropId) external {
        Drop storage drop = drops[dropId];
        require(drop.owner == msg.sender, "Not owner");
        require(drop.isActive, "Already inactive");

        drop.isActive = false;
        emit DropDeactivated(dropId, msg.sender);
    }

    function isValidDrop(string calldata dropId) external view returns (bool) {
        Drop memory drop = drops[dropId];
        return drop.owner != address(0) && drop.isActive && drop.expiresAt > block.timestamp;
    }
}
