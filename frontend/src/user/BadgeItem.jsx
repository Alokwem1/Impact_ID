import { useState } from "react";
import {
  StarIcon,
  SparklesIcon,
  CalendarIcon,
  ShareIcon,
  CheckCircleIcon,
  ClockIcon,
  TrophyIcon,
  FireIcon,
  GiftIcon,
  UserGroupIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarIconSolid,
  SparklesIcon as SparklesIconSolid,
  TrophyIcon as TrophyIconSolid,
  FireIcon as FireIconSolid,
} from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

// Badge rarity configurations
const RARITY_CONFIG = {
  common: {
    color: "from-gray-400 to-gray-600",
    textColor: "text-gray-700",
    borderColor: "border-gray-300",
    bgColor: "bg-gray-50",
    icon: StarIcon,
    iconSolid: StarIconSolid,
    label: "Common",
  },
  uncommon: {
    color: "from-green-400 to-green-600",
    textColor: "text-green-700",
    borderColor: "border-green-300",
    bgColor: "bg-green-50",
    icon: SparklesIcon,
    iconSolid: SparklesIconSolid,
    label: "Uncommon",
  },
  rare: {
    color: "from-blue-400 to-blue-600",
    textColor: "text-blue-700",
    borderColor: "border-blue-300",
    bgColor: "bg-blue-50",
    icon: TrophyIcon,
    iconSolid: TrophyIconSolid,
    label: "Rare",
  },
  epic: {
    color: "from-purple-400 to-purple-600",
    textColor: "text-purple-700",
    borderColor: "border-purple-300",
    bgColor: "bg-purple-50",
    icon: FireIcon,
    iconSolid: FireIconSolid,
    label: "Epic",
  },
  legendary: {
    color: "from-yellow-400 to-orange-500",
    textColor: "text-orange-700",
    borderColor: "border-orange-300",
    bgColor: "bg-orange-50",
    icon: SparklesIcon,
    iconSolid: SparklesIconSolid,
    label: "Legendary",
  },
};

// Badge category icons
const CATEGORY_ICONS = {
  tasks: ChartBarIcon,
  streaks: FireIcon,
  xp: TrophyIcon,
  social: UserGroupIcon,
  special: GiftIcon,
  weaving: SparklesIcon,
  seasonal: CalendarIcon,
};

export default function BadgeItem({
  badge,
  showProgress = false,
  variant = "default",
  onClick = null,
}) {
  const [isSharing, setIsSharing] = useState(false);

  // Get rarity configuration
  const rarityConfig =
    RARITY_CONFIG[badge.rarity?.toLowerCase()] || RARITY_CONFIG.common;
  const CategoryIcon =
    CATEGORY_ICONS[badge.category?.toLowerCase()] || TrophyIcon;
  const RarityIcon = badge.is_earned
    ? rarityConfig.iconSolid
    : rarityConfig.icon;

  // Format awarded date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle sharing
  const handleShare = async () => {
    if (isSharing) return;

    setIsSharing(true);
    try {
      const shareData = {
        title: `I earned the ${badge.title} badge on Impact ID!`,
        text: `Check out my ${badge.title} badge: ${badge.description}`,
        url: window.location.origin + `/badges/${badge.id}`,
      };

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData);
        toast.success("Badge shared successfully!");
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(
          `I earned the ${badge.title} badge on Impact ID! ${shareData.url}`,
        );
        toast.success("Badge link copied to clipboard!");
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Share failed:", err);
        toast.error("Failed to share badge");
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Progress bar component
  const ProgressBar = ({ percentage = 0 }) => (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full bg-gradient-to-r ${rarityConfig.color} transition-all duration-500 ease-out`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );

  // Compact variant for lists
  if (variant === "compact") {
    return (
      <div
        className={`flex items-center space-x-3 p-3 bg-white rounded-lg border transition-all duration-200 hover:shadow-md ${
          badge.is_earned
            ? `${rarityConfig.borderColor} ${rarityConfig.bgColor}`
            : "border-gray-200 hover:border-gray-300"
        } ${onClick ? "cursor-pointer" : ""}`}
        onClick={onClick}
      >
        <div className="relative flex-shrink-0">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              badge.is_earned
                ? `bg-gradient-to-br ${rarityConfig.color} text-white`
                : "bg-gray-100 text-gray-400"
            }`}
          >
            <RarityIcon className="w-6 h-6" />
          </div>
          {badge.is_earned && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        <div className="flex-grow min-w-0">
          <div className="flex items-center space-x-2">
            <p
              className={`font-semibold truncate ${badge.is_earned ? rarityConfig.textColor : "text-gray-700"}`}
            >
              {badge.title}
            </p>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                badge.is_earned
                  ? `${rarityConfig.bgColor} ${rarityConfig.textColor}`
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {rarityConfig.label}
            </span>
          </div>

          {showProgress &&
            !badge.is_earned &&
            badge.progress_percentage !== undefined && (
              <div className="mt-1">
                <ProgressBar percentage={badge.progress_percentage} />
                <p className="text-xs text-gray-500 mt-1">
                  {badge.progress_percentage}% complete
                </p>
              </div>
            )}
        </div>

        {badge.is_earned && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            disabled={isSharing}
            className="flex-shrink-0 p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Share badge"
          >
            <ShareIcon className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>
    );
  }

  // Default card variant
  return (
    <div
      className={`relative p-6 bg-white rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${
        badge.is_earned
          ? `${rarityConfig.borderColor} ${rarityConfig.bgColor}`
          : "border-gray-200 hover:border-gray-300"
      } ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {/* Rarity glow effect for earned badges */}
      {badge.is_earned && (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${rarityConfig.color} opacity-5 rounded-xl`}
        />
      )}

      {/* Badge Icon */}
      <div className="relative mb-4">
        <div
          className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
            badge.is_earned
              ? `bg-gradient-to-br ${rarityConfig.color} text-white shadow-lg`
              : "bg-gray-100 text-gray-400"
          }`}
        >
          {badge.icon_url ? (
            <img
              src={badge.icon_url}
              alt={`${badge.title} badge`}
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "block";
              }}
            />
          ) : null}
          <RarityIcon
            className={`w-12 h-12 ${badge.icon_url ? "hidden" : "block"}`}
          />
        </div>

        {/* Earned indicator */}
        {badge.is_earned && (
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircleIcon className="w-5 h-5 text-white" />
          </div>
        )}

        {/* Category indicator */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              badge.is_earned ? "bg-white shadow-md" : "bg-gray-200"
            }`}
          >
            <CategoryIcon
              className={`w-4 h-4 ${badge.is_earned ? rarityConfig.textColor : "text-gray-500"}`}
            />
          </div>
        </div>
      </div>

      {/* Badge Content */}
      <div className="text-center space-y-3">
        {/* Title and Rarity */}
        <div className="space-y-1">
          <h3
            className={`font-bold text-lg ${badge.is_earned ? rarityConfig.textColor : "text-gray-800"}`}
          >
            {badge.title}
          </h3>
          <div className="flex items-center justify-center space-x-2">
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                badge.is_earned
                  ? `${rarityConfig.bgColor} ${rarityConfig.textColor}`
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {rarityConfig.label}
            </span>
            {badge.points_value && (
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                {badge.points_value} XP
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed">
          {badge.description}
        </p>

        {/* Progress Bar (for unearned badges) */}
        {showProgress &&
          !badge.is_earned &&
          badge.progress_percentage !== undefined && (
            <div className="space-y-2">
              <ProgressBar percentage={badge.progress_percentage} />
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">
                  Progress: {badge.progress_percentage}%
                </span>
                {badge.progress_description && (
                  <span className="text-gray-600 font-medium">
                    {badge.progress_description}
                  </span>
                )}
              </div>
            </div>
          )}

        {/* Earned Date */}
        {badge.is_earned && badge.awarded_at && (
          <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
            <CalendarIcon className="w-4 h-4" />
            <span>Earned {formatDate(badge.awarded_at)}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-2 pt-2">
          {badge.is_earned && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
              disabled={isSharing}
              className={`flex items-center space-x-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isSharing
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : `${rarityConfig.bgColor} ${rarityConfig.textColor} hover:opacity-80 transform hover:scale-105`
              }`}
            >
              {isSharing ? (
                <ClockIcon className="w-4 h-4" />
              ) : (
                <ShareIcon className="w-4 h-4" />
              )}
              <span>{isSharing ? "Sharing..." : "Share"}</span>
            </button>
          )}

          {!badge.is_earned && badge.progress_percentage < 100 && (
            <div className="flex items-center space-x-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">
              <ClockIcon className="w-4 h-4" />
              <span>In Progress</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
