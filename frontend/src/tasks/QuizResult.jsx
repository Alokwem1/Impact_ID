import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    CheckCircleIcon,
    AcademicCapIcon,
    ChartBarIcon,
    ArrowPathIcon,
    HomeIcon,
    ShareIcon
} from '@heroicons/react/24/outline';
import {
    TrophyIcon as TrophyIconSolid,
    StarIcon as StarIconSolid,
    BoltIcon as BoltIconSolid,
    SparklesIcon as SparklesIconSolid
} from '@heroicons/react/24/solid';
import apiClient from '../api/axios';
import { queryKeys } from '../api/queryKeys';
import toast from 'react-hot-toast';

// Performance level configurations
const PERFORMANCE_LEVELS = {
    excellent: {
        threshold: 90,
        label: 'Excellent!',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: TrophyIconSolid,
        message: 'Outstanding performance! You\'ve mastered this topic.',
        emoji: '🏆'
    },
    good: {
        threshold: 70,
        label: 'Well Done!',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: StarIconSolid,
        message: 'Great job! You have a solid understanding.',
        emoji: '⭐'
    },
    fair: {
        threshold: 50,
        label: 'Keep Learning',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: AcademicCapIcon,
        message: 'Good effort! Review the material and try again.',
        emoji: '📚'
    },
    needsWork: {
        threshold: 0,
        label: 'Practice More',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        icon: ArrowPathIcon,
        message: 'Don\'t give up! Practice makes perfect.',
        emoji: '💪'
    }
};

// Helper function to get performance level based on percentage
const getPerformanceLevel = (percentage) => {
    if (percentage >= 90) return PERFORMANCE_LEVELS.excellent;
    if (percentage >= 70) return PERFORMANCE_LEVELS.good;
    if (percentage >= 50) return PERFORMANCE_LEVELS.fair;
    return PERFORMANCE_LEVELS.needsWork;
};

// Helper function to get progress bar color
const getProgressBarColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
};

// Simulate XP and rewards calculation (would come from backend)
const calculateRewards = (percentage, total) => {
    const baseXP = total * 10; // 10 XP per question
    
    // Calculate bonus multiplier based on performance
    let bonusMultiplier = 1.0;
    if (percentage >= 90) {
        bonusMultiplier = 1.5;
    } else if (percentage >= 70) {
        bonusMultiplier = 1.2;
    }
    
    const xpEarned = Math.round(baseXP * bonusMultiplier);
    
    // Calculate essence earned based on performance
    let essenceEarned = 0;
    if (percentage >= 90) {
        essenceEarned = 5;
    } else if (percentage >= 70) {
        essenceEarned = 3;
    } else if (percentage >= 50) {
        essenceEarned = 1;
    }
    
    return { xpEarned, essenceEarned };
};

// Submit quiz results to backend
const submitQuizResults = async ({ quizId, score, total, percentage }) => {
    const { data } = await apiClient.post(`/api/tasks/quiz/${quizId}/complete`, {
        score,
        total_questions: total,
        percentage,
        time_spent_minutes: 5 // This would be calculated from actual time spent
    });
    return data;
};

export default function QuizResult({ 
    score, 
    total, 
    onRestart, 
    onContinue,
    quizId = null,
    taskTitle = 'Quiz',
    showActions = true 
}) {
    const queryClient = useQueryClient();
    const [showCelebration, setShowCelebration] = useState(false);
    const [rewards, setRewards] = useState(null);
    
    const percentage = Math.round((score / total) * 100);
    
    // Submit results mutation
    const { mutate: submitResults, isPending: isSubmitting } = useMutation({
        mutationFn: submitQuizResults,
        onSuccess: (data) => {
            setRewards(data);
            if (data.xp_earned > 0 || data.badges_unlocked?.length > 0) {
                setShowCelebration(true);
                
                // Show success notifications
                if (data.xp_earned > 0) {
                    toast.success(`🎉 +${data.xp_earned} XP earned!`, {
                        duration: 4000,
                        icon: '✨'
                    });
                }
                
                if (data.level_up) {
                    toast.success('🎊 Level up! Congratulations!', {
                        duration: 5000,
                        icon: '🆙'
                    });
                }
                
                if (data.badges_unlocked?.length > 0) {
                    data.badges_unlocked.forEach(badge => {
                        toast.success(`🏆 Badge unlocked: ${badge}!`, {
                            duration: 4000,
                            icon: '🎖️'
                        });
                    });
                }
            }
            
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
            // badges list may depend on user id; broad root invalidation acceptable if user id not in scope
            queryClient.invalidateQueries({ queryKey: queryKeys.badges.root() });
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.root() });
        },
        onError: (err) => {
            toast.error('Failed to save quiz results');
        }
    });

    // Auto-submit results if quizId is provided
    useEffect(() => {
        if (quizId && !rewards && !isSubmitting) {
            submitResults({ quizId, score, total, percentage });
        }
    }, [quizId, score, total, percentage, rewards, isSubmitting, submitResults]);

    // Get performance level
    const getPerformanceLevel = () => {
        for (const [key, level] of Object.entries(PERFORMANCE_LEVELS)) {
            if (percentage >= level.threshold) {
                return { key, ...level };
            }
        }
        return { key: 'needsWork', ...PERFORMANCE_LEVELS.needsWork };
    };

    // Share functionality
    const handleShare = () => {
        const text = `I just scored ${percentage}% on "${taskTitle}" quiz! 🎯`;
        const url = window.location.href;
        
        if (navigator.share) {
            navigator.share({
                title: 'Quiz Results - Impact ID',
                text,
                url
            });
        } else {
            navigator.clipboard.writeText(`${text} ${url}`);
            toast.success('Results copied to clipboard!');
        }
    };

    const performanceLevel = getPerformanceLevel();
    const Icon = performanceLevel.icon;
    const calculatedRewards = calculateRewards(percentage, total);

    return (
        <div className="relative max-w-2xl mx-auto">
            {/* Celebration Animation */}
            {showCelebration && (
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 animate-bounce">
                        <div className="text-6xl">🎉</div>
                    </div>
                    <div className="absolute top-4 right-4 animate-pulse">
                        <div className="text-4xl">✨</div>
                    </div>
                    <div className="absolute top-8 left-4 animate-bounce delay-300">
                        <div className="text-4xl">🏆</div>
                    </div>
                </div>
            )}

            {/* Main Results Card */}
            <div className={`bg-white rounded-2xl shadow-xl border-2 ${performanceLevel.borderColor} overflow-hidden`}>
                {/* Header */}
                <div className={`${performanceLevel.bgColor} px-8 py-6 text-center border-b ${performanceLevel.borderColor}`}>
                    <div className="flex justify-center mb-4">
                        <div className={`p-4 rounded-full ${performanceLevel.bgColor} ring-4 ring-white shadow-lg`}>
                            <Icon className={`h-12 w-12 ${performanceLevel.color}`} />
                        </div>
                    </div>
                    
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Quiz Complete! {performanceLevel.emoji}
                    </h2>
                    
                    <div className={`inline-flex items-center px-4 py-2 rounded-full ${performanceLevel.bgColor} ${performanceLevel.color} font-semibold text-lg`}>
                        {performanceLevel.label}
                    </div>
                </div>

                {/* Score Display */}
                <div className="px-8 py-8 text-center">
                    <div className="mb-6">
                        <div className="text-8xl font-extrabold text-gray-900 mb-2">
                            {percentage}
                            <span className="text-4xl text-gray-500">%</span>
                        </div>
                        
                        <div className="flex items-center justify-center space-x-2 text-gray-600">
                            <CheckCircleIcon className="h-5 w-5" />
                            <span className="text-lg">
                                You scored <strong className="text-gray-900">{score}</strong> out of{' '}
                                <strong className="text-gray-900">{total}</strong> questions correctly
                            </span>
                        </div>
                    </div>

                    {/* Performance Message */}
                    <div className={`p-4 rounded-lg ${performanceLevel.bgColor} ${performanceLevel.borderColor} border`}>
                        <p className={`${performanceLevel.color} font-medium text-lg`}>
                            {performanceLevel.message}
                        </p>
                    </div>

                    {/* Detailed Score Breakdown */}
                    <div className="mt-6 grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{score}</div>
                            <div className="text-sm text-gray-500">Correct</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{total - score}</div>
                            <div className="text-sm text-gray-500">Incorrect</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{total}</div>
                            <div className="text-sm text-gray-500">Total</div>
                        </div>
                    </div>
                </div>

                {/* Rewards Section */}
                {(rewards || calculatedRewards.xpEarned > 0) && (
                    <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center flex items-center justify-center space-x-2">
                            <TrophyIconSolid className="h-5 w-5 text-yellow-600" />
                            <span>Rewards Earned</span>
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* XP Reward */}
                            <div className="bg-white p-4 rounded-lg border border-yellow-200 text-center">
                                <div className="flex items-center justify-center space-x-2 mb-2">
                                    <BoltIconSolid className="h-6 w-6 text-yellow-600" />
                                    <span className="font-semibold text-gray-900">Experience Points</span>
                                </div>
                                <div className="text-3xl font-bold text-yellow-700">
                                    +{rewards?.xp_earned || calculatedRewards.xpEarned}
                                </div>
                                <div className="text-sm text-gray-600">XP</div>
                            </div>

                            {/* Essence Reward */}
                            {(rewards?.essence_earned || calculatedRewards.essenceEarned) > 0 && (
                                <div className="bg-white p-4 rounded-lg border border-purple-200 text-center">
                                    <div className="flex items-center justify-center space-x-2 mb-2">
                                        <SparklesIconSolid className="h-6 w-6 text-purple-600" />
                                        <span className="font-semibold text-gray-900">Essence</span>
                                    </div>
                                    <div className="text-3xl font-bold text-purple-700">
                                        +{rewards?.essence_earned || calculatedRewards.essenceEarned}
                                    </div>
                                    <div className="text-sm text-gray-600">Essence</div>
                                </div>
                            )}
                        </div>

                        {/* Badges Unlocked */}
                        {rewards?.badges_unlocked?.length > 0 && (
                            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                <h4 className="font-semibold text-green-900 mb-2 flex items-center space-x-2">
                                    <StarIconSolid className="h-5 w-5" />
                                    <span>Badges Unlocked!</span>
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {rewards.badges_unlocked.map((badge) => (
                                        <span key={badge} className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                            🏆 {badge}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Level Up */}
                        {rewards?.level_up && (
                            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
                                <div className="text-2xl mb-2">🎊</div>
                                <h4 className="font-bold text-yellow-900 text-lg">Level Up!</h4>
                                <p className="text-yellow-800">Congratulations on reaching a new level!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Performance Tips */}
                {percentage < 70 && (
                    <div className="px-8 py-6 bg-blue-50 border-t border-blue-200">
                        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center space-x-2">
                            <AcademicCapIcon className="h-5 w-5" />
                            <span>Tips for Improvement</span>
                        </h3>
                        <ul className="space-y-2 text-blue-800">
                            <li className="flex items-start space-x-2">
                                <span>•</span>
                                <span>Review the material and take your time reading each question</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <span>•</span>
                                <span>Practice with similar quizzes to improve your knowledge</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <span>•</span>
                                <span>Don't hesitate to restart and try again - practice makes perfect!</span>
                            </li>
                        </ul>
                    </div>
                )}

                {/* Action Buttons */}
                {showActions && (
                    <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Restart Quiz */}
                            <button
                                onClick={onRestart}
                                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                            >
                                <ArrowPathIcon className="h-5 w-5" />
                                <span>Try Again</span>
                            </button>

                            {/* Continue/Dashboard */}
                            {onContinue && (
                                <button
                                    onClick={onContinue}
                                    className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                                >
                                    <HomeIcon className="h-5 w-5" />
                                    <span>Continue</span>
                                </button>
                            )}

                            {/* Share Results */}
                            <button
                                onClick={handleShare}
                                className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                            >
                                <ShareIcon className="h-5 w-5" />
                                <span>Share</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Progress Visualization */}
            <div className="mt-6 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <ChartBarIcon className="h-5 w-5" />
                    <span>Performance Breakdown</span>
                </h3>
                
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span>Accuracy</span>
                        <span className="font-semibold">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                            className={`h-3 rounded-full transition-all duration-1000 ${getProgressBarColor(percentage)}`}
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 mt-2">
                        <div className="text-center">0%</div>
                        <div className="text-center">25%</div>
                        <div className="text-center">50%</div>
                        <div className="text-center">75%</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// PropTypes for QuizResult component
QuizResult.propTypes = {
    score: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    onRestart: PropTypes.func,
    onContinue: PropTypes.func,
    quizId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    taskTitle: PropTypes.string,
    showActions: PropTypes.bool
};