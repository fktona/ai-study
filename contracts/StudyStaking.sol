// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title StudyStaking
 * @dev Staking contract for $STUDY tokens with reward distribution
 * @notice Users can stake $STUDY tokens to earn rewards over time
 */
contract StudyStaking is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    // Staking token (STUDY token)
    IERC20 public immutable stakingToken;
    
    // Staking pool information
    struct StakingPool {
        uint256 totalStaked;
        uint256 rewardRate; // tokens per second
        uint256 lastUpdateTime;
        uint256 rewardPerTokenStored;
        bool isActive;
    }
    
    // User staking information
    struct UserStake {
        uint256 amount;
        uint256 rewardDebt;
        uint256 lastStakeTime;
        uint256 totalRewardsClaimed;
    }
    
    // Pool ID to pool mapping
    mapping(uint256 => StakingPool) public stakingPools;
    
    // User address to pool ID to stake mapping
    mapping(address => mapping(uint256 => UserStake)) public userStakes;
    
    // Pool IDs
    uint256 public constant SHORT_TERM_POOL = 0; // 7 days, 12% APY
    uint256 public constant MEDIUM_TERM_POOL = 1; // 30 days, 15% APY
    uint256 public constant LONG_TERM_POOL = 2; // 90 days, 20% APY
    
    // Pool configurations
    uint256 public constant SHORT_TERM_DURATION = 7 days;
    uint256 public constant MEDIUM_TERM_DURATION = 30 days;
    uint256 public constant LONG_TERM_DURATION = 90 days;
    
    // Events
    event Staked(address indexed user, uint256 indexed poolId, uint256 amount);
    event Unstaked(address indexed user, uint256 indexed poolId, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 indexed poolId, uint256 amount);
    event PoolCreated(uint256 indexed poolId, uint256 rewardRate);
    event PoolUpdated(uint256 indexed poolId, uint256 newRewardRate);
    
    constructor(address _stakingToken) Ownable(msg.sender) {
        require(_stakingToken != address(0), "Invalid staking token address");
        stakingToken = IERC20(_stakingToken);
        
        // Initialize pools with default reward rates
        _initializePools();
    }
    
    /**
     * @dev Initialize staking pools
     */
    function _initializePools() private {
        // Short term pool: 12% APY (0.12 * 10^18 / (365 * 24 * 3600) / 10^3 = 3805175)
        stakingPools[SHORT_TERM_POOL] = StakingPool({
            totalStaked: 0,
            rewardRate: 380517500, // 12% APY per token
            lastUpdateTime: block.timestamp,
            rewardPerTokenStored: 0,
            isActive: true
        });
        
        // Medium term pool: 15% APY (0.15 * 10^18 / (365 * 24 * 3600) / 10^3 = 4756468)
        stakingPools[MEDIUM_TERM_POOL] = StakingPool({
            totalStaked: 0,
            rewardRate: 475646800, // 15% APY per token
            lastUpdateTime: block.timestamp,
            rewardPerTokenStored: 0,
            isActive: true
        });
        
        // Long term pool: 20% APY (0.20 * 10^18 / (365 * 24 * 3600) / 10^3 = 6341958)
        stakingPools[LONG_TERM_POOL] = StakingPool({
            totalStaked: 0,
            rewardRate: 634195800, // 20% APY per token
            lastUpdateTime: block.timestamp,
            rewardPerTokenStored: 0,
            isActive: true
        });
    }
    
    /**
     * @dev Stake tokens in a specific pool
     * @param poolId Pool ID to stake in
     * @param amount Amount of tokens to stake
     */
    function stake(uint256 poolId, uint256 amount) external nonReentrant whenNotPaused {
        require(stakingPools[poolId].isActive, "Pool is not active");
        require(amount > 0, "Amount must be greater than zero");
        
        StakingPool storage pool = stakingPools[poolId];
        UserStake storage userStake = userStakes[msg.sender][poolId];
        
        // Update pool rewards
        _updatePoolRewards(poolId);
        
        // If user has existing stake, calculate and add pending rewards
        if (userStake.amount > 0) {
            uint256 pendingRewards = _calculatePendingRewards(msg.sender, poolId);
            if (pendingRewards > 0) {
                userStake.totalRewardsClaimed += pendingRewards;
                stakingToken.safeTransfer(msg.sender, pendingRewards);
                emit RewardsClaimed(msg.sender, poolId, pendingRewards);
            }
        }
        
        // Transfer tokens from user to contract
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Update user stake
        userStake.amount += amount;
        userStake.rewardDebt = (userStake.amount * pool.rewardPerTokenStored) / 1e18;
        userStake.lastStakeTime = block.timestamp;
        
        // Update pool
        pool.totalStaked += amount;
        
        emit Staked(msg.sender, poolId, amount);
    }
    
    /**
     * @dev Unstake tokens from a specific pool
     * @param poolId Pool ID to unstake from
     * @param amount Amount of tokens to unstake
     */
    function unstake(uint256 poolId, uint256 amount) external nonReentrant whenNotPaused {
        require(stakingPools[poolId].isActive, "Pool is not active");
        require(amount > 0, "Amount must be greater than zero");
        
        StakingPool storage pool = stakingPools[poolId];
        UserStake storage userStake = userStakes[msg.sender][poolId];
        
        require(userStake.amount >= amount, "Insufficient staked amount");
        
        // Check minimum staking duration
        require(
            block.timestamp >= userStake.lastStakeTime + _getPoolDuration(poolId),
            "Minimum staking duration not met"
        );
        
        // Update pool rewards
        _updatePoolRewards(poolId);
        
        // Calculate and claim pending rewards
        uint256 pendingRewards = _calculatePendingRewards(msg.sender, poolId);
        if (pendingRewards > 0) {
            userStake.totalRewardsClaimed += pendingRewards;
            stakingToken.safeTransfer(msg.sender, pendingRewards);
            emit RewardsClaimed(msg.sender, poolId, pendingRewards);
        }
        
        // Update user stake
        userStake.amount -= amount;
        userStake.rewardDebt = (userStake.amount * pool.rewardPerTokenStored) / 1e18;
        
        // Update pool
        pool.totalStaked -= amount;
        
        // Transfer tokens back to user
        stakingToken.safeTransfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, poolId, amount);
    }
    
    /**
     * @dev Claim pending rewards without unstaking
     * @param poolId Pool ID to claim rewards from
     */
    function claimRewards(uint256 poolId) external nonReentrant whenNotPaused {
        require(stakingPools[poolId].isActive, "Pool is not active");
        
        UserStake storage userStake = userStakes[msg.sender][poolId];
        require(userStake.amount > 0, "No staked tokens");
        
        // Update pool rewards
        _updatePoolRewards(poolId);
        
        // Calculate and claim pending rewards
        uint256 pendingRewards = _calculatePendingRewards(msg.sender, poolId);
        require(pendingRewards > 0, "No rewards to claim");
        
        userStake.totalRewardsClaimed += pendingRewards;
        userStake.rewardDebt = (userStake.amount * stakingPools[poolId].rewardPerTokenStored) / 1e18;
        
        stakingToken.safeTransfer(msg.sender, pendingRewards);
        
        emit RewardsClaimed(msg.sender, poolId, pendingRewards);
    }
    
    /**
     * @dev Update pool rewards
     * @param poolId Pool ID to update
     */
    function _updatePoolRewards(uint256 poolId) internal {
        StakingPool storage pool = stakingPools[poolId];
        
        if (block.timestamp <= pool.lastUpdateTime) {
            return;
        }
        
        if (pool.totalStaked == 0) {
            pool.lastUpdateTime = block.timestamp;
            return;
        }
        
        uint256 timeElapsed = block.timestamp - pool.lastUpdateTime;
        uint256 rewards = timeElapsed * pool.rewardRate;
        
        pool.rewardPerTokenStored += (rewards * 1e18) / pool.totalStaked;
        pool.lastUpdateTime = block.timestamp;
    }
    
    /**
     * @dev Calculate pending rewards for a user
     * @param user User address
     * @param poolId Pool ID
     * @return Pending rewards amount
     */
    function _calculatePendingRewards(address user, uint256 poolId) internal view returns (uint256) {
        UserStake memory userStake = userStakes[user][poolId];
        if (userStake.amount == 0) {
            return 0;
        }
        
        StakingPool memory pool = stakingPools[poolId];
        
        uint256 currentRewardPerToken = pool.rewardPerTokenStored;
        if (block.timestamp > pool.lastUpdateTime && pool.totalStaked > 0) {
            uint256 timeElapsed = block.timestamp - pool.lastUpdateTime;
            uint256 rewards = timeElapsed * pool.rewardRate;
            currentRewardPerToken += (rewards * 1e18) / pool.totalStaked;
        }
        
        uint256 userRewards = (userStake.amount * currentRewardPerToken) / 1e18;
        return userRewards - userStake.rewardDebt;
    }
    
    /**
     * @dev Get pool duration based on pool ID
     * @param poolId Pool ID
     * @return Duration in seconds
     */
    function _getPoolDuration(uint256 poolId) internal pure returns (uint256) {
        if (poolId == SHORT_TERM_POOL) return SHORT_TERM_DURATION;
        if (poolId == MEDIUM_TERM_POOL) return MEDIUM_TERM_DURATION;
        if (poolId == LONG_TERM_POOL) return LONG_TERM_DURATION;
        return 0;
    }
    
    /**
     * @dev Get user's pending rewards
     * @param user User address
     * @param poolId Pool ID
     * @return Pending rewards amount
     */
    function getPendingRewards(address user, uint256 poolId) external view returns (uint256) {
        return _calculatePendingRewards(user, poolId);
    }
    
    /**
     * @dev Get user's staking information
     * @param user User address
     * @param poolId Pool ID
     * @return UserStake struct
     */
    function getUserStake(address user, uint256 poolId) external view returns (UserStake memory) {
        return userStakes[user][poolId];
    }
    
    /**
     * @dev Get pool information
     * @param poolId Pool ID
     * @return StakingPool struct
     */
    function getPoolInfo(uint256 poolId) external view returns (StakingPool memory) {
        return stakingPools[poolId];
    }
    
    /**
     * @dev Update pool reward rate (only owner)
     * @param poolId Pool ID
     * @param newRewardRate New reward rate
     */
    function updatePoolRewardRate(uint256 poolId, uint256 newRewardRate) external onlyOwner {
        require(stakingPools[poolId].isActive, "Pool is not active");
        
        _updatePoolRewards(poolId);
        stakingPools[poolId].rewardRate = newRewardRate;
        
        emit PoolUpdated(poolId, newRewardRate);
    }
    
    /**
     * @dev Set pool active status (only owner)
     * @param poolId Pool ID
     * @param isActive Active status
     */
    function setPoolActive(uint256 poolId, bool isActive) external onlyOwner {
        stakingPools[poolId].isActive = isActive;
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
     * @dev Emergency withdraw (only owner)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        stakingToken.safeTransfer(owner(), amount);
    }
}
