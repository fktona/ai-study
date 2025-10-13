import React, { useState } from "react";
import { useStudyToken } from "../hooks/useStudyToken";
import { useStudyAchievements } from "../hooks/useStudyAchievements";
import { useSessionTracking } from "../hooks/useSessionTracking";
import { useStaking } from "../hooks/useStaking";
import { useSubscription } from "../hooks/useSubscription";
import { useQuiz } from "../hooks/useQuiz";

const RewardDashboard: React.FC = () => {
  const {
    balance,
    studyRewards,
    consecutiveDays,
    sessionStats,
    isPending: tokenPending,
    error: tokenError,
  } = useStudyToken();

  const {
    nftBalance,
    totalAchievements,
    mintSessionCompletion,
    mintStudyMilestone,
    mintBNSCredential,
    mintLearningPath,
    isPending: achievementPending,
    error: achievementError,
  } = useStudyAchievements();

  const {
    currentSession,
    engagementCount,
    isEngagementRequired,
    nextEngagementTime,
    getSessionProgress,
    startNewSession,
    recordUserEngagement,
    completeCurrentSession,
    abandonCurrentSession,
  } = useSessionTracking();

  const {
    stakes,
    pendingRewards,
    poolInfo,
    stake,
    unstake,
    claimRewards,
    isPending: stakingPending,
  } = useStaking();

  const {
    subscription,
    subscriptionPrice,
    isActive: isSubscriptionActive,
    timeRemainingFormatted,
    subscribe,
    renewSubscription,
    cancelSubscription,
    isPending: subscriptionPending,
  } = useSubscription();

  const {
    startQuiz,
    getCurrentQuestion,
    answerQuestion,
    submitQuiz,
    quizResult,
    isQuizActive,
    getQuizProgress,
    availableTopics,
    nextQuestion,
    previousQuestion,
  } = useQuiz();

  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "session"
    | "staking"
    | "subscription"
    | "quiz"
    | "achievements"
  >("overview");
  const [stakeAmount, setStakeAmount] = useState("");
  const [stakePool, setStakePool] = useState(0);
  const [quizTopic, setQuizTopic] = useState("mathematics");
  const [quizDifficulty, setQuizDifficulty] = useState<
    "easy" | "medium" | "hard"
  >("medium");

  const sessionProgress = getSessionProgress();
  const quizProgress = getQuizProgress();
  const currentQuestion = getCurrentQuestion();

  const handleStartSession = async () => {
    try {
      await startNewSession("Study Session", "Focused learning session");
    } catch (error) {
      console.error("Error starting session:", error);
    }
  };

  const handleCompleteSession = async () => {
    try {
      const result = await completeCurrentSession(quizResult?.score || 0);
      console.log("Session completed:", result);
    } catch (error) {
      console.error("Error completing session:", error);
    }
  };

  const handleStake = async () => {
    if (!stakeAmount || stakeAmount === "0") return;
    try {
      await stake(stakePool, stakeAmount);
      setStakeAmount("");
    } catch (error) {
      console.error("Error staking:", error);
    }
  };

  const handleStartQuiz = () => {
    try {
      startQuiz(quizTopic, quizDifficulty, 5);
    } catch (error) {
      console.error("Error starting quiz:", error);
    }
  };

  const handleQuizSubmit = () => {
    const result = submitQuiz();
    console.log("Quiz completed:", result);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            $STUDY Balance
          </h3>
          <p className="text-3xl font-bold text-blue-600">{balance}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Study Rewards</h3>
          <p className="text-3xl font-bold text-green-600">{studyRewards}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Consecutive Days
          </h3>
          <p className="text-3xl font-bold text-purple-600">
            {consecutiveDays}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Total Sessions
          </h3>
          <p className="text-3xl font-bold text-orange-600">
            {sessionStats.totalSessions}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Session Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Completed Sessions</p>
            <p className="text-2xl font-bold">
              {sessionStats.completedSessions}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Quiz Passed</p>
            <p className="text-2xl font-bold">
              {sessionStats.quizPassedSessions}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Success Rate</p>
            <p className="text-2xl font-bold">
              {sessionStats.totalSessions > 0
                ? Math.round(
                    (sessionStats.completedSessions /
                      sessionStats.totalSessions) *
                      100
                  )
                : 0}
              %
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Achievement Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Achievements</p>
            <p className="text-2xl font-bold text-purple-600">
              {totalAchievements}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">NFT Balance</p>
            <p className="text-2xl font-bold text-blue-600">{nftBalance}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Subscription Status
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p
              className={`text-lg font-semibold ${
                isSubscriptionActive ? "text-green-600" : "text-gray-600"
              }`}
            >
              {isSubscriptionActive ? "Premium Active" : "Free Plan"}
            </p>
            {isSubscriptionActive && (
              <p className="text-sm text-gray-600">
                Expires in {timeRemainingFormatted}
              </p>
            )}
          </div>
          <div className="space-x-2">
            {!isSubscriptionActive ? (
              <button
                onClick={subscribe}
                disabled={subscriptionPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {subscriptionPending
                  ? "Processing..."
                  : `Upgrade (${subscriptionPrice} $STUDY)`}
              </button>
            ) : (
              <button
                onClick={renewSubscription}
                disabled={subscriptionPending}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {subscriptionPending ? "Processing..." : "Renew"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSession = () => (
    <div className="space-y-6">
      {!currentSession ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Start a Study Session
          </h3>
          <p className="text-gray-600 mb-6">
            Begin a focused study session to earn $STUDY tokens and track your
            progress.
          </p>
          <button
            onClick={handleStartSession}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Start Session
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Active Session
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">
                  Topic: {currentSession.topic}
                </p>
                <p className="text-sm text-gray-600">
                  Started: {currentSession.startTime.toLocaleTimeString()}
                </p>
              </div>

              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{sessionProgress.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${sessionProgress.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {sessionProgress.isValid
                    ? "Session valid!"
                    : `${sessionProgress.timeRemaining}s remaining`}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">
                  Engagement: {engagementCount}/4 required
                </p>
                {isEngagementRequired && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Engagement required! Click the button below to stay
                      active.
                    </p>
                    <button
                      onClick={recordUserEngagement}
                      className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 text-sm"
                    >
                      I'm Still Here!
                    </button>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCompleteSession}
                  disabled={!sessionProgress.isValid}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Complete Session
                </button>
                <button
                  onClick={abandonCurrentSession}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Abandon Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStaking = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Stake $STUDY Tokens
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(STAKING_POOLS).map(([poolName, poolId]) => (
            <div key={poolId} className="border rounded-lg p-4">
              <h4 className="font-semibold capitalize">
                {poolName.replace("_", " ")}
              </h4>
              <p className="text-sm text-gray-600">
                {poolId === 0 ? "7 days" : poolId === 1 ? "30 days" : "90 days"}
              </p>
              <p className="text-lg font-bold text-green-600">
                {poolInfo[poolName as keyof typeof poolInfo]?.apy || 0}% APY
              </p>
              <p className="text-sm text-gray-600">
                Staked: {stakes[poolName as keyof typeof stakes]?.amount || "0"}{" "}
                $STUDY
              </p>
              <p className="text-sm text-gray-600">
                Pending:{" "}
                {pendingRewards[poolName as keyof typeof pendingRewards]} $STUDY
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Pool
            </label>
            <select
              value={stakePool}
              onChange={(e) => setStakePool(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value={0}>Short Term (7 days, 12% APY)</option>
              <option value={1}>Medium Term (30 days, 15% APY)</option>
              <option value={2}>Long Term (90 days, 20% APY)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount to Stake
            </label>
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleStake}
              disabled={stakingPending || !stakeAmount || stakeAmount === "0"}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {stakingPending ? "Staking..." : "Stake"}
            </button>
            <button
              onClick={() => claimRewards(stakePool)}
              disabled={stakingPending}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Claim Rewards
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuiz = () => (
    <div className="space-y-6">
      {!isQuizActive && !quizResult ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Take a Quiz
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Topic
              </label>
              <select
                value={quizTopic}
                onChange={(e) => setQuizTopic(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {availableTopics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic.charAt(0).toUpperCase() + topic.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={quizDifficulty}
                onChange={(e) =>
                  setQuizDifficulty(
                    e.target.value as "easy" | "medium" | "hard"
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <button
              onClick={handleStartQuiz}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Start Quiz
            </button>
          </div>
        </div>
      ) : isQuizActive && currentQuestion ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Quiz in Progress
            </h3>
            <p className="text-sm text-gray-600">
              Question {quizProgress.current} of {quizProgress.total}
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xl font-semibold">
              {currentQuestion.question}
            </h4>

            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => answerQuestion(index)}
                  className="w-full text-left p-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={previousQuestion}
                disabled={quizProgress.current === 1}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={nextQuestion}
                disabled={quizProgress.current === quizProgress.total}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={handleQuizSubmit}
                disabled={quizProgress.answered !== quizProgress.total}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
              >
                Submit Quiz ({quizProgress.answered}/{quizProgress.total}{" "}
                answered)
              </button>
            </div>
          </div>
        </div>
      ) : quizResult ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quiz Results
          </h3>

          <div className="space-y-4">
            <div className="text-center">
              <p
                className={`text-4xl font-bold ${
                  quizResult.passed ? "text-green-600" : "text-red-600"
                }`}
              >
                {quizResult.percentage}%
              </p>
              <p
                className={`text-lg font-semibold ${
                  quizResult.passed ? "text-green-600" : "text-red-600"
                }`}
              >
                {quizResult.passed ? "Passed!" : "Failed"}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-xl font-bold">
                  {quizResult.score}/{quizResult.totalQuestions}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Correct</p>
                <p className="text-xl font-bold text-green-600">
                  {quizResult.correctAnswers}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Wrong</p>
                <p className="text-xl font-bold text-red-600">
                  {quizResult.wrongAnswers}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="text-xl font-bold">
                  {Math.floor(quizResult.timeSpent / 60)}m{" "}
                  {quizResult.timeSpent % 60}s
                </p>
              </div>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Take Another Quiz
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Achievement Overview
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800">
              Total Achievements
            </h4>
            <p className="text-3xl font-bold text-purple-600">
              {totalAchievements}
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800">NFT Balance</h4>
            <p className="text-3xl font-bold text-blue-600">{nftBalance}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">
            Available Achievements
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-2">
                Session Completion
              </h5>
              <p className="text-sm text-gray-600 mb-3">
                Earn an NFT for completing study sessions
              </p>
              <button
                onClick={() => {
                  // This would be called with user's address from the hook
                  console.log("Minting session completion achievement");
                }}
                disabled={achievementPending}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
              >
                {achievementPending ? "Minting..." : "Mint Achievement"}
              </button>
            </div>

            <div className="border rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-2">
                Study Milestone
              </h5>
              <p className="text-sm text-gray-600 mb-3">
                Earn an NFT for reaching study milestones
              </p>
              <button
                onClick={() => {
                  console.log("Minting study milestone achievement");
                }}
                disabled={achievementPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                {achievementPending ? "Minting..." : "Mint Achievement"}
              </button>
            </div>

            <div className="border rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-2">
                BNS Credential
              </h5>
              <p className="text-sm text-gray-600 mb-3">
                Earn an NFT for your Base Name Service
              </p>
              <button
                onClick={() => {
                  console.log("Minting BNS credential achievement");
                }}
                disabled={achievementPending}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
              >
                {achievementPending ? "Minting..." : "Mint Achievement"}
              </button>
            </div>

            <div className="border rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-2">
                Learning Path
              </h5>
              <p className="text-sm text-gray-600 mb-3">
                Earn an NFT for completing learning paths
              </p>
              <button
                onClick={() => {
                  console.log("Minting learning path achievement");
                }}
                disabled={achievementPending}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm"
              >
                {achievementPending ? "Minting..." : "Mint Achievement"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reward Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your $STUDY tokens, sessions, and rewards
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "overview", label: "Overview" },
                { id: "session", label: "Study Session" },
                { id: "staking", label: "Staking" },
                { id: "subscription", label: "Subscription" },
                { id: "quiz", label: "Quiz" },
                { id: "achievements", label: "Achievements" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "overview" && renderOverview()}
            {activeTab === "session" && renderSession()}
            {activeTab === "staking" && renderStaking()}
            {activeTab === "subscription" && (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  Subscription management coming soon...
                </p>
              </div>
            )}
            {activeTab === "quiz" && renderQuiz()}
            {activeTab === "achievements" && renderAchievements()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardDashboard;
