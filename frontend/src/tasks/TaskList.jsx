import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  TrophyIcon,
  FireIcon,
  AcademicCapIcon,
  TagIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleIconSolid,
  StarIcon as StarIconSolid,
} from "@heroicons/react/24/solid";
import apiClient from "../api/axios";
import { queryKeys } from "../api/queryKeys";
import TaskItem from "../tasks/TaskItem";
import toast from "react-hot-toast";

// Task categories from your backend
const TASK_CATEGORIES = [
  "Environment",
  "Education",
  "Social Impact",
  "Technology",
  "Health",
  "Community",
  "Sustainability",
  "Innovation",
  "Arts & Culture",
  "Research",
];

// Difficulty levels
const DIFFICULTY_LEVELS = {
  beginner: {
    label: "Beginner",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  intermediate: {
    label: "Intermediate",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  advanced: {
    label: "Advanced",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  expert: {
    label: "Expert",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
};

// Completion status options
const COMPLETION_STATUS = {
  all: { label: "All Tasks", icon: ListBulletIcon },
  available: { label: "Available", icon: ClockIcon },
  completed: { label: "Completed", icon: CheckCircleIcon },
  featured: { label: "Featured", icon: StarIcon },
};

// Define the data-fetching function with filters
const fetchTasks = async (filters) => {
  const params = new URLSearchParams();

  if (filters.category) params.append("category", filters.category);
  if (filters.difficulty) params.append("difficulty", filters.difficulty);
  if (filters.completed !== null) params.append("completed", filters.completed);
  if (filters.limit) params.append("limit", filters.limit);
  if (filters.offset) params.append("offset", filters.offset);

  const { data } = await apiClient.get(`/api/tasks/?${params.toString()}`);
  return data;
};

// Fetch task categories
const fetchTaskCategories = async () => {
  const { data } = await apiClient.get("/api/tasks/categories");
  return data;
};

export default function TaskList() {
  const [filters, setFilters] = useState({
    category: "",
    difficulty: "",
    completed: null,
    limit: 20,
    offset: 0,
  });
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch tasks with current filters
  const {
    data: tasks,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: queryKeys.tasks.list(filters),
    queryFn: () => fetchTasks(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch available categories
  const { data: categories } = useQuery({
    queryKey: queryKeys.tasks.categories(),
    queryFn: fetchTaskCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  });

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      offset: 0, // Reset pagination when filters change
    }));
  }, []);

  const handleCompletionFilter = useCallback(
    (status) => {
      let completedValue = null;
      if (status === "completed") completedValue = true;
      if (status === "available") completedValue = false;

      handleFilterChange("completed", completedValue);
    },
    [handleFilterChange],
  );

  const handleRefresh = useCallback(() => {
    refetch();
    toast.success("Tasks refreshed!");
  }, [refetch]);

  const clearFilters = useCallback(() => {
    setFilters({
      category: "",
      difficulty: "",
      completed: null,
      limit: 20,
      offset: 0,
    });
    setSearchTerm("");
    toast.success("Filters cleared!");
  }, []);

  // Filter tasks by search term locally (for better UX)
  const filteredTasks =
    tasks?.filter(
      (task) =>
        !searchTerm ||
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tags?.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
    ) || [];

  // Get current completion status for display
  const getCurrentCompletionStatus = () => {
    if (filters.completed === true) return "completed";
    if (filters.completed === false) return "available";
    return "all";
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div
      className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
    >
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-white rounded-lg p-6 shadow-sm animate-pulse"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
            <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-gray-300 rounded w-full"></div>
            <div className="h-3 bg-gray-300 rounded w-5/6"></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-300 rounded w-20"></div>
            <div className="h-8 w-24 bg-gray-300 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading && !tasks) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-32"></div>
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center justify-center text-center">
          <div>
            <p className="text-red-800 mb-4">
              {error?.message || "Failed to load tasks."}
            </p>
            <button
              onClick={handleRefresh}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
            <TrophyIcon className="h-7 w-7 text-yellow-600" />
            <span>Your Tasks</span>
          </h2>
          <p className="text-gray-600 mt-1">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}{" "}
            available
            {filters.category && ` in ${filters.category}`}
            {filters.difficulty &&
              ` • ${DIFFICULTY_LEVELS[filters.difficulty]?.label}`}
          </p>
        </div>

        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="Grid view"
            >
              <Squares2X2Icon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded transition-colors ${
                viewMode === "list"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="List view"
            >
              <ListBulletIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg border transition-colors ${
              showFilters ||
              Object.values(filters).some((v) => v && v !== 20 && v !== 0)
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FunnelIcon className="h-4 w-4" />
            <span>Filters</span>
          </button>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh tasks"
          >
            <ArrowPathIcon
              className={`h-5 w-5 ${isFetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search tasks by title, category, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Filter Tasks
            </h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Completion Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="space-y-2">
                {Object.entries(COMPLETION_STATUS).map(([key, config]) => {
                  const Icon = config.icon;
                  const isActive = getCurrentCompletionStatus() === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleCompletionFilter(key)}
                      className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                        isActive
                          ? "bg-blue-50 border-blue-300 text-blue-700"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{config.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {(categories || TASK_CATEGORIES).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={filters.difficulty}
                onChange={(e) =>
                  handleFilterChange("difficulty", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Levels</option>
                {Object.entries(DIFFICULTY_LEVELS).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {(filters.category ||
        filters.difficulty ||
        filters.completed !== null ||
        searchTerm) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>

          {filters.category && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              <TagIcon className="h-3 w-3" />
              <span>{filters.category}</span>
              <button
                onClick={() => handleFilterChange("category", "")}
                className="ml-1 hover:text-blue-600"
              >
                ×
              </button>
            </span>
          )}

          {filters.difficulty && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
              <AcademicCapIcon className="h-3 w-3" />
              <span>{DIFFICULTY_LEVELS[filters.difficulty]?.label}</span>
              <button
                onClick={() => handleFilterChange("difficulty", "")}
                className="ml-1 hover:text-yellow-600"
              >
                ×
              </button>
            </span>
          )}

          {filters.completed !== null && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
              <CheckCircleIcon className="h-3 w-3" />
              <span>{filters.completed ? "Completed" : "Available"}</span>
              <button
                onClick={() => handleFilterChange("completed", null)}
                className="ml-1 hover:text-green-600"
              >
                ×
              </button>
            </span>
          )}

          {searchTerm && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
              <MagnifyingGlassIcon className="h-3 w-3" />
              <span>"{searchTerm}"</span>
              <button
                onClick={() => setSearchTerm("")}
                className="ml-1 hover:text-purple-600"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}

      {/* Task Grid/List */}
      {filteredTasks.length > 0 ? (
        <div
          className={`grid gap-4 ${
            viewMode === "grid"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          }`}
        >
          {filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} viewMode={viewMode} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-8 shadow-sm text-center">
          <TrophyIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ||
            Object.values(filters).some((v) => v && v !== 20 && v !== 0)
              ? "No tasks match your criteria"
              : "No tasks available"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ||
            Object.values(filters).some((v) => v && v !== 20 && v !== 0)
              ? "Try adjusting your filters or search terms."
              : "Check back later for new tasks!"}
          </p>
          {(searchTerm ||
            Object.values(filters).some((v) => v && v !== 20 && v !== 0)) && (
            <button
              onClick={clearFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Loading overlay for filtering */}
      {isFetching && tasks && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-gray-700">Updating tasks...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
