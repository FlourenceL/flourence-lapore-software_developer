// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Wojak
 * @dev Simple ERC-20 token with minting capability
 */
contract Wojak is ERC20, Ownable {
    
    // Constructor runs once when contract is deployed
    constructor() ERC20("Wojak", "WJK") Ownable(msg.sender) {
        // Mint 1000 tokens to the deployer (1000 * 10^18 because of 18 decimals)
        _mint(msg.sender, 10000 * 10**decimals());
    }
    
    /**
     * @dev Mint new tokens - only owner can call this
     * @param to Address to receive the minted tokens
     * @param amount Amount of tokens to mint (in wei units)
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Transfer tokens to another address
     * This is already implemented in ERC20, but shown here for clarity
     * @param to Recipient address
     * @param amount Amount to transfer
     */
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Burn tokens from the caller's account
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}