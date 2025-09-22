import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ClockIcon,
    QuestionMarkCircleIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowLeftIcon,
    PlayIcon,
    PauseIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
    TrophyIcon as TrophyIconSolid,
    BoltIcon as BoltIconSolid,
    SparklesIcon as SparklesIconSolid
} from '@heroicons/react/24/solid';
import apiClient from '../api/axios';
import { queryKeys } from '../api/queryKeys';
import Layout from '../tasks/Layout';
import Question from '../tasks/Question';
import QuizResult from '../tasks/QuizResult';
import toast from 'react-hot-toast';

// ✅ FIXED: Corrected API endpoint to match your backend
const fetchQuizTask = async (taskId) => {
    const { data } = await apiClient.get(`/api/tasks/${taskId}`);
    return data;
};

// ✅ FIXED: Simplified submission to match your backend's task submission endpoint
const submitQuizCompletion = async ({ taskId, selectedAnswer, timeSpent }) => {
    const { data } = await apiClient.post(`/api/tasks/${taskId}/submit`, {
        response: selectedAnswer,
        time_spent_minutes: Math.round(timeSpent / 60000), // Convert milliseconds to minutes
        attachments: []
    });
    return data;
};

export default function QuizPage() {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // ✅ ENHANCED: Better error handling and retry logic
    const { data: task, isLoading, isError, error } = useQuery({
        queryKey: queryKeys.tasks.detail(taskId),
        queryFn: () => fetchQuizTask(taskId),
        staleTime: 5 * 60 * 1000,
        retry: (failureCount, error) => {
            if (error?.response?.status === 404) return false;
            return failureCount < 3;
        },
        onError: (error) => {
            console.error('Quiz fetch error:', error);
            if (error?.response?.status === 404) {
                toast.error('Quiz not found');
            }
        }
    });

    // ✅ SIMPLIFIED: Quiz state management for single-question quizzes
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [quizStarted, setQuizStarted] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [timeSpent, setTimeSpent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [isCorrect, setIsCorrect] = useState(false);

    // ✅ ENHANCED: Better success and error handling
    const { mutate: submitQuiz, isPending: isSubmitting } = useMutation({
        mutationFn: submitQuizCompletion,
        onSuccess: (data) => {
            const message = data.message || 'Quiz submitted successfully!';
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
            if (data.badges_unlocked?.length > 0) {
                data.badges_unlocked.forEach(badge => {
                    toast.success(`🏆 Badge unlocked: ${badge}!`, {
                        duration: 4000,
                        icon: '🎖️'
                    });
                });
            }
            
            // Invalidate queries to update UI
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.root() });
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
            queryClient.invalidateQueries({ queryKey: queryKeys.user.dashboard() });
        },
        onError: (err) => {
            console.error('Quiz submission error:', err);
            
            let errorMessage = 'Failed to submit quiz. Please try again.';
            
            if (err.response?.data?.detail) {
                errorMessage = err.response.data.detail;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.status === 400) {
                errorMessage = 'Invalid answer. Please check your selection and try again.';
            }
            
            toast.error(errorMessage);
        }
    });

    // Timer effect
    useEffect(() => {
        if (!quizStarted || isPaused || showResults) return;

        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            setTimeSpent(elapsed);

            // Handle time limit
            if (task?.time_limit_minutes) {
                const remaining = (task.time_limit_minutes * 60 * 1000) - elapsed;
                setTimeRemaining(remaining);
                
                if (remaining <= 0) {
                    handleTimeUp();
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [quizStarted, isPaused, showResults, startTime, task?.time_limit_minutes]);

    // Event Handlers
    const handleStartQuiz = () => {
        setQuizStarted(true);
        setStartTime(Date.now());
        setTimeSpent(0);
    };

    // ✅ SIMPLIFIED: Handle answer selection for single question
    const handleAnswerSelect = (selectedOption, correct) => {
        setSelectedAnswer(selectedOption);
        setIsCorrect(correct);
    };

    // ✅ FIXED: Submit quiz with proper validation
    const handleSubmitQuiz = () => {
        if (!selectedAnswer?.trim()) {
            toast.error('Please select an answer before submitting.');
            return;
        }
        
        setShowResults(true);
        
        // Submit to backend
        submitQuiz({
            taskId,
            selectedAnswer: selectedAnswer.trim(),
            timeSpent: timeSpent
        });
    };

    const handleRestart = () => {
        setSelectedAnswer('');
        setIsCorrect(false);
        setShowResults(false);
        setQuizStarted(false);
        setStartTime(null);
        setTimeSpent(0);
        setTimeRemaining(null);
        setIsPaused(false);
    };

    const handleTimeUp = () => {
        toast.error('Time\'s up! Quiz submitted automatically.');
        if (!showResults) {
            setShowResults(true);
            
            // Submit current answer or empty if no selection
            submitQuiz({
                taskId,
                selectedAnswer: selectedAnswer || '',
                timeSpent: task.time_limit_minutes * 60 * 1000
            });
        }
    };

    const handlePauseResume = () => {
        if (isPaused) {
            setStartTime(Date.now() - timeSpent);
            setIsPaused(false);
        } else {
            setIsPaused(true);
        }
    };

    const formatTime = (milliseconds) => {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Render helpers to reduce nested ternaries and improve readability
    const renderStartScreen = () => (
        <div className="p-8 text-center">
            <div className="mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PlayIcon className="h-10 w-10 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Start?</h2>
                <p className="text-gray-600">
                    This quiz contains 1 question. Read carefully and select your answer.
                </p>
            </div>

            {task.time_limit_minutes && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-center space-x-2 text-orange-800">
                        <ClockIcon className="h-5 w-5" />
                        <span className="font-medium">
                            Time Limit: {task.time_limit_minutes} minutes
                        </span>
                    </div>
                </div>
            )}

            <button
                onClick={handleStartQuiz}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
                Start Quiz
            </button>
        </div>
    );

    const renderResults = () => (
        <div className="p-6">
            <QuizResult 
                score={isCorrect ? 1 : 0} 
                total={1}
                onRestart={canAttempt ? handleRestart : null}
                onContinue={() => navigate('/tasks')}
                quizId={taskId}
                taskTitle={task.title}
                showActions={!isSubmitting}
            />
        </div>
    );

    const renderQuestion = () => (
        <div className="p-6">
            {/* Timer and Controls */}
            <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                        <ClockIcon className="h-5 w-5" />
                        <span className="font-medium">Time: {formatTime(timeSpent)}</span>
                    </div>
                    {timeRemaining && timeRemaining > 0 && (
                        <div className="flex items-center space-x-2 text-orange-600">
                            <ExclamationTriangleIcon className="h-5 w-5" />
                            <span className="font-medium">
                                Remaining: {formatTime(timeRemaining)}
                            </span>
                        </div>
                    )}
                </div>
                <button
                    onClick={handlePauseResume}
                    className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    {isPaused ? (
                        <>
                            <PlayIcon className="h-4 w-4" />
                            <span>Resume</span>
                        </>
                    ) : (
                        <>
                            <PauseIcon className="h-4 w-4" />
                            <span>Pause</span>
                        </>
                    )}
                </button>
            </div>

            {/* Pause Overlay */}
            {isPaused && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 rounded-xl">
                    <div className="bg-white p-8 rounded-lg text-center">
                        <PauseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Quiz Paused</h3>
                        <p className="text-gray-600 mb-4">Click Resume to continue</p>
                        <button
                            onClick={handlePauseResume}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            Resume
                        </button>
                    </div>
                </div>
            )}

            {/* ✅ ENHANCED: Question Component with Submit Handler */}
            <Question
                question={task.quiz_question}
                onAnswerSelect={handleAnswerSelect}
                onNext={handleSubmitQuiz}
                disabled={isPaused || isSubmitting}
                isSubmitting={isSubmitting}
                selectedAnswer={selectedAnswer}
                showSubmitButton={true}
                submitButtonText={isSubmitting ? 'Submitting...' : 'Submit Answer'}
            />
        </div>
    );

    const renderQuizPanelInner = () => {
        if (!quizStarted) return renderStartScreen();
        if (showResults) return renderResults();
        return renderQuestion();
    };

    // Validation
    const isQuizTask = task?.type === 'quiz';
    const hasQuizQuestion = task?.quiz_question?.question;
    const canAttempt = task && (task.user_attempts_used || 0) < (task.max_attempts || 3);
    const isCompleted = task?.user_submission_status === 'approved';

    // ✅ ENHANCED: Better loading state
    if (isLoading) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse space-y-6">
                        <div className="bg-white rounded-xl p-6 space-y-4">
                            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                            <div className="h-64 bg-gray-300 rounded"></div>
                            <div className="h-32 bg-gray-300 rounded"></div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // ✅ ENHANCED: Better error handling
    if (isError) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-12">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
                            <XCircleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Quiz</h3>
                            <p className="text-red-800 mb-4">
                                {error?.response?.status === 404 
                                    ? 'Quiz not found. It may have been removed or you may not have access to it.'
                                    : error?.message || 'Failed to load the quiz. Please try again.'
                                }
                            </p>
                            <div className="space-x-4">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="inline-flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
                                >
                                    Try Again
                                </button>
                                <Link 
                                    to="/tasks" 
                                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    <ArrowLeftIcon className="h-4 w-4" />
                                    <span>Back to Tasks</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // Not a quiz task
    if (!isQuizTask) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-12">
                        <ExclamationTriangleIcon className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Not a Quiz Task</h2>
                        <p className="text-gray-600 mb-6">This task is not a quiz type.</p>
                        <Link 
                            to={`/tasks/${taskId}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            View Task Details
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    // No quiz question
    if (!hasQuizQuestion) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-12">
                        <QuestionMarkCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Quiz Not Available</h2>
                        <p className="text-gray-600 mb-6">This quiz doesn't have any questions configured.</p>
                        <Link 
                            to="/tasks"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            Browse Other Tasks
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    // Already completed
    if (isCompleted) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-12">
                        <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Quiz Already Completed</h2>
                        <p className="text-gray-600 mb-6">You have already successfully completed this quiz.</p>
                        <div className="space-x-4">
                            <Link 
                                to="/tasks"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                            >
                                Browse More Tasks
                            </Link>
                            <Link 
                                to="/submissions"
                                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                            >
                                View Submissions
                            </Link>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // Cannot attempt (max attempts reached)
    if (!canAttempt) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-12">
                        <ExclamationTriangleIcon className="h-16 w-16 text-orange-400 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Maximum Attempts Reached</h2>
                        <p className="text-gray-600 mb-6">
                            You have used all {task.max_attempts} attempts for this quiz.
                        </p>
                        <Link 
                            to="/tasks"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            Browse Other Tasks
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <Link 
                                    to="/tasks" 
                                    className="inline-flex items-center space-x-2 text-blue-100 hover:text-white transition-colors mb-4"
                                >
                                    <ArrowLeftIcon className="h-4 w-4" />
                                    <span>Back to Tasks</span>
                                </Link>
                                <h1 className="text-3xl font-bold mb-2">{task.title}</h1>
                                <p className="text-blue-100">{task.instructions}</p>
                            </div>
                            <div className="text-right">
                                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                    <QuestionMarkCircleIcon className="h-8 w-8 mx-auto mb-2" />
                                    <div className="text-sm font-medium">Quiz Challenge</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quiz Stats */}
                    <div className="p-6 bg-gray-50 border-b border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <BoltIconSolid className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                                <div className="text-lg font-bold text-gray-900">{task.xp_reward}</div>
                                <div className="text-xs text-gray-600">XP Reward</div>
                            </div>
                            
                            {task.essence_reward > 0 && (
                                <div className="text-center">
                                    <SparklesIconSolid className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                                    <div className="text-lg font-bold text-gray-900">{task.essence_reward}</div>
                                    <div className="text-xs text-gray-600">Essence</div>
                                </div>
                            )}
                            
                            {task.time_limit_minutes && (
                                <div className="text-center">
                                    <ClockIcon className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                                    <div className="text-lg font-bold text-gray-900">{task.time_limit_minutes}m</div>
                                    <div className="text-xs text-gray-600">Time Limit</div>
                                </div>
                            )}
                            
                            <div className="text-center">
                                <TrophyIconSolid className="h-6 w-6 text-green-600 mx-auto mb-1" />
                                <div className="text-lg font-bold text-gray-900">
                                    {(task.user_attempts_used || 0) + 1}/{task.max_attempts}
                                </div>
                                <div className="text-xs text-gray-600">Attempt</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quiz Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
                    {renderQuizPanelInner()}
                </div>
            </div>
        </Layout>
    );
}