import { useState, useEffect } from "react";
import {
  SparklesIcon,
  BoltIcon,
  FireIcon,
  AcademicCapIcon,
  HeartIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  BeakerIcon,
  ExclamationCircleIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  StarIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  SparklesIcon as SparklesIconSolid,
  BoltIcon as BoltIconSolid,
  FireIcon as FireIconSolid,
  AcademicCapIcon as AcademicCapIconSolid,
  HeartIcon as HeartIconSolid,
  ComputerDesktopIcon as ComputerDesktopIconSolid,
} from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

// Categories with enhanced metadata (from your backend weaving.py)
const WEAVING_CATEGORIES = [
  {
    id: "Environment",
    name: "Environment",
    icon: GlobeAltIcon,
    solidIcon: GlobeAltIcon,
    color: "green",
    description: "Climate, sustainability, conservation",
    examples: ["renewable energy", "waste reduction", "biodiversity"],
  },
  {
    id: "Social Good",
    name: "Social Good",
    icon: HeartIcon,
    solidIcon: HeartIconSolid,
    color: "pink",
    description: "Community impact, social justice",
    examples: ["poverty reduction", "equality", "community building"],
  },
  {
    id: "Technology",
    name: "Technology",
    icon: ComputerDesktopIcon,
    solidIcon: ComputerDesktopIconSolid,
    color: "blue",
    description: "Innovation, digital solutions",
    examples: ["AI for good", "digital inclusion", "tech accessibility"],
  },
  {
    id: "Education",
    name: "Education",
    icon: AcademicCapIcon,
    solidIcon: AcademicCapIconSolid,
    color: "purple",
    description: "Learning, skill development",
    examples: ["educational access", "skills training", "literacy"],
  },
  {
    id: "Health",
    name: "Health",
    icon: BeakerIcon,
    solidIcon: BeakerIcon,
    color: "red",
    description: "Healthcare, wellness, medical",
    examples: ["healthcare access", "mental health", "medical research"],
  },
  {
    id: "Other",
    name: "Other",
    icon: SparklesIcon,
    solidIcon: SparklesIconSolid,
    color: "gray",
    description: "Uncategorized impact areas",
    examples: ["mixed impact", "unique initiatives", "cross-sector"],
  },
];

export default function WeavingView({
  thread,
  onSubmit,
  submitting = false,
  userStats = null,
  showAdvanced = false,
  estimatedReward = { min: 3, max: 8 },
  onToggleAdvanced = () => {},
}) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [reasoning, setReasoning] = useState("");
  const [actionPlan, setActionPlan] = useState("");
  const [difficultyRating, setDifficultyRating] = useState(3);
  const [showDetails, setShowDetails] = useState(false);
  const [qualityScore, setQualityScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());

  // Track time spent on this thread
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // Calculate quality score based on reasoning length and detail
  useEffect(() => {
    const length = reasoning.length;
    let score = 0;

    if (length >= 20) score += 1;
    if (length >= 50) score += 1;
    if (length >= 100) score += 1;
    if (length >= 200) score += 1;
    if (reasoning.includes("because") || reasoning.includes("due to"))
      score += 1;

    setQualityScore(Math.min(score, 5));
  }, [reasoning]);

  // Enhanced submission handler
  const handleSubmit = async (categoryId, quickSubmit = false) => {
    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }

    if (!quickSubmit && (!reasoning.trim() || reasoning.trim().length < 20)) {
      toast.error("Please provide at least 20 characters of reasoning");
      return;
    }

    const submissionData = {
      thread_id: thread.id,
      category: categoryId,
      reasoning: quickSubmit
        ? `Quick categorization as ${categoryId}`
        : reasoning.trim(),
      action_plan: actionPlan.trim() || null,
      difficulty_rating: difficultyRating,
    };

    try {
      await onSubmit(submissionData);

      // Success feedback
      toast.success(
        `Weaving submitted! Estimated reward: ${estimatedReward.min}-${estimatedReward.max} essence`,
        {
          icon: "✨",
          duration: 4000,
        },
      );
    } catch (error) {
      toast.error("Failed to submit weaving. Please try again.");
    }
  };

  // Get category color classes
  const getCategoryClasses = (category) => {
    const colorMap = {
      green: "bg-green-100 text-green-700 border-green-300 hover:bg-green-200",
      pink: "bg-pink-100 text-pink-700 border-pink-300 hover:bg-pink-200",
      blue: "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200",
      purple:
        "bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200",
      red: "bg-red-100 text-red-700 border-red-300 hover:bg-red-200",
      gray: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200",
    };
    return colorMap[category.color] || colorMap.gray;
  };

  // Format time spent
  const formatTimeSpent = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  // Extract domain from URL
  const getDomain = (url) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return "External Link";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-purple-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <SparklesIconSolid className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Weave Impact Thread</h3>
              <p className="text-purple-100 text-sm">
                Help categorize this content to earn essence
              </p>
            </div>
          </div>

          {/* Reward Preview */}
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-300">
              {estimatedReward.min}-{estimatedReward.max}
            </div>
            <div className="text-xs text-purple-100">Essence Reward</div>
          </div>
        </div>

        {/* User Stats */}
        {userStats && (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-lg font-semibold">
                {userStats.essence_balance}
              </div>
              <div className="text-xs text-purple-100">Current Essence</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-lg font-semibold">
                {userStats.daily_weaves_completed}/
                {userStats.daily_weaves_limit}
              </div>
              <div className="text-xs text-purple-100">Daily Weaves</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-lg font-semibold">
                {userStats.streak || 0}
              </div>
              <div className="text-xs text-purple-100">Streak</div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Thread Content */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2 leading-relaxed">
                {thread.title ||
                  thread.meta_data?.title ||
                  "Impact Thread Content"}
              </h4>
              {thread.summary && (
                <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                  {thread.summary}
                </p>
              )}
            </div>

            {/* Quality Score Indicator */}
            {thread.quality_score && (
              <div className="flex items-center space-x-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                <StarIcon className="h-3 w-3" />
                <span>{thread.quality_score.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <a
              href={thread.content}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <span>Read on {getDomain(thread.content)}</span>
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </a>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showDetails ? "Hide Details" : "Show Details"}
            </button>
          </div>

          {/* Additional Details */}
          {showDetails && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Source:</span>
                <span className="ml-2 text-gray-900">
                  {thread.source || "Web"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Type:</span>
                <span className="ml-2 text-gray-900">
                  {thread.data_type || "URL"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Created:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(thread.created_at).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Weaving Count:</span>
                <span className="ml-2 text-gray-900">
                  {thread.weaving_count || 0}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Category Selection */}
        <div>
          <h5 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <span>What category best describes this content?</span>
            <InformationCircleIcon className="h-4 w-4 text-gray-400" />
          </h5>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {WEAVING_CATEGORIES.map((category) => {
              const Icon =
                selectedCategory === category.id
                  ? category.solidIcon
                  : category.icon;
              const isSelected = selectedCategory === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  disabled={submitting}
                  className={`
                                        p-4 rounded-xl border-2 transition-all duration-200 text-left
                                        ${
                                          isSelected
                                            ? `${getCategoryClasses(category)} border-current shadow-md transform scale-105`
                                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                                        }
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                    `}
                  title={category.description}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <p className="text-xs opacity-75">{category.description}</p>
                  {isSelected && (
                    <div className="mt-2 text-xs opacity-75">
                      Examples: {category.examples.join(", ")}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Advanced Options */}
        {showAdvanced && selectedCategory && (
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-200 space-y-4">
            <h6 className="font-semibold text-blue-900 mb-3">
              Advanced Weaving Options
            </h6>

            {/* Reasoning */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why does this belong in "{selectedCategory}"? (min 20
                characters)
              </label>
              <textarea
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Explain your reasoning for this categorization..."
                disabled={submitting}
              />
              <div className="flex items-center justify-between mt-1 text-xs">
                <span
                  className={`${reasoning.length >= 20 ? "text-green-600" : "text-gray-500"}`}
                >
                  {reasoning.length}/20 minimum
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">Quality:</span>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-3 w-3 ${
                          i < qualityScore ? "text-yellow-500" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Plan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suggested action plan (optional)
              </label>
              <textarea
                value={actionPlan}
                onChange={(e) => setActionPlan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="What actions could maximize the impact of this content?"
                disabled={submitting}
              />
            </div>

            {/* Difficulty Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty to implement (1-5)
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setDifficultyRating(rating)}
                    className={`w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors ${
                      difficultyRating === rating
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                    }`}
                    disabled={submitting}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                1 = Very Easy, 5 = Very Difficult
              </p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {!showAdvanced && (
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <div className="flex items-center space-x-2 mb-2">
              <BoltIconSolid className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Quick Weaving
              </span>
            </div>
            <p className="text-xs text-yellow-700 mb-3">
              Select a category and submit quickly for reduced but immediate
              rewards.
            </p>
            {selectedCategory && (
              <button
                onClick={() => handleSubmit(selectedCategory, true)}
                disabled={submitting}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {submitting
                  ? "Submitting..."
                  : `Quick Weave as ${selectedCategory}`}
              </button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          {showAdvanced ? (
            <>
              <button
                onClick={() => handleSubmit(selectedCategory, false)}
                disabled={
                  submitting || !selectedCategory || reasoning.length < 20
                }
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Weaving...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <SparklesIconSolid className="h-4 w-4" />
                    <span>Submit Weaving</span>
                  </div>
                )}
              </button>
              <button
                onClick={() => onToggleAdvanced(false)}
                disabled={submitting}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Quick Mode
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onToggleAdvanced(true)}
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
              >
                <div className="flex items-center justify-center space-x-2">
                  <AcademicCapIconSolid className="h-4 w-4" />
                  <span>Advanced Mode</span>
                </div>
              </button>
            </>
          )}
        </div>

        {/* Time Tracker */}
        <div className="text-center text-xs text-gray-500 flex items-center justify-center space-x-2">
          <ClockIcon className="h-3 w-3" />
          <span>Time spent: {formatTimeSpent(timeSpent)}</span>
        </div>
      </div>
    </div>
  );
}
