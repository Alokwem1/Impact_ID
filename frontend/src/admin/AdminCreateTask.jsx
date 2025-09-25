import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import {
  PlusIcon,
  ClockIcon,
  TrophyIcon,
  SparklesIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import apiClient from "../api/axios";
import toast from "react-hot-toast";

// ✅ FIXED: Corrected API endpoint to match your backend
const createTask = async (payload) => {
  const { data } = await apiClient.post("/api/tasks/", payload);
  return data;
};

const initialFormState = {
  title: "",
  type: "report",
  difficulty: "beginner",
  instructions: "",
  category: "",
  tags: [],
  xp_reward: 10,
  essence_reward: 0,
  time_limit_minutes: null,
  max_attempts: 3,
  requires_review: true,
  is_featured: false,
  quiz_question: null,
  correct_answer: "",
  scheduled_start: "",
  scheduled_end: "",
  prerequisites: [],
};

export default function AdminCreateTask() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(initialFormState);
  const [currentTag, setCurrentTag] = useState("");
  const [quizBuilder, setQuizBuilder] = useState({
    question: "",
    options: ["", "", "", ""],
    correct_index: 0,
  });

  // ✅ ENHANCED: Task types matching your backend schemas
  const taskTypes = [
    {
      value: "report",
      label: "Report",
      description: "Text submission with detailed report",
    },
    { value: "upload", label: "Upload", description: "File upload submission" },
    { value: "quiz", label: "Quiz", description: "Multiple choice question" },
    {
      value: "social_share",
      label: "Social Share",
      description: "Social media sharing task",
    },
    { value: "survey", label: "Survey", description: "Survey completion" },
    {
      value: "challenge",
      label: "Challenge",
      description: "Special challenge task",
    },
  ];

  // ✅ ENHANCED: Difficulty levels matching your backend
  const difficulties = [
    {
      value: "beginner",
      label: "Beginner",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "intermediate",
      label: "Intermediate",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "advanced",
      label: "Advanced",
      color: "bg-orange-100 text-orange-800",
    },
    { value: "expert", label: "Expert", color: "bg-red-100 text-red-800" },
  ];

  // ✅ ENHANCED: Categories matching your backend data
  const categories = [
    "Environment",
    "Education",
    "Health",
    "Technology",
    "Community",
    "Arts",
    "Sports",
    "Business",
    "Science",
    "Other",
  ];

  // ✅ ENHANCED: Better success and error handling
  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: (data) => {
      toast.success(`Task '${data.title}' created successfully!`, {
        duration: 4000,
        icon: "🎉",
      });
      setFormData(initialFormState);
      setQuizBuilder({
        question: "",
        options: ["", "", "", ""],
        correct_index: 0,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.root() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard() });
    },
    onError: (err) => {
      console.error("Task creation error:", err);

      // Enhanced error message handling
      let errorMessage = "Failed to create task. Please try again.";

      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 400) {
        errorMessage =
          "Invalid task data. Please check your inputs and try again.";
      } else if (err.response?.status === 403) {
        errorMessage = "You do not have permission to create tasks.";
      } else if (err.response?.status === 409) {
        errorMessage = "A task with this title already exists.";
      }

      toast.error(errorMessage);
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTagAdd = () => {
    if (
      currentTag.trim() &&
      !formData.tags.includes(currentTag.trim()) &&
      formData.tags.length < 10
    ) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag("");
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleQuizBuilderChange = (field, value, index = null) => {
    setQuizBuilder((prev) => {
      if (field === "options" && index !== null) {
        const newOptions = [...prev.options];
        newOptions[index] = value;
        return { ...prev, options: newOptions };
      }
      return { ...prev, [field]: value };
    });
  };

  // ✅ ENHANCED: Better form validation
  const validateForm = () => {
    if (!formData.title.trim() || formData.title.length < 5) {
      toast.error("Task title must be at least 5 characters long");
      return false;
    }
    if (formData.title.length > 200) {
      toast.error("Task title cannot exceed 200 characters");
      return false;
    }
    if (!formData.instructions.trim() || formData.instructions.length < 10) {
      toast.error("Instructions must be at least 10 characters long");
      return false;
    }
    if (formData.instructions.length > 5000) {
      toast.error("Instructions cannot exceed 5000 characters");
      return false;
    }
    if (!formData.category.trim()) {
      toast.error("Please select a category");
      return false;
    }
    if (formData.xp_reward < 1 || formData.xp_reward > 1000) {
      toast.error("XP reward must be between 1 and 1000");
      return false;
    }
    if (formData.essence_reward < 0 || formData.essence_reward > 100) {
      toast.error("Essence reward must be between 0 and 100");
      return false;
    }
    if (formData.max_attempts < 1 || formData.max_attempts > 10) {
      toast.error("Max attempts must be between 1 and 10");
      return false;
    }
    if (
      formData.time_limit_minutes &&
      (formData.time_limit_minutes < 1 || formData.time_limit_minutes > 1440)
    ) {
      toast.error("Time limit must be between 1 and 1440 minutes");
      return false;
    }
    if (formData.type === "quiz") {
      if (!quizBuilder.question.trim()) {
        toast.error("Quiz question is required");
        return false;
      }
      if (quizBuilder.options.some((opt) => !opt.trim())) {
        toast.error("All quiz options must be filled");
        return false;
      }
      if (quizBuilder.options.length < 2) {
        toast.error("Quiz must have at least 2 options");
        return false;
      }
    }
    return true;
  };

  // ✅ ENHANCED: Better payload preparation
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    let payload = {
      ...formData,
      xp_reward: parseInt(formData.xp_reward),
      essence_reward: parseInt(formData.essence_reward),
      max_attempts: parseInt(formData.max_attempts),
      time_limit_minutes: formData.time_limit_minutes
        ? parseInt(formData.time_limit_minutes)
        : null,
      scheduled_start: formData.scheduled_start || null,
      scheduled_end: formData.scheduled_end || null,
    };

    // ✅ FIXED: Handle quiz data according to your backend schema
    if (formData.type === "quiz") {
      payload.quiz_question = {
        question: quizBuilder.question,
        options: quizBuilder.options.filter((opt) => opt.trim()),
      };
      payload.correct_answer = quizBuilder.options[quizBuilder.correct_index];
    }

    // Remove empty fields that aren't needed
    Object.keys(payload).forEach((key) => {
      if (
        payload[key] === "" ||
        (payload[key] === null &&
          key !== "time_limit_minutes" &&
          key !== "scheduled_start" &&
          key !== "scheduled_end")
      ) {
        delete payload[key];
      }
    });

    console.log("Submitting task payload:", payload); // Debug log

    mutation.mutate(payload);
  };

  const selectedDifficulty = difficulties.find(
    (d) => d.value === formData.difficulty,
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4">
          <div className="flex items-center">
            <PlusIcon className="h-8 w-8 text-white mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-white">Create New Task</h2>
              <p className="text-green-100">
                Design and configure a new impact task
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Task Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  maxLength={200}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Plant a Tree in Your Neighborhood"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/200 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Task Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {taskTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {difficulties.map((difficulty) => (
                    <button
                      key={difficulty.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          difficulty: difficulty.value,
                        }))
                      }
                      className={`p-2 rounded-md text-xs font-medium transition-all ${
                        formData.difficulty === difficulty.value
                          ? difficulty.color +
                            " ring-2 ring-offset-2 ring-blue-400"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {difficulty.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Task Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Task Preview
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="text-sm font-medium">
                    {taskTypes.find((t) => t.value === formData.type)?.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Difficulty:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${selectedDifficulty?.color}`}
                  >
                    {selectedDifficulty?.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">XP Reward:</span>
                  <span className="text-sm font-medium text-blue-600">
                    {formData.xp_reward} XP
                  </span>
                </div>
                {formData.essence_reward > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Essence Reward:
                    </span>
                    <span className="text-sm font-medium text-purple-600">
                      {formData.essence_reward} Essence
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Max Attempts:</span>
                  <span className="text-sm font-medium">
                    {formData.max_attempts}
                  </span>
                </div>
                {formData.time_limit_minutes && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Time Limit:</span>
                    <span className="text-sm font-medium text-orange-600">
                      {formData.time_limit_minutes} minutes
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label
              htmlFor="instructions"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Task Instructions *
            </label>
            <textarea
              id="instructions"
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              required
              rows={6}
              maxLength={5000}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Provide clear, detailed instructions for completing this task..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.instructions.length}/5000 characters
            </p>
          </div>

          {/* ✅ ENHANCED: Quiz Builder */}
          {formData.type === "quiz" && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-4">
              <div className="flex items-center">
                <QuestionMarkCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  Quiz Configuration
                </h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quiz Question *
                </label>
                <textarea
                  value={quizBuilder.question}
                  onChange={(e) =>
                    handleQuizBuilderChange("question", e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your quiz question..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer Options * (Select the correct answer)
                </label>
                <div className="space-y-2">
                  {quizBuilder.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="correct_answer"
                        checked={quizBuilder.correct_index === index}
                        onChange={() =>
                          handleQuizBuilderChange("correct_index", index)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) =>
                          handleQuizBuilderChange(
                            "options",
                            e.target.value,
                            index,
                          )
                        }
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {quizBuilder.correct_index === index && (
                        <span className="text-green-600 text-sm font-medium">
                          ✓ Correct
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select the radio button next to the correct answer
                </p>
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (max 10)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="ml-1.5 h-4 w-4 text-blue-400 hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleTagAdd())
                }
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={formData.tags.length >= 10}
              />
              <button
                type="button"
                onClick={handleTagAdd}
                disabled={formData.tags.length >= 10 || !currentTag.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>
            {formData.tags.length >= 10 && (
              <p className="text-xs text-orange-600 mt-1">
                Maximum 10 tags allowed
              </p>
            )}
          </div>

          {/* Rewards & Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="xp_reward"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                XP Reward (1-1000)
              </label>
              <input
                type="number"
                id="xp_reward"
                name="xp_reward"
                value={formData.xp_reward}
                onChange={handleChange}
                min={1}
                max={1000}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="essence_reward"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Essence Reward (0-100)
              </label>
              <input
                type="number"
                id="essence_reward"
                name="essence_reward"
                value={formData.essence_reward}
                onChange={handleChange}
                min={0}
                max={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="max_attempts"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Max Attempts (1-10)
              </label>
              <input
                type="number"
                id="max_attempts"
                name="max_attempts"
                value={formData.max_attempts}
                onChange={handleChange}
                min={1}
                max={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="time_limit_minutes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Time Limit (minutes, optional)
              </label>
              <input
                type="number"
                id="time_limit_minutes"
                name="time_limit_minutes"
                value={formData.time_limit_minutes || ""}
                onChange={handleChange}
                min={1}
                max={1440}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="No limit"
              />
            </div>

            <div>
              <label
                htmlFor="scheduled_start"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Start Date (optional)
              </label>
              <input
                type="datetime-local"
                id="scheduled_start"
                name="scheduled_start"
                value={formData.scheduled_start}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="scheduled_end"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                End Date (optional)
              </label>
              <input
                type="datetime-local"
                id="scheduled_end"
                name="scheduled_end"
                value={formData.scheduled_end}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Options */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Task Options
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requires_review"
                  name="requires_review"
                  checked={formData.requires_review}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="requires_review"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Requires manual review (uncheck for auto-approval)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_featured"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="is_featured"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Featured task (will be highlighted)
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed transition-all duration-200"
            >
              {mutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Task...
                </>
              ) : (
                <>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
