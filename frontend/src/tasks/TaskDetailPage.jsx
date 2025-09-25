import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  ClockIcon,
  TrophyIcon,
  StarIcon,
  BoltIcon,
  SparklesIcon,
  QuestionMarkCircleIcon,
  PhotoIcon,
  ShareIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  TagIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  FireIcon,
  ChartBarIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleIconSolid,
  StarIcon as StarIconSolid,
  TrophyIcon as TrophyIconSolid,
  FireIcon as FireIconSolid,
} from "@heroicons/react/24/solid";
import apiClient from "../api/axios";
import { queryKeys } from "../api/queryKeys";
import Layout from "../tasks/Layout";
import toast from "react-hot-toast";

// Task type configurations
const TASK_TYPES = {
  quiz: {
    icon: QuestionMarkCircleIcon,
    iconSolid: QuestionMarkCircleIcon,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-500",
    label: "Quiz",
  },
  upload: {
    icon: PhotoIcon,
    iconSolid: PhotoIcon,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-500",
    label: "Upload",
  },
  social_share: {
    icon: ShareIcon,
    iconSolid: ShareIcon,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-500",
    label: "Social Share",
  },
  survey: {
    icon: DocumentTextIcon,
    iconSolid: DocumentTextIcon,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-500",
    label: "Survey",
  },
  challenge: {
    icon: TrophyIcon,
    iconSolid: TrophyIconSolid,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-500",
    label: "Challenge",
  },
  report: {
    icon: DocumentTextIcon,
    iconSolid: DocumentTextIcon,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-500",
    label: "Report",
  },
};

// Difficulty configurations
const DIFFICULTY_LEVELS = {
  beginner: {
    label: "Beginner",
    color: "text-green-600",
    bgColor: "bg-green-100",
    icon: "🌱",
  },
  intermediate: {
    label: "Intermediate",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    icon: "⚡",
  },
  advanced: {
    label: "Advanced",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    icon: "🔥",
  },
  expert: {
    label: "Expert",
    color: "text-red-600",
    bgColor: "bg-red-100",
    icon: "💎",
  },
};

// ✅ FIXED: Corrected API endpoint to match your backend
const fetchTaskById = async (taskId) => {
  const { data } = await apiClient.get(`/api/tasks/${taskId}`);
  return data;
};

// ✅ FIXED: Corrected API endpoint to match your backend
const submitTaskResponse = async ({ taskId, payload }) => {
  const { data } = await apiClient.post(`/api/tasks/${taskId}/submit`, payload);
  return data;
};

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form state for different task types
  const [response, setResponse] = useState("");
  const [quizAnswer, setQuizAnswer] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [socialShareUrl, setSocialShareUrl] = useState("");
  const [startTime] = useState(Date.now());

  // ✅ ENHANCED: Better error handling and retry logic
  const {
    data: task,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: () => fetchTaskById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry 404s (task not found)
      if (error?.response?.status === 404) return false;
      return failureCount < 3;
    },
    onError: (error) => {
      console.error("Task fetch error:", error);
      if (error?.response?.status === 404) {
        toast.error("Task not found");
      } else if (error?.response?.status === 403) {
        toast.error("You do not have permission to view this task");
      }
    },
  });

  // ✅ ENHANCED: Better success and error handling
  const { mutate: submitTask, isPending: isSubmitting } = useMutation({
    mutationFn: submitTaskResponse,
    onSuccess: (data) => {
      // Handle different response formats from your backend
      const message = data.message || "Task submitted successfully!";
      toast.success(message);

      // Show XP and rewards if auto-approved
      if (data.auto_approved && data.xp_earned) {
        toast.success(`🎉 +${data.xp_earned} XP earned!`, {
          duration: 4000,
          icon: "✨",
        });
      }

      // Show level up notification
      if (data.level_up) {
        toast.success("🎊 Level up! Congratulations!", {
          duration: 5000,
          icon: "🆙",
        });
      }

      // Show badges unlocked
      if (data.badges_unlocked && data.badges_unlocked.length > 0) {
        data.badges_unlocked.forEach((badge) => {
          toast.success(`🏆 Badge unlocked: ${badge}!`, {
            duration: 4000,
            icon: "🎖️",
          });
        });
      }

      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.root() });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
      // Assuming task has a user/owner identifier for badges invalidation
      if (task?.user_id || task?.owner_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.user.badges(task.user_id || task.owner_id),
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.user.dashboard() });

      // Navigate back to tasks list
      navigate("/tasks");
    },
    onError: (err) => {
      console.error("Task submission error:", err);

      // Enhanced error message handling
      let errorMessage = "Submission failed. Please try again.";

      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 400) {
        errorMessage =
          "Invalid submission. Please check your response and try again.";
      } else if (err.response?.status === 403) {
        errorMessage = "You do not have permission to submit this task.";
      } else if (err.response?.status === 429) {
        errorMessage = "Too many attempts. Please wait before trying again.";
      }

      toast.error(errorMessage);
    },
  });

  // ✅ ENHANCED: Better form validation
  const validateSubmission = () => {
    if (task.type === "quiz") {
      if (!quizAnswer?.trim()) {
        toast.error("Please select an answer.");
        return false;
      }
    } else if (task.type === "upload") {
      if (!uploadFile && !response?.trim()) {
        toast.error("Please upload a file or provide a text response.");
        return false;
      }
    } else if (task.type === "social_share") {
      if (!socialShareUrl?.trim()) {
        toast.error("Please provide the social media post URL.");
        return false;
      }
      // Validate URL format
      try {
        new URL(socialShareUrl);
      } catch {
        toast.error("Please provide a valid URL.");
        return false;
      }
    } else {
      if (!response?.trim() || response.trim().length < 10) {
        toast.error("Please provide a response of at least 10 characters.");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateSubmission()) return;

    // Calculate time spent
    const timeSpent = Math.round((Date.now() - startTime) / 60000); // Convert to minutes

    let payload = {
      response: "Completed",
      time_spent_minutes: timeSpent,
      attachments: [],
    };

    // Handle different task types based on your backend schemas
    if (task.type === "quiz") {
      payload.response = quizAnswer.trim();
    } else if (task.type === "upload") {
      payload.response = response.trim() || "File uploaded";
      if (uploadFile) {
        // In a real app, you'd upload the file first and get a URL
        payload.attachments = [uploadFile.name];
      }
    } else if (task.type === "social_share") {
      payload.response = socialShareUrl.trim();
    } else {
      payload.response = response.trim();
    }

    submitTask({ taskId: id, payload });
  };

  const getTaskConfig = () => {
    return TASK_TYPES[task?.type] || TASK_TYPES.challenge;
  };

  const getDifficultyConfig = () => {
    return DIFFICULTY_LEVELS[task?.difficulty] || DIFFICULTY_LEVELS.beginner;
  };

  const formatTimeLimit = (minutes) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const isCompleted = () => {
    return task?.user_submission_status === "approved";
  };

  const isPending = () => {
    return task?.user_submission_status === "pending";
  };

  const isDeclined = () => {
    return (
      task?.user_submission_status === "declined" ||
      task?.user_submission_status === "rejected"
    );
  };

  const canSubmit = () => {
    return (
      !isCompleted() &&
      !isPending() &&
      (task?.user_attempts_used || 0) < (task?.max_attempts || 3)
    );
  };

  // ✅ FIXED: Better quiz question handling for your backend structure
  const renderTaskContent = () => {
    if (!task || isCompleted()) return null;

    switch (task.type) {
      case "quiz": {
        if (!task.quiz_question) return null;

        // Handle both array and object options from your backend
        let options = [];
        options = Array.isArray(task.quiz_question.options)
          ? task.quiz_question.options
          : task.quiz_question.options?.choices || [];

        return (
          <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center space-x-2">
              <QuestionMarkCircleIcon className="h-5 w-5" />
              <span>Quiz Question</span>
            </h3>
            <p className="text-gray-800 mb-4 font-medium">
              {task.quiz_question.question || "Quiz Question"}
            </p>
            <div className="space-y-3">
              {options.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center p-4 bg-white rounded-lg border hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name={`quiz-${task.id}`}
                    value={typeof option === "string" ? option : option.text}
                    checked={
                      quizAnswer ===
                      (typeof option === "string" ? option : option.text)
                    }
                    onChange={(e) => setQuizAnswer(e.target.value)}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">
                    {typeof option === "string" ? option : option.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
      }

      case "upload":
        return (
          <div className="mt-6 space-y-6">
            <div className="p-6 bg-green-50 rounded-xl border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center space-x-2">
                <PhotoIcon className="h-5 w-5" />
                <span>File Upload</span>
              </h3>
              <input
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200 transition-colors"
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
                Additional Comments (Optional)
              </label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Describe your work or provide additional details..."
              />
            </div>
          </div>
        );

      case "social_share":
        return (
          <div className="mt-6 p-6 bg-purple-50 rounded-xl border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center space-x-2">
              <ShareIcon className="h-5 w-5" />
              <span>Social Media Share</span>
            </h3>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post URL
            </label>
            <input
              type="url"
              value={socialShareUrl}
              onChange={(e) => setSocialShareUrl(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="https://twitter.com/yourpost or https://linkedin.com/posts/..."
            />
            <p className="mt-2 text-xs text-gray-600">
              Share this task on social media and paste the link here
            </p>
          </div>
        );

      case "survey":
      case "challenge":
      case "report":
      default:
        return (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Response
            </label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Share your thoughts, experience, or solution..."
            />
            <p className="text-xs text-gray-500 mt-2">
              Minimum 10 characters required • {response.length} characters
            </p>
          </div>
        );
    }
  };

  const renderStatusBadge = () => {
    if (isCompleted()) {
      return (
        <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          <CheckCircleIconSolid className="h-5 w-5" />
          <span>Completed</span>
        </div>
      );
    }

    if (isPending()) {
      return (
        <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
          <ClockIcon className="h-5 w-5" />
          <span>Pending Review</span>
        </div>
      );
    }

    if (isDeclined()) {
      return (
        <div className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <span>Needs Revision</span>
        </div>
      );
    }

    return null;
  };

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
              <ExclamationTriangleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Error Loading Task
              </h3>
              <p className="text-red-800 mb-4">
                {error?.response?.status === 404
                  ? "Task not found. It may have been removed or you may not have access to it."
                  : error?.message ||
                    "Failed to load the task. Please try again."}
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

  if (!task) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Task not found.</p>
            <Link
              to="/tasks"
              className="inline-flex items-center space-x-2 font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back to Tasks</span>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const taskConfig = getTaskConfig();
  const difficultyConfig = getDifficultyConfig();
  const TaskIcon = taskConfig.icon;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Top Navigation */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <Link
              to="/tasks"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back to Tasks</span>
            </Link>
          </div>

          {/* Task Header */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start space-x-4 flex-1">
                <div className={`p-3 rounded-xl ${taskConfig.bgColor}`}>
                  <TaskIcon className={`h-8 w-8 ${taskConfig.color}`} />
                </div>

                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {task.title}
                  </h1>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Task Type */}
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${taskConfig.bgColor} ${taskConfig.color}`}
                    >
                      {taskConfig.label}
                    </span>

                    {/* Difficulty */}
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${difficultyConfig.bgColor} ${difficultyConfig.color}`}
                    >
                      <span className="mr-1">{difficultyConfig.icon}</span>
                      {difficultyConfig.label}
                    </span>

                    {/* Category */}
                    <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      <TagIcon className="h-4 w-4 mr-1" />
                      {task.category}
                    </span>

                    {/* Featured */}
                    {task.is_featured && (
                      <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        <StarIconSolid className="h-4 w-4 mr-1" />
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              {renderStatusBadge()}
            </div>

            {/* Task Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-600 mb-1">
                  <BoltIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">XP Reward</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">
                  {task.xp_reward}
                </p>
              </div>

              {task.essence_reward > 0 && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 text-purple-600 mb-1">
                    <SparklesIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">Essence</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-700">
                    {task.essence_reward}
                  </p>
                </div>
              )}

              {task.time_limit_minutes && (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 text-orange-600 mb-1">
                    <ClockIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">Time Limit</span>
                  </div>
                  <p className="text-lg font-bold text-orange-700">
                    {formatTimeLimit(task.time_limit_minutes)}
                  </p>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-600 mb-1">
                  <EyeIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Attempts</span>
                </div>
                <p className="text-lg font-bold text-gray-700">
                  {task.user_attempts_used || 0}/{task.max_attempts}
                </p>
              </div>
            </div>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {task.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <DocumentTextIcon className="h-5 w-5" />
            <span>Instructions</span>
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {task.instructions}
            </p>
          </div>
        </div>

        {/* Task Content & Submission */}
        {canSubmit() && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Your Submission
            </h2>

            <form onSubmit={handleSubmit}>
              {renderTaskContent()}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting || !canSubmit()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    "Submit Task"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Completion Message */}
        {isCompleted() && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <CheckCircleIconSolid className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-900">
                  Task Completed!
                </h3>
                <p className="text-green-700">
                  Great job! You've successfully completed this task and earned{" "}
                  {task.xp_reward} XP.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pending Review Message */}
        {isPending() && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-900">
                  Under Review
                </h3>
                <p className="text-yellow-700">
                  Your submission is being reviewed. You'll be notified once
                  it's approved.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Needs Revision Message */}
        {isDeclined() && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-900">
                  Needs Revision
                </h3>
                <p className="text-red-700">
                  Your submission needs some changes. Please review the feedback
                  and try again.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Task Statistics */}
        {(task.completion_count > 0 ||
          task.success_rate > 0 ||
          task.average_completion_time) && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Task Statistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {task.completion_count > 0 && (
                <div className="text-center">
                  <UserIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {task.completion_count}
                  </p>
                  <p className="text-sm text-gray-600">Completions</p>
                </div>
              )}

              {task.success_rate > 0 && (
                <div className="text-center">
                  <ChartBarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(task.success_rate)}%
                  </p>
                  <p className="text-sm text-gray-600">Success Rate</p>
                </div>
              )}

              {task.average_completion_time && (
                <div className="text-center">
                  <ClockIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(task.average_completion_time)}m
                  </p>
                  <p className="text-sm text-gray-600">Avg. Time</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
