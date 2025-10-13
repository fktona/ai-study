// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./StudyToken.sol";

/**
 * @title SessionManager
 * @dev Manages study sessions with behavioral checks and engagement tracking
 * @notice Handles session validation, engagement monitoring, and quiz management
 */
contract SessionManager is Ownable, Pausable {
    
    // Session information
    struct Session {
        uint256 sessionId;
        address user;
        uint256 startTime;
        uint256 endTime;
        uint256 studyTimeSeconds;
        bool isCompleted;
        bool hasEngagement;
        bool hasQuizPassed;
        uint256 quizScore;
        uint256 engagementChecks;
        uint256 lastEngagementTime;
        string sessionTopic;
        string sessionContent;
    }
    
    // Engagement requirements
    uint256 public constant MIN_SESSION_DURATION = 1200; // 20 minutes in seconds
    uint256 public constant ENGAGEMENT_INTERVAL = 300; // 5 minutes in seconds
    uint256 public constant MIN_ENGAGEMENT_CHECKS = 4; // Minimum 4 interactions in 20 minutes
    uint256 public constant QUIZ_PASSING_SCORE = 70; // 70% to pass
    
    // Session tracking
    mapping(uint256 => Session) public sessions;
    mapping(address => uint256[]) public userSessions;
    mapping(address => uint256) public userSessionCount;
    
    // Session counter
    uint256 private _sessionCounter;
    
    // Reference to StudyToken contract
    StudyToken public studyToken;
    
    // Events
    event SessionStarted(uint256 indexed sessionId, address indexed user, string topic);
    event EngagementCheck(uint256 indexed sessionId, address indexed user, uint256 timestamp);
    event SessionCompleted(uint256 indexed sessionId, address indexed user, uint256 studyTime, bool hasEngagement);
    event QuizCompleted(uint256 indexed sessionId, address indexed user, uint256 score, bool passed);
    event SessionAbandoned(uint256 indexed sessionId, address indexed user, uint256 duration);
    
    constructor(address _studyToken) Ownable(msg.sender) {
        require(_studyToken != address(0), "Invalid StudyToken address");
        studyToken = StudyToken(_studyToken);
    }
    
    /**
     * @dev Start a new study session
     * @param user User address
     * @param topic Session topic
     * @param content Session content description
     * @return sessionId Unique session identifier
     */
    function startSession(
        address user,
        string memory topic,
        string memory content
    ) external onlyOwner returns (uint256) {
        require(user != address(0), "Invalid user address");
        require(bytes(topic).length > 0, "Topic cannot be empty");
        
        _sessionCounter++;
        uint256 sessionId = _sessionCounter;
        
        Session storage session = sessions[sessionId];
        session.sessionId = sessionId;
        session.user = user;
        session.startTime = block.timestamp;
        session.sessionTopic = topic;
        session.sessionContent = content;
        
        userSessions[user].push(sessionId);
        userSessionCount[user]++;
        
        // Notify StudyToken contract
        studyToken.startSession(user, sessionId);
        
        emit SessionStarted(sessionId, user, topic);
        
        return sessionId;
    }
    
    /**
     * @dev Record user engagement during session
     * @param sessionId Session identifier
     * @param user User address (for verification)
     */
    function recordEngagement(uint256 sessionId, address user) external onlyOwner {
        require(sessionId > 0 && sessionId <= _sessionCounter, "Invalid session ID");
        
        Session storage session = sessions[sessionId];
        require(session.user == user, "Session does not belong to user");
        require(!session.isCompleted, "Session already completed");
        
        uint256 currentTime = block.timestamp;
        
        // Check if enough time has passed since last engagement
        if (currentTime >= session.lastEngagementTime + ENGAGEMENT_INTERVAL) {
            session.engagementChecks++;
            session.lastEngagementTime = currentTime;
            
            emit EngagementCheck(sessionId, user, currentTime);
        }
    }
    
    /**
     * @dev Complete a study session with validation
     * @param sessionId Session identifier
     * @param user User address
     * @param quizScore Quiz score (0-100)
     */
    function completeSession(
        uint256 sessionId,
        address user,
        uint256 quizScore
    ) external onlyOwner {
        require(sessionId > 0 && sessionId <= _sessionCounter, "Invalid session ID");
        
        Session storage session = sessions[sessionId];
        require(session.user == user, "Session does not belong to user");
        require(!session.isCompleted, "Session already completed");
        
        // Calculate study time
        uint256 studyTime = block.timestamp - session.startTime;
        require(studyTime >= MIN_SESSION_DURATION, "Session too short");
        
        // Check engagement requirements
        bool hasEngagement = session.engagementChecks >= MIN_ENGAGEMENT_CHECKS;
        
        // Update session
        session.endTime = block.timestamp;
        session.studyTimeSeconds = studyTime;
        session.isCompleted = true;
        session.hasEngagement = hasEngagement;
        session.quizScore = quizScore;
        session.hasQuizPassed = quizScore >= QUIZ_PASSING_SCORE;
        
        // Complete session in StudyToken contract
        studyToken.completeSession(user, sessionId, studyTime, hasEngagement);
        
        // Award quiz rewards if passed
        if (session.hasQuizPassed) {
            studyToken.passQuiz(user, sessionId, quizScore);
        }
        
        emit SessionCompleted(sessionId, user, studyTime, hasEngagement);
        
        if (session.hasQuizPassed) {
            emit QuizCompleted(sessionId, user, quizScore, true);
        }
    }
    
    /**
     * @dev Abandon a session (early termination)
     * @param sessionId Session identifier
     * @param user User address
     */
    function abandonSession(uint256 sessionId, address user) external onlyOwner {
        require(sessionId > 0 && sessionId <= _sessionCounter, "Invalid session ID");
        
        Session storage session = sessions[sessionId];
        require(session.user == user, "Session does not belong to user");
        require(!session.isCompleted, "Session already completed");
        
        uint256 duration = block.timestamp - session.startTime;
        
        // Mark as completed but with no rewards
        session.endTime = block.timestamp;
        session.studyTimeSeconds = duration;
        session.isCompleted = true;
        session.hasEngagement = false;
        session.hasQuizPassed = false;
        
        emit SessionAbandoned(sessionId, user, duration);
    }
    
    /**
     * @dev Get session information
     * @param sessionId Session identifier
     * @return Session struct
     */
    function getSession(uint256 sessionId) external view returns (Session memory) {
        require(sessionId > 0 && sessionId <= _sessionCounter, "Invalid session ID");
        return sessions[sessionId];
    }
    
    /**
     * @dev Get user's session history
     * @param user User address
     * @return Array of session IDs
     */
    function getUserSessions(address user) external view returns (uint256[] memory) {
        return userSessions[user];
    }
    
    /**
     * @dev Get user's session statistics
     * @param user User address
     * @return totalSessions Total sessions started
     * @return completedSessions Completed sessions
     * @return quizPassedSessions Sessions with passed quizzes
     * @return totalStudyTime Total study time in seconds
     */
    function getUserSessionStats(address user) external view returns (
        uint256 totalSessions,
        uint256 completedSessions,
        uint256 quizPassedSessions,
        uint256 totalStudyTime
    ) {
        uint256[] memory userSessionIds = userSessions[user];
        
        totalSessions = userSessionIds.length;
        
        for (uint256 i = 0; i < userSessionIds.length; i++) {
            Session memory session = sessions[userSessionIds[i]];
            
            if (session.isCompleted) {
                completedSessions++;
                totalStudyTime += session.studyTimeSeconds;
                
                if (session.hasQuizPassed) {
                    quizPassedSessions++;
                }
            }
        }
    }
    
    /**
     * @dev Get active sessions for a user
     * @param user User address
     * @return Array of active session IDs
     */
    function getActiveSessions(address user) external view returns (uint256[] memory) {
        uint256[] memory userSessionIds = userSessions[user];
        uint256[] memory activeSessions = new uint256[](userSessionIds.length);
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < userSessionIds.length; i++) {
            Session memory session = sessions[userSessionIds[i]];
            if (!session.isCompleted) {
                activeSessions[activeCount] = userSessionIds[i];
                activeCount++;
            }
        }
        
        // Resize array to actual active count
        uint256[] memory result = new uint256[](activeCount);
        for (uint256 i = 0; i < activeCount; i++) {
            result[i] = activeSessions[i];
        }
        
        return result;
    }
    
    /**
     * @dev Check if user has proper engagement in session
     * @param sessionId Session identifier
     * @return True if engagement requirements are met
     */
    function checkEngagement(uint256 sessionId) external view returns (bool) {
        require(sessionId > 0 && sessionId <= _sessionCounter, "Invalid session ID");
        
        Session memory session = sessions[sessionId];
        
        // Check if session has been running long enough
        uint256 currentTime = block.timestamp;
        uint256 sessionDuration = currentTime - session.startTime;
        
        if (sessionDuration < MIN_SESSION_DURATION) {
            return false;
        }
        
        // Check if enough engagement checks have been recorded
        return session.engagementChecks >= MIN_ENGAGEMENT_CHECKS;
    }
    
    /**
     * @dev Get next required engagement time
     * @param sessionId Session identifier
     * @return Next engagement time (0 if no engagement needed)
     */
    function getNextEngagementTime(uint256 sessionId) external view returns (uint256) {
        require(sessionId > 0 && sessionId <= _sessionCounter, "Invalid session ID");
        
        Session memory session = sessions[sessionId];
        
        if (session.isCompleted) {
            return 0;
        }
        
        return session.lastEngagementTime + ENGAGEMENT_INTERVAL;
    }
    
    /**
     * @dev Update StudyToken contract address
     * @param newStudyToken New StudyToken contract address
     */
    function updateStudyToken(address newStudyToken) external onlyOwner {
        require(newStudyToken != address(0), "Invalid StudyToken address");
        studyToken = StudyToken(newStudyToken);
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
}
