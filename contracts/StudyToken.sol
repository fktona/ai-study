// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title StudyToken
 * @dev ERC-20 token for AI Study Group Nexus platform
 * @notice This token is used for rewards, subscriptions, and P2P conversions
 */
contract StudyToken is ERC20, Ownable, Pausable {
    // Token details
    uint8 private constant DECIMALS = 18;
    uint256 private constant INITIAL_SUPPLY = 1000000 * 10**DECIMALS; // 1 million tokens
    uint256 public constant MAX_SUPPLY = 10000000 * 10**DECIMALS; // 10 million max supply
    
    // Reward system
    mapping(address => uint256) public studyTimeRewards;
    mapping(address => uint256) public lastRewardClaim;
    
    // Consecutive day tracking
    mapping(address => uint256) public consecutiveStudyDays;
    mapping(address => uint256) public lastStudyDate;
    
    // Session validation
    mapping(address => uint256) public totalSessions;
    mapping(address => uint256) public completedSessions;
    mapping(address => uint256) public quizPassedSessions;
    
    // Reward rates (tokens per second)
    uint256 public constant BASE_REWARD_RATE = 1 * 10**DECIMALS / 3600; // 1 token per hour
    uint256 public constant PREMIUM_REWARD_RATE = 2 * 10**DECIMALS / 3600; // 2 tokens per hour
    uint256 public constant CONSECUTIVE_DAY_BONUS = 2 * 10**DECIMALS; // +2 tokens per consecutive day
    uint256 public constant SESSION_COMPLETION_REWARD = 10 * 10**DECIMALS; // 10 tokens for completed session
    uint256 public constant QUIZ_PASS_REWARD = 5 * 10**DECIMALS; // 5 tokens for passing quiz
    
    // Subscription prices
    uint256 public constant PREMIUM_SUBSCRIPTION_PRICE = 100 * 10**DECIMALS; // 100 tokens
    
    // Events
    event StudyRewardClaimed(address indexed user, uint256 amount, uint256 studyTime);
    event PremiumSubscriptionPurchased(address indexed user, uint256 price);
    event P2PConversion(address indexed from, address indexed to, uint256 amount);
    event ConsecutiveDayBonusClaimed(address indexed user, uint256 consecutiveDays, uint256 bonusAmount);
    event SessionCompleted(address indexed user, uint256 sessionId, uint256 reward);
    event QuizPassed(address indexed user, uint256 sessionId, uint256 reward);
    event SessionStarted(address indexed user, uint256 sessionId, uint256 timestamp);
    event BatchDistribution(uint256 recipientCount, uint256 amountPerRecipient, uint256 totalAmount);
    event BatchDistributionCustom(uint256 recipientCount, uint256 totalAmount);
    
    constructor() ERC20("Study Token", "STUDY") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Mint tokens to a user as study rewards
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mintStudyReward(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than zero");
        
        _mint(to, amount);
        emit StudyRewardClaimed(to, amount, 0);
    }

    /**
     * @dev Distribute tokens to multiple addresses (batch transfer)
     * @param recipients Array of addresses to receive tokens
     * @param amount Amount of tokens to send to each recipient
     */
    function distributeTokens(address[] calldata recipients, uint256 amount) external onlyOwner {
        require(recipients.length > 0, "Recipients array cannot be empty");
        require(amount > 0, "Amount must be greater than zero");
        
        uint256 totalAmount = amount * recipients.length;
        require(balanceOf(msg.sender) >= totalAmount, "Insufficient balance for distribution");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Cannot send to zero address");
            _transfer(msg.sender, recipients[i], amount);
        }
        
        emit BatchDistribution(recipients.length, amount, totalAmount);
    }

    /**
     * @dev Distribute tokens to multiple addresses with custom amounts
     * @param recipients Array of addresses to receive tokens
     * @param amounts Array of amounts to send to each recipient
     */
    function distributeTokensCustom(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(recipients.length > 0, "Recipients array cannot be empty");
        require(recipients.length == amounts.length, "Arrays length mismatch");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            require(amounts[i] > 0, "Amount must be greater than zero");
            totalAmount += amounts[i];
        }
        
        require(balanceOf(msg.sender) >= totalAmount, "Insufficient balance for distribution");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Cannot send to zero address");
            _transfer(msg.sender, recipients[i], amounts[i]);
        }
        
        emit BatchDistributionCustom(recipients.length, totalAmount);
    }
    
    /**
     * @dev Calculate and mint study time rewards
     * @param user User address
     * @param studyTimeSeconds Study time in seconds
     * @param isPremium Whether user has premium subscription
     */
    function claimStudyTimeReward(
        address user,
        uint256 studyTimeSeconds,
        bool isPremium
    ) external onlyOwner {
        require(user != address(0), "Invalid user address");
        require(studyTimeSeconds > 0, "Study time must be greater than zero");
        
        uint256 rewardRate = isPremium ? PREMIUM_REWARD_RATE : BASE_REWARD_RATE;
        uint256 reward = studyTimeSeconds * rewardRate;
        
        _mint(user, reward);
        studyTimeRewards[user] += reward;
        lastRewardClaim[user] = block.timestamp;
        
        emit StudyRewardClaimed(user, reward, studyTimeSeconds);
    }
    
    /**
     * @dev Purchase premium subscription
     * @param user User address
     */
    function purchasePremiumSubscription(address user) external onlyOwner {
        require(user != address(0), "Invalid user address");
        require(balanceOf(user) >= PREMIUM_SUBSCRIPTION_PRICE, "Insufficient balance");
        
        _burn(user, PREMIUM_SUBSCRIPTION_PRICE);
        emit PremiumSubscriptionPurchased(user, PREMIUM_SUBSCRIPTION_PRICE);
    }
    
    /**
     * @dev Handle P2P conversion (burn tokens from sender, mint to receiver)
     * @param from Sender address
     * @param to Receiver address
     * @param amount Amount to convert
     */
    function p2pConversion(
        address from,
        address to,
        uint256 amount
    ) external onlyOwner {
        require(from != address(0) && to != address(0), "Invalid addresses");
        require(amount > 0, "Amount must be greater than zero");
        require(balanceOf(from) >= amount, "Insufficient balance");
        
        _burn(from, amount);
        _mint(to, amount);
        
        emit P2PConversion(from, to, amount);
    }
    
    /**
     * @dev Emergency mint function for owner
     * @param to Address to mint to
     * @param amount Amount to mint
     */
    function emergencyMint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        _mint(to, amount);
    }
    
    /**
     * @dev Pause token transfers
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override transfer to include pausable functionality
     */
    function _update(address from, address to, uint256 value) internal override whenNotPaused {
        require(!paused(), "Pausable: paused");
        super._update(from, to, value);
    }
    
    /**
     * @dev Get token decimals
     */
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }
    
    /**
     * @dev Get user's total study rewards
     */
    function getUserStudyRewards(address user) external view returns (uint256) {
        return studyTimeRewards[user];
    }
    
    /**
     * @dev Get user's last reward claim timestamp
     */
    function getUserLastRewardClaim(address user) external view returns (uint256) {
        return lastRewardClaim[user];
    }
    
    /**
     * @dev Start a study session
     * @param user User address
     * @param sessionId Unique session identifier
     */
    function startSession(address user, uint256 sessionId) external onlyOwner {
        require(user != address(0), "Invalid user address");
        
        totalSessions[user]++;
        emit SessionStarted(user, sessionId, block.timestamp);
    }
    
    /**
     * @dev Complete a study session with validation
     * @param user User address
     * @param sessionId Session identifier
     * @param studyTimeSeconds Minimum 20 minutes required
     * @param hasEngagement Whether user had proper engagement
     */
    function completeSession(
        address user,
        uint256 sessionId,
        uint256 studyTimeSeconds,
        bool hasEngagement
    ) external onlyOwner {
        require(user != address(0), "Invalid user address");
        require(studyTimeSeconds >= 1200, "Minimum 20 minutes required"); // 20 minutes = 1200 seconds
        require(hasEngagement, "Must have proper engagement");
        
        completedSessions[user]++;
        
        // Update consecutive days
        _updateConsecutiveDays(user);
        
        // Calculate consecutive day bonus
        uint256 consecutiveBonus = consecutiveStudyDays[user] * CONSECUTIVE_DAY_BONUS;
        
        // Mint session completion reward + consecutive bonus
        uint256 totalReward = SESSION_COMPLETION_REWARD + consecutiveBonus;
        _mint(user, totalReward);
        
        studyTimeRewards[user] += totalReward;
        lastRewardClaim[user] = block.timestamp;
        
        emit SessionCompleted(user, sessionId, totalReward);
        if (consecutiveBonus > 0) {
            emit ConsecutiveDayBonusClaimed(user, consecutiveStudyDays[user], consecutiveBonus);
        }
    }
    
    /**
     * @dev Pass a quiz for additional rewards
     * @param user User address
     * @param sessionId Session identifier
     * @param quizScore Quiz score (0-100)
     */
    function passQuiz(
        address user,
        uint256 sessionId,
        uint256 quizScore
    ) external onlyOwner {
        require(user != address(0), "Invalid user address");
        require(quizScore >= 70, "Must score at least 70% to pass"); // 70% passing grade
        
        quizPassedSessions[user]++;
        
        // Mint quiz pass reward
        _mint(user, QUIZ_PASS_REWARD);
        studyTimeRewards[user] += QUIZ_PASS_REWARD;
        
        emit QuizPassed(user, sessionId, QUIZ_PASS_REWARD);
    }
    
    /**
     * @dev Update consecutive study days
     * @param user User address
     */
    function _updateConsecutiveDays(address user) internal {
        uint256 currentDay = block.timestamp / 1 days;
        uint256 lastDay = lastStudyDate[user];
        
        if (lastDay == 0) {
            // First study day
            consecutiveStudyDays[user] = 1;
        } else if (currentDay == lastDay) {
            // Same day, no change
            return;
        } else if (currentDay == lastDay + 1) {
            // Consecutive day
            consecutiveStudyDays[user]++;
        } else {
            // Streak broken, reset to 1
            consecutiveStudyDays[user] = 1;
        }
        
        lastStudyDate[user] = currentDay;
    }
    
    /**
     * @dev Claim consecutive day bonus
     * @param user User address
     */
    function claimConsecutiveDayBonus(address user) external onlyOwner {
        require(user != address(0), "Invalid user address");
        require(consecutiveStudyDays[user] > 0, "No consecutive days");
        
        uint256 bonus = consecutiveStudyDays[user] * CONSECUTIVE_DAY_BONUS;
        _mint(user, bonus);
        
        emit ConsecutiveDayBonusClaimed(user, consecutiveStudyDays[user], bonus);
    }
    
    /**
     * @dev Get user's consecutive study days
     * @param user User address
     * @return Consecutive days count
     */
    function getUserConsecutiveDays(address user) external view returns (uint256) {
        return consecutiveStudyDays[user];
    }
    
    /**
     * @dev Get user's session statistics
     * @param user User address
     * @return totalSessionsCount Total sessions started
     * @return completedSessionsCount Completed sessions
     * @return quizPassedSessionsCount Sessions with passed quizzes
     */
    function getUserSessionStats(address user) external view returns (
        uint256 totalSessionsCount,
        uint256 completedSessionsCount,
        uint256 quizPassedSessionsCount
    ) {
        return (
            totalSessions[user],
            completedSessions[user],
            quizPassedSessions[user]
        );
    }
    
    /**
     * @dev Get user's last study date
     * @param user User address
     * @return Last study date timestamp
     */
    function getUserLastStudyDate(address user) external view returns (uint256) {
        return lastStudyDate[user];
    }
}
