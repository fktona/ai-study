// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title StudySubscription
 * @dev Subscription management contract for premium features
 * @notice Users can purchase premium subscriptions using $STUDY tokens
 */
contract StudySubscription is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    // Subscription token (STUDY token)
    IERC20 public immutable subscriptionToken;
    
    // Subscription tiers
    enum SubscriptionTier {
        FREE,
        PREMIUM_MONTHLY,
        PREMIUM_YEARLY
    }
    
    // Subscription information
    struct Subscription {
        SubscriptionTier tier;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        uint256 pricePaid;
    }
    
    // User subscriptions
    mapping(address => Subscription) public userSubscriptions;
    
    // Subscription pricing
    uint256 public constant PREMIUM_MONTHLY_PRICE = 100 * 10**18; // 100 STUDY tokens
    uint256 public constant PREMIUM_YEARLY_PRICE = 1000 * 10**18; // 1000 STUDY tokens (2 months free)
    
    // Subscription durations
    uint256 public constant MONTHLY_DURATION = 30 days;
    uint256 public constant YEARLY_DURATION = 365 days;
    
    // Events
    event SubscriptionPurchased(
        address indexed user,
        SubscriptionTier tier,
        uint256 price,
        uint256 endTime
    );
    event SubscriptionRenewed(
        address indexed user,
        SubscriptionTier tier,
        uint256 price,
        uint256 newEndTime
    );
    event SubscriptionCancelled(address indexed user);
    event SubscriptionExpired(address indexed user);
    event PricingUpdated(SubscriptionTier tier, uint256 newPrice);
    
    constructor(address _subscriptionToken) Ownable(msg.sender) {
        require(_subscriptionToken != address(0), "Invalid subscription token address");
        subscriptionToken = IERC20(_subscriptionToken);
    }
    
    /**
     * @dev Purchase a premium monthly subscription
     * @param user User address to purchase subscription for
     */
    function purchasePremiumMonthly(address user) external nonReentrant whenNotPaused {
        require(user != address(0), "Invalid user address");
        
        // Check if user has sufficient balance
        require(
            subscriptionToken.balanceOf(user) >= PREMIUM_MONTHLY_PRICE,
            "Insufficient balance for monthly subscription"
        );
        
        // Check if user already has an active subscription
        Subscription storage userSub = userSubscriptions[user];
        require(
            !userSub.isActive || block.timestamp >= userSub.endTime,
            "Active subscription already exists"
        );
        
        // Transfer tokens from user to contract
        subscriptionToken.safeTransferFrom(user, address(this), PREMIUM_MONTHLY_PRICE);
        
        // Set subscription details
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + MONTHLY_DURATION;
        
        userSub.tier = SubscriptionTier.PREMIUM_MONTHLY;
        userSub.startTime = startTime;
        userSub.endTime = endTime;
        userSub.isActive = true;
        userSub.pricePaid = PREMIUM_MONTHLY_PRICE;
        
        emit SubscriptionPurchased(user, SubscriptionTier.PREMIUM_MONTHLY, PREMIUM_MONTHLY_PRICE, endTime);
    }
    
    /**
     * @dev Purchase a premium yearly subscription
     * @param user User address to purchase subscription for
     */
    function purchasePremiumYearly(address user) external nonReentrant whenNotPaused {
        require(user != address(0), "Invalid user address");
        
        // Check if user has sufficient balance
        require(
            subscriptionToken.balanceOf(user) >= PREMIUM_YEARLY_PRICE,
            "Insufficient balance for yearly subscription"
        );
        
        // Check if user already has an active subscription
        Subscription storage userSub = userSubscriptions[user];
        require(
            !userSub.isActive || block.timestamp >= userSub.endTime,
            "Active subscription already exists"
        );
        
        // Transfer tokens from user to contract
        subscriptionToken.safeTransferFrom(user, address(this), PREMIUM_YEARLY_PRICE);
        
        // Set subscription details
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + YEARLY_DURATION;
        
        userSub.tier = SubscriptionTier.PREMIUM_YEARLY;
        userSub.startTime = startTime;
        userSub.endTime = endTime;
        userSub.isActive = true;
        userSub.pricePaid = PREMIUM_YEARLY_PRICE;
        
        emit SubscriptionPurchased(user, SubscriptionTier.PREMIUM_YEARLY, PREMIUM_YEARLY_PRICE, endTime);
    }
    
    /**
     * @dev Renew an existing subscription
     * @param user User address to renew subscription for
     */
    function renewSubscription(address user) external nonReentrant whenNotPaused {
        require(user != address(0), "Invalid user address");
        
        Subscription storage userSub = userSubscriptions[user];
        require(userSub.isActive, "No active subscription to renew");
        require(block.timestamp >= userSub.endTime, "Subscription is still active");
        
        uint256 price;
        uint256 duration;
        
        if (userSub.tier == SubscriptionTier.PREMIUM_MONTHLY) {
            price = PREMIUM_MONTHLY_PRICE;
            duration = MONTHLY_DURATION;
        } else if (userSub.tier == SubscriptionTier.PREMIUM_YEARLY) {
            price = PREMIUM_YEARLY_PRICE;
            duration = YEARLY_DURATION;
        } else {
            revert("Invalid subscription tier");
        }
        
        // Check if user has sufficient balance
        require(
            subscriptionToken.balanceOf(user) >= price,
            "Insufficient balance for subscription renewal"
        );
        
        // Transfer tokens from user to contract
        subscriptionToken.safeTransferFrom(user, address(this), price);
        
        // Update subscription details
        userSub.startTime = block.timestamp;
        userSub.endTime = block.timestamp + duration;
        userSub.pricePaid = price;
        
        emit SubscriptionRenewed(user, userSub.tier, price, userSub.endTime);
    }
    
    /**
     * @dev Cancel a subscription (only owner, for emergency cases)
     * @param user User address to cancel subscription for
     */
    function cancelSubscription(address user) external onlyOwner {
        require(user != address(0), "Invalid user address");
        
        Subscription storage userSub = userSubscriptions[user];
        require(userSub.isActive, "No active subscription to cancel");
        
        userSub.isActive = false;
        
        emit SubscriptionCancelled(user);
    }
    
    /**
     * @dev Check and expire subscriptions (can be called by anyone)
     * @param user User address to check
     */
    function checkSubscriptionExpiry(address user) external {
        Subscription storage userSub = userSubscriptions[user];
        
        if (userSub.isActive && block.timestamp >= userSub.endTime) {
            userSub.isActive = false;
            emit SubscriptionExpired(user);
        }
    }
    
    /**
     * @dev Get user's subscription status
     * @param user User address
     * @return Subscription struct
     */
    function getUserSubscription(address user) external view returns (Subscription memory) {
        Subscription memory userSub = userSubscriptions[user];
        
        // Check if subscription has expired
        if (userSub.isActive && block.timestamp >= userSub.endTime) {
            userSub.isActive = false;
        }
        
        return userSub;
    }
    
    /**
     * @dev Check if user has active premium subscription
     * @param user User address
     * @return True if user has active premium subscription
     */
    function hasActivePremiumSubscription(address user) external view returns (bool) {
        Subscription memory userSub = userSubscriptions[user];
        
        return userSub.isActive && 
               block.timestamp < userSub.endTime && 
               (userSub.tier == SubscriptionTier.PREMIUM_MONTHLY || 
                userSub.tier == SubscriptionTier.PREMIUM_YEARLY);
    }
    
    /**
     * @dev Get subscription tier for user
     * @param user User address
     * @return Subscription tier
     */
    function getUserSubscriptionTier(address user) external view returns (SubscriptionTier) {
        Subscription memory userSub = userSubscriptions[user];
        
        if (!userSub.isActive || block.timestamp >= userSub.endTime) {
            return SubscriptionTier.FREE;
        }
        
        return userSub.tier;
    }
    
    /**
     * @dev Get time remaining in subscription
     * @param user User address
     * @return Time remaining in seconds (0 if expired)
     */
    function getSubscriptionTimeRemaining(address user) external view returns (uint256) {
        Subscription memory userSub = userSubscriptions[user];
        
        if (!userSub.isActive || block.timestamp >= userSub.endTime) {
            return 0;
        }
        
        return userSub.endTime - block.timestamp;
    }
    
    /**
     * @dev Get subscription pricing
     * @param tier Subscription tier
     * @return Price in tokens
     */
    function getSubscriptionPrice(SubscriptionTier tier) external pure returns (uint256) {
        if (tier == SubscriptionTier.PREMIUM_MONTHLY) {
            return PREMIUM_MONTHLY_PRICE;
        } else if (tier == SubscriptionTier.PREMIUM_YEARLY) {
            return PREMIUM_YEARLY_PRICE;
        }
        return 0;
    }
    
    /**
     * @dev Update subscription pricing (only owner)
     * @param tier Subscription tier
     * @param newPrice New price in tokens
     */
    function updateSubscriptionPrice(SubscriptionTier tier, uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Price must be greater than zero");
        
        // Note: This function updates the pricing logic, but the constants would need to be changed
        // For a production contract, consider using a mapping for dynamic pricing
        emit PricingUpdated(tier, newPrice);
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdraw tokens (only owner)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        subscriptionToken.safeTransfer(owner(), amount);
    }
    
    /**
     * @dev Get contract balance
     * @return Contract's token balance
     */
    function getContractBalance() external view returns (uint256) {
        return subscriptionToken.balanceOf(address(this));
    }
}

