// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./StudyToken.sol";

/**
 * @title StudyTokenShop
 * @dev Self-adjusting token shop with demand-responsive pricing
 * @notice Allows users to buy STUDY tokens with Base ETH at market-driven prices
 */
contract StudyTokenShop is Ownable, Pausable, ReentrancyGuard {
    StudyToken public studyToken;
    
    // Pricing mechanism
    uint256 public basePrice = 0.0001 ether; // Starting price: 1 ETH = 10,000 STUDY
    uint256 public currentPrice = 0.0001 ether;
    uint256 public constant MIN_PRICE = 0.00005 ether; // 1 ETH = 20,000 STUDY (max)
    uint256 public constant MAX_PRICE = 0.001 ether; // 1 ETH = 1,000 STUDY (min)
    
    // Demand tracking
    uint256 public dailyVolume;
    uint256 public dailyPurchases;
    uint256 public lastReset;
    uint256 public constant VOLUME_THRESHOLD_HIGH = 50 ether;
    uint256 public constant VOLUME_THRESHOLD_LOW = 5 ether;
    
    // Price adjustment parameters
    uint256 public constant PRICE_INCREASE_RATE = 110; // 10% increase
    uint256 public constant PRICE_DECREASE_RATE = 90; // 10% decrease
    
    // Statistics
    uint256 public totalSold;
    uint256 public totalRevenue;
    uint256 public totalBuyers;
    
    // Events
    event TokensPurchased(address indexed buyer, uint256 ethAmount, uint256 tokenAmount, uint256 price);
    event PriceUpdated(uint256 oldPrice, uint256 newPrice, uint256 dailyVolume);
    event DailyReset(uint256 timestamp, uint256 volume, uint256 purchases);
    
    constructor(address _studyToken) Ownable(msg.sender) {
        studyToken = StudyToken(_studyToken);
        lastReset = block.timestamp;
    }
    
    /**
     * @dev Buy STUDY tokens with Base ETH
     */
    function buyTokens() external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Must send ETH");
        require(msg.value >= 0.001 ether, "Minimum purchase: 0.001 ETH");
        
        // Reset daily counters if needed
        _resetIfNeeded();
        
        // Update demand tracking
        dailyVolume += msg.value;
        dailyPurchases++;
        
        // Calculate tokens based on current price
        // Use precise calculation: (msg.value * 1e18) / currentPrice
        // This gives us the exact number of tokens in wei
        uint256 tokenAmountWithDecimals = (msg.value * 1e18) / currentPrice;
        require(tokenAmountWithDecimals > 0, "Insufficient ETH for tokens");
        
        // Check if shop has enough tokens
        require(
            studyToken.balanceOf(address(this)) >= tokenAmountWithDecimals,
            "Shop has insufficient tokens"
        );
        
        // Transfer existing tokens to buyer
        studyToken.transfer(msg.sender, tokenAmountWithDecimals);
        
        // Update statistics
        totalSold += tokenAmountWithDecimals;
        totalRevenue += msg.value;
        totalBuyers++;
        
        // Adjust price based on demand
        _adjustPrice();
        
        // Send ETH to owner
        payable(owner()).transfer(msg.value);
        
        emit TokensPurchased(msg.sender, msg.value, tokenAmountWithDecimals, currentPrice);
    }
    
    /**
     * @dev Reset daily counters if 24 hours have passed
     */
    function _resetIfNeeded() internal {
        if (block.timestamp >= lastReset + 1 days) {
            emit DailyReset(lastReset, dailyVolume, dailyPurchases);
            
            dailyVolume = 0;
            dailyPurchases = 0;
            lastReset = block.timestamp;
            
            // Slight price decay overnight to encourage activity
            if (currentPrice > basePrice) {
                currentPrice = currentPrice * 95 / 100; // 5% decrease
                if (currentPrice < basePrice) {
                    currentPrice = basePrice;
                }
            }
        }
    }
    
    /**
     * @dev Adjust price based on daily demand
     */
    function _adjustPrice() internal {
        uint256 oldPrice = currentPrice;
        
        if (dailyVolume >= VOLUME_THRESHOLD_HIGH) {
            // High demand - increase price
            currentPrice = (currentPrice * PRICE_INCREASE_RATE) / 100;
            if (currentPrice > MAX_PRICE) {
                currentPrice = MAX_PRICE;
            }
        } else if (dailyVolume <= VOLUME_THRESHOLD_LOW && dailyPurchases > 0) {
            // Low demand - decrease price
            currentPrice = (currentPrice * PRICE_DECREASE_RATE) / 100;
            if (currentPrice < MIN_PRICE) {
                currentPrice = MIN_PRICE;
            }
        }
        
        if (oldPrice != currentPrice) {
            emit PriceUpdated(oldPrice, currentPrice, dailyVolume);
        }
    }
    
    /**
     * @dev Get current price information
     */
    function getPriceInfo() external view returns (
        uint256 price,
        uint256 tokensPerEth,
        uint256 dailyVol,
        uint256 dailyPurchasesCount,
        uint256 timeUntilReset
    ) {
        timeUntilReset = lastReset + 1 days - block.timestamp;
        if (timeUntilReset > 1 days) timeUntilReset = 0;
        return (
            currentPrice,
            1 ether / currentPrice,
            dailyVolume,
            dailyPurchases,
            timeUntilReset
        );
    }
    
    /**
     * @dev Get purchase quote without executing
     */
    function getQuote(uint256 ethAmount) external view returns (uint256 tokenAmount) {
        return (ethAmount * 1e18) / currentPrice;
    }
    
    /**
     * @dev Emergency functions
     */
    function setBasePrice(uint256 newBasePrice) external onlyOwner {
        require(newBasePrice >= MIN_PRICE && newBasePrice <= MAX_PRICE, "Price out of bounds");
        basePrice = newBasePrice;
    }
    
    function setCurrentPrice(uint256 newPrice) external onlyOwner {
        require(newPrice >= MIN_PRICE && newPrice <= MAX_PRICE, "Price out of bounds");
        currentPrice = newPrice;
    }
    
    function forceReset() external onlyOwner {
        _resetIfNeeded();
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdrawal (shouldn't be needed)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
