import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    TrophyIcon,
    StarIcon,
    ClockIcon,
    FireIcon,
    SparklesIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    EyeIcon,
    DocumentTextIcon,
    QuestionMarkCircleIcon,
    PhotoIcon,
    ShareIcon,
    AcademicCapIcon,
    BoltIcon,
    TagIcon,
    CalendarIcon,
    UserIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import {
    CheckCircleIcon as CheckCircleIconSolid,
    StarIcon as StarIconSolid,
    TrophyIcon as TrophyIconSolid,
    FireIcon as FireIconSolid
} from '@heroicons/react/24/solid';
import apiClient from '../api/axios';
import { queryKeys } from '../api/queryKeys';
import toast from 'react-hot-toast';

// Task type configurations
const TASK_TYPES = {
    quiz: {
        icon: QuestionMarkCircleIcon,
        iconSolid: QuestionMarkCircleIcon,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-500',
        label: 'Quiz'
    },
    upload: {
        icon: PhotoIcon,
        iconSolid: PhotoIcon,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-500',
        label: 'Upload'
    },
    social_share: {
        icon: ShareIcon,
        iconSolid: ShareIcon,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-500',
        label: 'Social Share'
    },
    survey: {
        icon: DocumentTextIcon,
        iconSolid: DocumentTextIcon,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-500',
        label: 'Survey'
    },
    challenge: {
        icon: TrophyIcon,
        iconSolid: TrophyIconSolid,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-500',
        label: 'Challenge'
    },
    report: {
        icon: DocumentTextIcon,
        iconSolid: DocumentTextIcon,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-500',
        label: 'Report'
    }
};

// Difficulty configurations
const DIFFICULTY_LEVELS = {
    beginner: { 
        label: 'Beginner', 
        color: 'text-green-600', 
        bgColor: 'bg-green-100', 
        icon: '🌱' 
    },
    intermediate: { 
        label: 'Intermediate', 
        color: 'text-yellow-600', 
        bgColor: 'bg-yellow-100', 
        icon: '⚡' 
    },
    advanced: { 
        label: 'Advanced', 
        color: 'text-orange-600', 
        bgColor: 'bg-orange-100', 
        icon: '🔥' 
    },
    expert: { 
        label: 'Expert', 
        color: 'text-red-600', 
        bgColor: 'bg-red-100', 
        icon: '💎' 
    }
};

// ✅ FIXED: Corrected API endpoint to match your backend
const submitTask = async ({ taskId, payload }) => {
    const { data } = await apiClient.post(`/api/tasks/${taskId}/submit`, payload);
    return data;
};

export default function TaskItem({ task, viewMode = 'grid' }) {
    const queryClient = useQueryClient();
    const [quizAnswer, setQuizAnswer] = useState('');
    const [uploadFile, setUploadFile] = useState(null);
    const [textResponse, setTextResponse] = useState('');
    const [socialShareUrl, setSocialShareUrl] = useState('');
    const [startTime] = useState(Date.now());

    // ✅ ENHANCED: Better success and error handling
    const { mutate, isPending } = useMutation({
        mutationFn: submitTask,
        onSuccess: (data) => {
            // Handle different response formats from your backend
            const message = data.message || 'Task submitted successfully!';
            toast.success(message);
            
            // Show XP and rewards if auto-approved
            if (data.auto_approved && data.xp_earned) {
                toast.success(`🎉 +${data.xp_earned} XP earned!`, {
                    duration: 4000,
                    icon: '✨'
                });
            }
            
            // Show level up notification
            if (data.level_up) {
                toast.success('🎊 Level up! Congratulations!', {
                    duration: 5000,
                    icon: '🆙'
                });
            }
            
            // Show badges unlocked
            if (data.badges_unlocked && data.badges_unlocked.length > 0) {
                data.badges_unlocked.forEach(badge => {
                    toast.success(`🏆 Badge unlocked: ${badge}!`, {
                        duration: 4000,
                        icon: '🎖️'
                    });
                });
            }
            
            // Invalidate queries to update UI
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.root() });
            queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
            queryClient.invalidateQueries({ queryKey: queryKeys.user.badges(task.user_id || task.owner_id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.user.dashboard() });
        },
        onError: (err) => {
            console.error('Task submission error:', err);
            
            // Enhanced error message handling
            let errorMessage = 'Submission failed. Please try again.';
            
            if (err.response?.data?.detail) {
                errorMessage = err.response.data.detail;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.status === 400) {
                errorMessage = 'Invalid submission. Please check your response and try again.';
            } else if (err.response?.status === 403) {
                errorMessage = 'You do not have permission to submit this task.';
            } else if (err.response?.status === 429) {
                errorMessage = 'Too many attempts. Please wait before trying again.';
            }
            
            toast.error(errorMessage);
        },
    });

    // ✅ ENHANCED: Better form validation
    const validateSubmission = () => {
        if (task.type === 'quiz') {
            if (!quizAnswer?.trim()) {
                toast.error('Please select an answer.');
                return false;
            }
        } else if (task.type === 'upload') {
            if (!uploadFile && !textResponse?.trim()) {
                toast.error('Please upload a file or provide a text response.');
                return false;
            }
        } else if (task.type === 'social_share') {
            if (!socialShareUrl?.trim()) {
                toast.error('Please provide the social media post URL.');
                return false;
            }
            // Validate URL format
            try {
                new URL(socialShareUrl);
            } catch {
                toast.error('Please provide a valid URL.');
                return false;
            }
        } else if (task.type === 'survey' || task.type === 'challenge') {
            if (!textResponse?.trim() || textResponse.trim().length < 10) {
                toast.error('Please provide a response of at least 10 characters.');
                return false;
            }
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateSubmission()) return;
        
        // Calculate time spent
        const timeSpent = Math.round((Date.now() - startTime) / 60000); // Convert to minutes
        
        let responsePayload = {
            response: 'Completed',
            time_spent_minutes: timeSpent,
            attachments: []
        };

        // Handle different task types based on your backend schemas
        if (task.type === 'quiz') {
            responsePayload.response = quizAnswer.trim();
        } else if (task.type === 'upload') {
            responsePayload.response = textResponse?.trim() || 'File uploaded';
            if (uploadFile) {
                responsePayload.attachments = [uploadFile.name]; // In real app, upload file first
            }
        } else if (task.type === 'social_share') {
            responsePayload.response = socialShareUrl.trim();
        } else if (task.type === 'survey' || task.type === 'challenge') {
            responsePayload.response = textResponse.trim();
        }

        // Call the mutate function with the required variables
        mutate({ taskId: task.id, payload: responsePayload });
    };

    const getTaskConfig = () => {
        return TASK_TYPES[task.type] || TASK_TYPES.challenge;
    };

    const getDifficultyConfig = () => {
        return DIFFICULTY_LEVELS[task.difficulty] || DIFFICULTY_LEVELS.beginner;
    };

    const formatTimeLimit = (minutes) => {
        if (!minutes) return null;
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    };

    const isCompleted = () => {
        return task.user_submission_status === 'approved';
    };

    const isPendingStatus = () => {
        return task.user_submission_status === 'pending';
    };

    const isDeclined = () => {
        return task.user_submission_status === 'declined' || task.user_submission_status === 'rejected';
    };

    const canSubmit = () => {
        return !isCompleted() && !isPending && (task.user_attempts_used || 0) < (task.max_attempts || 3);
    };

    // ✅ FIXED: Better quiz question handling for your backend structure
    const renderTaskContent = () => {
        if (isCompleted()) return null;

        switch (task.type) {
            case 'quiz': {
                if (!task.quiz_question) return null;

                // Handle both array and object options from your backend
                let options = [];
                options = Array.isArray(task.quiz_question.options)
                    ? task.quiz_question.options
                    : task.quiz_question.options?.choices || [];
                    
                return (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-3">
                            {task.quiz_question.question || 'Quiz Question'}
                        </h4>
                        <div className="space-y-2">
                            {options.map((option, index) => (
                                <label key={index} className="flex items-center p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                                    <input
                                        type="radio"
                                        name={`quiz-${task.id}`}
                                        value={typeof option === 'string' ? option : option.text}
                                        checked={quizAnswer === (typeof option === 'string' ? option : option.text)}
                                        onChange={(e) => setQuizAnswer(e.target.value)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="ml-3 text-gray-700">
                                        {typeof option === 'string' ? option : option.text}
                                    </span>
                                </label>
                            ))}
                        </div>
            </div>
                );
        }

            case 'upload':
                return (
                    <div className="mt-4 space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload File (Optional)
                            </label>
                            <input
                                type="file"
                                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                accept="image/*,video/*,.pdf,.doc,.docx"
                            />
                            {uploadFile && (
                                <p className="mt-2 text-sm text-green-700">
                                    Selected: {uploadFile.name}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Text Response
                            </label>
                            <textarea
                                value={textResponse}
                                onChange={(e) => setTextResponse(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Describe your work or provide additional details..."
                            />
                        </div>
                    </div>
                );

            case 'social_share':
                return (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Social Media Post URL
                        </label>
                        <input
                            type="url"
                            value={socialShareUrl}
                            onChange={(e) => setSocialShareUrl(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://twitter.com/yourpost or https://linkedin.com/posts/..."
                        />
                        <p className="mt-2 text-xs text-gray-600">
                            Share this task on social media and paste the link here
                        </p>
                    </div>
                );

            case 'survey':
            case 'challenge':
            case 'report':
            default:
                return (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Response
                        </label>
                        <textarea
                            value={textResponse}
                            onChange={(e) => setTextResponse(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Share your thoughts, experience, or solution..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Minimum 10 characters required • {textResponse.length} characters
                        </p>
                    </div>
                );
        }
    };

    const renderStatusBadge = () => {
        if (isCompleted()) {
            return (
                <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    <CheckCircleIconSolid className="h-3 w-3" />
                    <span>Completed</span>
                </div>
            );
        }
        
        if (isPendingStatus()) {
            return (
                <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    <ClockIcon className="h-3 w-3" />
                    <span>Pending Review</span>
                </div>
            );
        }
        
        if (isDeclined()) {
            return (
                <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                    <ExclamationTriangleIcon className="h-3 w-3" />
                    <span>Needs Revision</span>
                </div>
            );
        }

        return null;
    };

    const taskConfig = getTaskConfig();
    const difficultyConfig = getDifficultyConfig();
    const TaskIcon = taskConfig.icon;

    const cardClasses = viewMode === 'list' 
        ? "bg-white p-4 rounded-lg shadow-sm border-l-4 hover:shadow-md transition-shadow duration-200"
        : "bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-200";

    return (
        <div className={`${cardClasses} ${taskConfig.borderColor}`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3 flex-1">
                    {/* Task Type Icon */}
                    <div className={`p-2 rounded-lg ${taskConfig.bgColor} flex-shrink-0`}>
                        <TaskIcon className={`h-5 w-5 ${taskConfig.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-gray-900 ${viewMode === 'list' ? 'text-base' : 'text-lg'}`}>
                            {task.title}
                        </h3>
                        
                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            {/* Task Type */}
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${taskConfig.bgColor} ${taskConfig.color}`}>
                                {taskConfig.label}
                            </span>
                            
                            {/* Difficulty */}
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${difficultyConfig.bgColor} ${difficultyConfig.color}`}>
                                <span className="mr-1">{difficultyConfig.icon}</span>
                                {difficultyConfig.label}
                            </span>
                            
                            {/* Category */}
                            <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                <TagIcon className="h-3 w-3 mr-1" />
                                {task.category}
                            </span>
                            
                            {/* Featured */}
                            {task.is_featured && (
                                <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                    <StarIconSolid className="h-3 w-3 mr-1" />
                                    Featured
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Status Badge */}
                {renderStatusBadge()}
            </div>

            {/* Instructions */}
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                {task.instructions}
            </p>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                    {task.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Task Content (Quiz, Upload, etc.) */}
            {renderTaskContent()}

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    {/* Rewards & Info */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                        {/* XP Reward */}
                        <div className="flex items-center space-x-1">
                            <BoltIcon className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">{task.xp_reward} XP</span>
                        </div>
                        
                        {/* Essence Reward */}
                        {task.essence_reward > 0 && (
                            <div className="flex items-center space-x-1">
                                <SparklesIcon className="h-4 w-4 text-purple-500" />
                                <span className="font-medium">{task.essence_reward} Essence</span>
                            </div>
                        )}
                        
                        {/* Time Limit */}
                        {task.time_limit_minutes && (
                            <div className="flex items-center space-x-1">
                                <ClockIcon className="h-4 w-4 text-gray-500" />
                                <span>{formatTimeLimit(task.time_limit_minutes)}</span>
                            </div>
                        )}
                        
                        {/* Attempts */}
                        <div className="flex items-center space-x-1">
                            <EyeIcon className="h-4 w-4 text-gray-500" />
                            <span>{(task.user_attempts_used || 0)}/{task.max_attempts} attempts</span>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center space-x-2">
                        {isCompleted() && (
                            <span className="text-green-600 text-sm font-medium flex items-center space-x-1">
                                <CheckCircleIconSolid className="h-4 w-4" />
                                <span>Completed</span>
                            </span>
                        )}
                        
                        {isPendingStatus() && (
                            <span className="text-yellow-600 text-sm font-medium flex items-center space-x-1">
                                <ClockIcon className="h-4 w-4" />
                                <span>Under Review</span>
                            </span>
                        )}
                        
                        {isDeclined() && (
                            <button
                                onClick={handleSubmit}
                                disabled={isPending || !canSubmit()}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                {isPending ? 'Submitting...' : 'Retry'}
                            </button>
                        )}
                        
                        {!isCompleted() && !isPendingStatus() && !isDeclined() && (
                            <button
                                onClick={handleSubmit}
                                disabled={isPending || !canSubmit()}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                {isPending ? 'Submitting...' : 'Submit Task'}
                            </button>
                        )}
                        
                        {/* View Details Link */}
                        <Link
                            to={`/tasks/${task.id}`}
                            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title="View details"
                        >
                            <EyeIcon className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                {/* Completion Stats */}
                {task.completion_count > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-50">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center space-x-4">
                                <span className="flex items-center space-x-1">
                                    <UserIcon className="h-3 w-3" />
                                    <span>{task.completion_count} completed</span>
                                </span>
                                {task.success_rate > 0 && (
                                    <span className="flex items-center space-x-1">
                                        <ChartBarIcon className="h-3 w-3" />
                                        <span>{Math.round(task.success_rate)}% success rate</span>
                                    </span>
                                )}
                            </div>
                            {task.average_completion_time && (
                                <span className="flex items-center space-x-1">
                                    <ClockIcon className="h-3 w-3" />
                                    <span>Avg: {Math.round(task.average_completion_time)}min</span>
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}