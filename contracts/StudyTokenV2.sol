// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title StudyTokenV2 - Enhanced tokenomics for value accrual
 * @dev Improved version with deflationary mechanisms and revenue sharing
 */
contract StudyTokenV2 is ERC20, Ownable, Pausable {
    uint8 private constant DECIMALS = 18;
    uint256 private constant INITIAL_SUPPLY = 1000000 * 10**DECIMALS;
    uint256 public constant MAX_SUPPLY = 10000000 * 10**DECIMALS; // 10M max supply
    
    // Deflationary mechanisms
    uint256 public totalBurned;
    uint256 public buybackReserve;
    
    // Revenue sharing
    mapping(address => uint256) public stakingBalance;
    uint256 public totalStaked;
    uint256 public revenuePool;
    
    // Fee structure
    uint256 public constant TRANSFER_FEE = 100; // 1% (100/10000)
    uint256 public constant BURN_FEE = 50; // 0.5% (50/10000)
    uint256 public constant REVENUE_FEE = 50; // 0.5% (50/10000)
    
    // Events
    event TokensBurned(uint256 amount);
    event BuybackExecuted(uint256 amount);
    event RevenueDistributed(uint256 amount);
    event TokensStaked(address indexed user, uint256 amount);
    event TokensUnstaked(address indexed user, uint256 amount);
    
    constructor() ERC20("Study Token V2", "STUDYV2") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Override transfer to include deflationary fees
     */
    function _update(address from, address to, uint256 value) internal override whenNotPaused {
        if (from != address(0) && to != address(0) && from != owner()) {
            uint256 burnAmount = (value * BURN_FEE) / 10000;
            uint256 revenueAmount = (value * REVENUE_FEE) / 10000;
            
            if (burnAmount > 0) {
                _burn(from, burnAmount);
                totalBurned += burnAmount;
                emit TokensBurned(burnAmount);
            }
            
            if (revenueAmount > 0) {
                _transfer(from, address(this), revenueAmount);
                revenuePool += revenueAmount;
            }
            
            value = value - burnAmount - revenueAmount;
        }
        
        super._update(from, to, value);
    }
    
    /**
     * @dev Stake tokens to earn revenue share
     */
    function stake(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _transfer(msg.sender, address(this), amount);
        stakingBalance[msg.sender] += amount;
        totalStaked += amount;
        
        emit TokensStaked(msg.sender, amount);
    }
    
    /**
     * @dev Unstake tokens
     */
    function unstake(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        require(stakingBalance[msg.sender] >= amount, "Insufficient staked balance");
        
        stakingBalance[msg.sender] -= amount;
        totalStaked -= amount;
        _transfer(address(this), msg.sender, amount);
        
        emit TokensUnstaked(msg.sender, amount);
    }
    
    /**
     * @dev Claim revenue share based on staked tokens
     */
    function claimRevenueShare() external {
        require(stakingBalance[msg.sender] > 0, "No staked tokens");
        
        uint256 share = (revenuePool * stakingBalance[msg.sender]) / totalStaked;
        require(share > 0, "No revenue to claim");
        
        revenuePool -= share;
        _transfer(address(this), msg.sender, share);
        
        emit RevenueDistributed(share);
    }
    
    /**
     * @dev Buy back tokens from market and burn them
     */
    function executeBuyback(uint256 amount) external onlyOwner {
        require(amount <= buybackReserve, "Insufficient buyback reserve");
        
        // In real implementation, this would buy from DEX
        // For now, we'll burn from the contract's balance
        require(balanceOf(address(this)) >= amount, "Insufficient contract balance");
        
        _burn(address(this), amount);
        buybackReserve -= amount;
        totalBurned += amount;
        
        emit BuybackExecuted(amount);
    }
    
    /**
     * @dev Add funds to buyback reserve
     */
    function addToBuybackReserve(uint256 amount) external onlyOwner {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        _transfer(msg.sender, address(this), amount);
        buybackReserve += amount;
    }
    
    /**
     * @dev Emergency mint (limited to max supply)
     */
    function emergencyMint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        _mint(to, amount);
    }
    
    /**
     * @dev Get user's revenue share
     */
    function getUserRevenueShare(address user) external view returns (uint256) {
        if (totalStaked == 0) return 0;
        return (revenuePool * stakingBalance[user]) / totalStaked;
    }
    
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }
}
