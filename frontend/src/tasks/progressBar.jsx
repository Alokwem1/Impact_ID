import { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  StarIcon,
  BoltIcon,
  SparklesIcon,
  TrophyIcon,
  FireIcon,
  ClockIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleIconSolid,
  StarIcon as StarIconSolid,
  BoltIcon as BoltIconSolid,
  SparklesIcon as SparklesIconSolid,
  TrophyIcon as TrophyIconSolid,
  FireIcon as FireIconSolid,
} from "@heroicons/react/24/solid";

export default function ProgressBar({
  current,
  total,
  variant = "quiz", // 'quiz', 'task', 'badge', 'xp', 'streak'
  label = null,
  showPercentage = true,
  showMilestones = true,
  animated = true,
  size = "medium", // 'small', 'medium', 'large'
  color = "blue", // 'blue', 'green', 'purple', 'yellow', 'red'
  showIcons = true,
  milestoneRewards = null, // { 25: '🎯', 50: '⭐', 75: '🏆', 100: '🎉' }
  timeRemaining = null,
  streak = null,
  className = "",
}) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastMilestone, setLastMilestone] = useState(0);

  const percentage = Math.min(
    100,
    Math.max(0, (current / Math.max(total, 1)) * 100),
  );

  // Animate progress bar
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedPercentage(percentage);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedPercentage(percentage);
    }
  }, [percentage, animated]);

  // Milestone celebration
  useEffect(() => {
    if (showMilestones && percentage > lastMilestone) {
      const milestones = [25, 50, 75, 100];
      const reachedMilestone = milestones.find(
        (m) => percentage >= m && m > lastMilestone,
      );

      if (reachedMilestone) {
        setLastMilestone(reachedMilestone);
        setShowCelebration(true);

        setTimeout(() => {
          setShowCelebration(false);
        }, 2000);
      }
    }
  }, [percentage, lastMilestone, showMilestones]);

  // Get variant-specific configurations
  const getVariantConfig = () => {
    switch (variant) {
      case "quiz":
        return {
          icon: AcademicCapIcon,
          solidIcon: CheckCircleIconSolid,
          defaultLabel: "Quiz Progress",
          color: "blue",
        };
      case "task":
        return {
          icon: CheckCircleIcon,
          solidIcon: CheckCircleIconSolid,
          defaultLabel: "Task Progress",
          color: "green",
        };
      case "badge":
        return {
          icon: TrophyIcon,
          solidIcon: TrophyIconSolid,
          defaultLabel: "Badge Progress",
          color: "yellow",
        };
      case "xp":
        return {
          icon: BoltIcon,
          solidIcon: BoltIconSolid,
          defaultLabel: "XP Progress",
          color: "purple",
        };
      case "streak":
        return {
          icon: FireIcon,
          solidIcon: FireIconSolid,
          defaultLabel: "Streak Progress",
          color: "red",
        };
      default:
        return {
          icon: CheckCircleIcon,
          solidIcon: CheckCircleIconSolid,
          defaultLabel: "Progress",
          color: "blue",
        };
    }
  };

  // Get size-specific classes
  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return {
          container: "mb-3",
          text: "text-xs",
          bar: "h-1.5",
          icon: "h-3 w-3",
        };
      case "large":
        return {
          container: "mb-8",
          text: "text-base",
          bar: "h-4",
          icon: "h-6 w-6",
        };
      default: // medium
        return {
          container: "mb-6",
          text: "text-sm",
          bar: "h-2.5",
          icon: "h-4 w-4",
        };
    }
  };

  // Get color-specific classes
  const getColorClasses = () => {
    const colors = {
      blue: {
        bg: "bg-blue-600",
        gradient: "from-blue-500 to-blue-600",
        text: "text-blue-600",
        glow: "shadow-blue-500/25",
      },
      green: {
        bg: "bg-green-600",
        gradient: "from-green-500 to-green-600",
        text: "text-green-600",
        glow: "shadow-green-500/25",
      },
      purple: {
        bg: "bg-purple-600",
        gradient: "from-purple-500 to-purple-600",
        text: "text-purple-600",
        glow: "shadow-purple-500/25",
      },
      yellow: {
        bg: "bg-yellow-500",
        gradient: "from-yellow-400 to-yellow-500",
        text: "text-yellow-600",
        glow: "shadow-yellow-500/25",
      },
      red: {
        bg: "bg-red-500",
        gradient: "from-red-400 to-red-500",
        text: "text-red-600",
        glow: "shadow-red-500/25",
      },
    };
    return colors[color] || colors.blue;
  };

  const variantConfig = getVariantConfig();
  const sizeClasses = getSizeClasses();
  const colorClasses = getColorClasses();
  const Icon = variantConfig.icon;
  const SolidIcon = variantConfig.solidIcon;

  const displayLabel = label || variantConfig.defaultLabel;

  // Generate milestone markers
  const getMilestoneMarkers = () => {
    if (!showMilestones || total <= 1) return null;

    const milestones = [];
    const step = total >= 10 ? Math.floor(total / 4) : 1;

    for (let i = step; i < total; i += step) {
      const milestonePercentage = (i / total) * 100;
      milestones.push(
        <div
          key={i}
          className="absolute top-0 w-0.5 bg-white opacity-60 h-full transform -translate-x-0.5"
          style={{ left: `${milestonePercentage}%` }}
        />,
      );
    }

    return milestones;
  };

  // Format display text
  const getDisplayText = () => {
    switch (variant) {
      case "quiz":
        return `Question ${current} of ${total}`;
      case "xp":
        return `${current.toLocaleString()} / ${total.toLocaleString()} XP`;
      case "badge":
        return `${current} / ${total} Badges Earned`;
      case "streak":
        return `${current} Day${current !== 1 ? "s" : ""} Streak`;
      default:
        return `${current} of ${total}`;
    }
  };

  return (
    <div className={`relative ${sizeClasses.container} ${className}`}>
      {/* Celebration overlay */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 animate-bounce">
            <div className="text-2xl">🎉</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {showIcons && (
            <div className={`${colorClasses.text}`}>
              {percentage >= 100 ? (
                <SolidIcon className={sizeClasses.icon} />
              ) : (
                <Icon className={sizeClasses.icon} />
              )}
            </div>
          )}
          <span className={`font-medium text-gray-700 ${sizeClasses.text}`}>
            {displayLabel}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Time remaining */}
          {timeRemaining && (
            <div className="flex items-center space-x-1 text-orange-600">
              <ClockIcon className="h-3 w-3" />
              <span className="text-xs font-medium">{timeRemaining}</span>
            </div>
          )}

          {/* Streak indicator */}
          {streak && variant === "streak" && (
            <div className="flex items-center space-x-1 text-red-600">
              <FireIconSolid className="h-3 w-3" />
              <span className="text-xs font-medium">{streak}</span>
            </div>
          )}

          {/* Progress text */}
          <span className={`font-semibold text-gray-600 ${sizeClasses.text}`}>
            {getDisplayText()}
          </span>

          {/* Percentage */}
          {showPercentage && (
            <span
              className={`font-bold ${colorClasses.text} ${sizeClasses.text}`}
            >
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div
          className={`w-full bg-gray-200 rounded-full ${sizeClasses.bar} overflow-hidden`}
        >
          {/* Milestone markers */}
          {getMilestoneMarkers()}

          {/* Progress fill */}
          <div
            className={`
                            bg-gradient-to-r ${colorClasses.gradient} ${sizeClasses.bar} rounded-full 
                            transition-all duration-700 ease-out relative overflow-hidden
                            ${percentage >= 100 ? `shadow-lg ${colorClasses.glow}` : ""}
                        `}
            style={{ width: `${animatedPercentage}%` }}
          >
            {/* Shimmer effect for completed progress */}
            {percentage >= 100 && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            )}

            {/* Animated progress pulse */}
            {animated && percentage > 0 && percentage < 100 && (
              <div className="absolute right-0 top-0 h-full w-4 bg-gradient-to-l from-white/30 to-transparent animate-pulse" />
            )}
          </div>
        </div>

        {/* Milestone rewards */}
        {milestoneRewards && showMilestones && (
          <div className="absolute -top-8 w-full">
            {Object.entries(milestoneRewards).map(([milestone, reward]) => {
              const milestonePercentage = parseInt(milestone);
              const isReached = percentage >= milestonePercentage;

              return (
                <div
                  key={milestone}
                  className={`absolute transform -translate-x-1/2 transition-all duration-300 ${
                    isReached ? "scale-110 opacity-100" : "scale-90 opacity-60"
                  }`}
                  style={{ left: `${milestonePercentage}%` }}
                >
                  <div
                    className={`
                                        w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs
                                        ${
                                          isReached
                                            ? `${colorClasses.bg} border-white text-white shadow-lg`
                                            : "bg-gray-200 border-gray-300 text-gray-500"
                                        }
                                    `}
                  >
                    {reward}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Additional stats for XP variant */}
      {variant === "xp" && total > current && (
        <div className="mt-2 text-xs text-gray-500">
          {(total - current).toLocaleString()} XP to next milestone
        </div>
      )}

      {/* Badge progress details */}
      {variant === "badge" && (
        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
          <span>Completion: {Math.round(percentage)}%</span>
          {percentage >= 100 && (
            <span className="flex items-center space-x-1 text-green-600">
              <CheckCircleIconSolid className="h-3 w-3" />
              <span>All badges earned!</span>
            </span>
          )}
        </div>
      )}

      {/* Quiz-specific navigation hints */}
      {variant === "quiz" && current < total && (
        <div className="mt-2 text-xs text-gray-500">
          {total - current} question{total - current !== 1 ? "s" : ""} remaining
        </div>
      )}
    </div>
  );
}
