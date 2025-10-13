// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

/**
 * @title StudyAchievements
 * @dev ERC-721 NFT contract for study achievements and credentials
 * @notice This contract mints NFTs for study completions, milestones, and BNS credentials
 */
contract StudyAchievements is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable, Pausable {
    // Token counter
    uint256 private _tokenIdCounter;
    
    // Achievement types
    enum AchievementType {
        SESSION_COMPLETION,
        STUDY_MILESTONE,
        BNS_CREDENTIAL,
        LEARNING_PATH,
        COMMUNITY_CONTRIBUTOR
    }
    
    // Achievement metadata
    struct Achievement {
        AchievementType achievementType;
        string title;
        string description;
        uint256 timestamp;
        address recipient;
        bool isVerified;
    }
    
    // Token ID to Achievement mapping
    mapping(uint256 => Achievement) public achievements;
    
    // User's achievement counts by type
    mapping(address => mapping(AchievementType => uint256)) public userAchievementCounts;
    
    // Achievement requirements
    mapping(AchievementType => uint256) public achievementRequirements;
    
    // Base URI for metadata
    string private _baseTokenURI;
    
    // Events
    event AchievementMinted(
        address indexed recipient,
        uint256 indexed tokenId,
        AchievementType achievementType,
        string title
    );
    event AchievementVerified(uint256 indexed tokenId, bool verified);
    
    constructor(string memory baseURI) ERC721("Study Achievements", "STUDYACH") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
        
        // Set achievement requirements
        achievementRequirements[AchievementType.SESSION_COMPLETION] = 1;
        achievementRequirements[AchievementType.STUDY_MILESTONE] = 5;
        achievementRequirements[AchievementType.BNS_CREDENTIAL] = 1;
        achievementRequirements[AchievementType.LEARNING_PATH] = 10;
        achievementRequirements[AchievementType.COMMUNITY_CONTRIBUTOR] = 3;
    }
    
    /**
     * @dev Mint a session completion NFT
     * @param recipient Address to mint NFT to
     * @param sessionTitle Title of the completed session
     * @param sessionDescription Description of the session
     */
    function mintSessionCompletion(
        address recipient,
        string memory sessionTitle,
        string memory sessionDescription
    ) external onlyOwner returns (uint256) {
        require(recipient != address(0), "Cannot mint to zero address");
        
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        Achievement memory newAchievement = Achievement({
            achievementType: AchievementType.SESSION_COMPLETION,
            title: sessionTitle,
            description: sessionDescription,
            timestamp: block.timestamp,
            recipient: recipient,
            isVerified: true
        });
        
        achievements[tokenId] = newAchievement;
        userAchievementCounts[recipient][AchievementType.SESSION_COMPLETION]++;
        
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, string(abi.encodePacked("session-", _toString(tokenId))));
        
        emit AchievementMinted(recipient, tokenId, AchievementType.SESSION_COMPLETION, sessionTitle);
        
        return tokenId;
    }
    
    /**
     * @dev Mint a study milestone NFT
     * @param recipient Address to mint NFT to
     * @param milestoneTitle Title of the milestone
     * @param milestoneDescription Description of the milestone
     */
    function mintStudyMilestone(
        address recipient,
        string memory milestoneTitle,
        string memory milestoneDescription
    ) external onlyOwner returns (uint256) {
        require(recipient != address(0), "Cannot mint to zero address");
        
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        Achievement memory newAchievement = Achievement({
            achievementType: AchievementType.STUDY_MILESTONE,
            title: milestoneTitle,
            description: milestoneDescription,
            timestamp: block.timestamp,
            recipient: recipient,
            isVerified: true
        });
        
        achievements[tokenId] = newAchievement;
        userAchievementCounts[recipient][AchievementType.STUDY_MILESTONE]++;
        
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, string(abi.encodePacked("milestone-", _toString(tokenId))));
        
        emit AchievementMinted(recipient, tokenId, AchievementType.STUDY_MILESTONE, milestoneTitle);
        
        return tokenId;
    }
    
    /**
     * @dev Mint a BNS credential NFT
     * @param recipient Address to mint NFT to
     * @param bnsName BNS name (e.g., "student.base")
     * @param bnsDescription Description of the BNS credential
     */
    function mintBNSCredential(
        address recipient,
        string memory bnsName,
        string memory bnsDescription
    ) external onlyOwner returns (uint256) {
        require(recipient != address(0), "Cannot mint to zero address");
        
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        Achievement memory newAchievement = Achievement({
            achievementType: AchievementType.BNS_CREDENTIAL,
            title: bnsName,
            description: bnsDescription,
            timestamp: block.timestamp,
            recipient: recipient,
            isVerified: true
        });
        
        achievements[tokenId] = newAchievement;
        userAchievementCounts[recipient][AchievementType.BNS_CREDENTIAL]++;
        
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, string(abi.encodePacked("bns-", _toString(tokenId))));
        
        emit AchievementMinted(recipient, tokenId, AchievementType.BNS_CREDENTIAL, bnsName);
        
        return tokenId;
    }
    
    /**
     * @dev Mint a learning path completion NFT
     * @param recipient Address to mint NFT to
     * @param pathTitle Title of the learning path
     * @param pathDescription Description of the learning path
     */
    function mintLearningPath(
        address recipient,
        string memory pathTitle,
        string memory pathDescription
    ) external onlyOwner returns (uint256) {
        require(recipient != address(0), "Cannot mint to zero address");
        
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        Achievement memory newAchievement = Achievement({
            achievementType: AchievementType.LEARNING_PATH,
            title: pathTitle,
            description: pathDescription,
            timestamp: block.timestamp,
            recipient: recipient,
            isVerified: true
        });
        
        achievements[tokenId] = newAchievement;
        userAchievementCounts[recipient][AchievementType.LEARNING_PATH]++;
        
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, string(abi.encodePacked("path-", _toString(tokenId))));
        
        emit AchievementMinted(recipient, tokenId, AchievementType.LEARNING_PATH, pathTitle);
        
        return tokenId;
    }
    
    /**
     * @dev Set achievement verification status
     * @param tokenId Token ID to verify
     * @param verified Verification status
     */
    function setAchievementVerified(uint256 tokenId, bool verified) external onlyOwner {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        
        achievements[tokenId].isVerified = verified;
        emit AchievementVerified(tokenId, verified);
    }
    
    /**
     * @dev Get achievement details by token ID
     * @param tokenId Token ID
     * @return Achievement struct
     */
    function getAchievement(uint256 tokenId) external view returns (Achievement memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return achievements[tokenId];
    }
    
    /**
     * @dev Get user's achievement count by type
     * @param user User address
     * @param achievementType Achievement type
     * @return Count of achievements
     */
    function getUserAchievementCount(address user, AchievementType achievementType) 
        external 
        view 
        returns (uint256) 
    {
        return userAchievementCounts[user][achievementType];
    }
    
    /**
     * @dev Get all token IDs owned by user
     * @param owner Owner address
     * @return Array of token IDs
     */
    function getTokensByOwner(address owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokens = new uint256[](tokenCount);
        
        for (uint256 i = 0; i < tokenCount; i++) {
            tokens[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return tokens;
    }
    
    /**
     * @dev Set base URI for token metadata
     * @param baseURI New base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Get base URI
     * @return Base URI string
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
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
     * @dev Override required functions
     */
    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) {
        require(!paused(), "Pausable: paused");
        return super._update(to, tokenId, auth);
    }
    
    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }
    
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev Convert uint256 to string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
