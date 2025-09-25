import { useState } from "react";
import {
  TrophyIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import apiClient from "../api/axios";
import toast from "react-hot-toast";

export default function AdminCreateBadge() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    criteria: "",
    badge_type: "achievement",
    rarity: "common",
    icon_url: "",
    color: "#3B82F6",
    points_value: 10,
    auto_award_criteria: {},
    is_secret: false,
  });
  const [loading, setLoading] = useState(false);
  const [criteriaHelper, setCriteriaHelper] = useState("");

  // Badge types and rarities from your backend
  const badgeTypes = [
    {
      value: "achievement",
      label: "Achievement",
      description: "General accomplishments",
    },
    {
      value: "milestone",
      label: "Milestone",
      description: "Significant progress markers",
    },
    {
      value: "special",
      label: "Special",
      description: "Unique or limited-time badges",
    },
    {
      value: "seasonal",
      label: "Seasonal",
      description: "Time-limited seasonal badges",
    },
    {
      value: "community",
      label: "Community",
      description: "Community-driven achievements",
    },
  ];

  const badgeRarities = [
    { value: "common", label: "Common", color: "#6B7280", points: 10 },
    { value: "uncommon", label: "Uncommon", color: "#059669", points: 25 },
    { value: "rare", label: "Rare", color: "#2563EB", points: 50 },
    { value: "epic", label: "Epic", color: "#7C3AED", points: 100 },
    { value: "legendary", label: "Legendary", color: "#DC2626", points: 200 },
  ];

  const criteriaTemplates = [
    {
      value: "first_submission",
      label: "First Submission",
      description: "Complete first task",
    },
    { value: "5_tasks", label: "5 Tasks", description: "Complete 5 tasks" },
    { value: "10_tasks", label: "10 Tasks", description: "Complete 10 tasks" },
    { value: "25_tasks", label: "25 Tasks", description: "Complete 25 tasks" },
    { value: "50_tasks", label: "50 Tasks", description: "Complete 50 tasks" },
    { value: "xp_100", label: "100 XP", description: "Earn 100 XP" },
    { value: "xp_500", label: "500 XP", description: "Earn 500 XP" },
    { value: "xp_1000", label: "1000 XP", description: "Earn 1000 XP" },
    {
      value: "streak_7",
      label: "7-day Streak",
      description: "Maintain 7-day streak",
    },
    {
      value: "streak_30",
      label: "30-day Streak",
      description: "Maintain 30-day streak",
    },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRarityChange = (rarity) => {
    const rarityData = badgeRarities.find((r) => r.value === rarity);
    setFormData((prev) => ({
      ...prev,
      rarity: rarity,
      points_value: rarityData.points,
      color: rarityData.color,
    }));
  };

  const handleCriteriaTemplate = (template) => {
    setFormData((prev) => ({ ...prev, criteria: template }));

    // Update helper text
    const templateData = criteriaTemplates.find((t) => t.value === template);
    setCriteriaHelper(templateData ? templateData.description : "");
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("Badge title is required");
      return false;
    }
    if (formData.title.length < 3 || formData.title.length > 100) {
      toast.error("Badge title must be between 3 and 100 characters");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Badge description is required");
      return false;
    }
    if (formData.description.length < 10 || formData.description.length > 500) {
      toast.error("Badge description must be between 10 and 500 characters");
      return false;
    }
    if (!formData.criteria.trim()) {
      toast.error("Badge criteria is required");
      return false;
    }
    if (formData.points_value < 1 || formData.points_value > 1000) {
      toast.error("Points value must be between 1 and 1000");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    const toastId = toast.loading("Creating badge...");

    try {
      // Use the correct endpoint from your backend
      const response = await apiClient.post("/badges/", formData);
      toast.success(`Badge '${response.data.title}' created successfully!`, {
        id: toastId,
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        criteria: "",
        badge_type: "achievement",
        rarity: "common",
        icon_url: "",
        color: "#3B82F6",
        points_value: 10,
        auto_award_criteria: {},
        is_secret: false,
      });
      setCriteriaHelper("");
    } catch (err) {
      console.error("Badge creation error:", err);
      const errorMessage =
        err.response?.data?.detail || "Failed to create badge";
      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const selectedRarity = badgeRarities.find((r) => r.value === formData.rarity);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <div className="flex items-center">
            <TrophyIcon className="h-8 w-8 text-white mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-white">
                Create New Badge
              </h2>
              <p className="text-blue-100">
                Design and configure a new achievement badge
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
                  Badge Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., First Steps Champion"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/100 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Awarded to users who complete their first impact task, marking the beginning of their journey toward making a positive difference."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/500 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="icon_url"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Icon URL (Optional)
                </label>
                <input
                  type="url"
                  id="icon_url"
                  name="icon_url"
                  value={formData.icon_url}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/badge-icon.svg"
                />
              </div>
            </div>

            {/* Badge Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Badge Preview
              </h3>
              <div className="flex items-center justify-center mb-4">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                  style={{ backgroundColor: formData.color }}
                >
                  {formData.icon_url ? (
                    <img
                      src={formData.icon_url}
                      alt="Badge icon"
                      className="w-16 h-16"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  ) : (
                    <TrophyIcon className="h-12 w-12" />
                  )}
                </div>
              </div>
              <div className="text-center">
                <h4 className="font-bold text-gray-900">
                  {formData.title || "Badge Title"}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {formData.description ||
                    "Badge description will appear here..."}
                </p>
                <div className="flex items-center justify-center mt-2 space-x-2">
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: selectedRarity?.color }}
                  >
                    {selectedRarity?.label}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formData.points_value} points
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Badge Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Badge Type
              </label>
              <select
                name="badge_type"
                value={formData.badge_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {badgeTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label} - {type.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rarity & Points
              </label>
              <div className="grid grid-cols-5 gap-1">
                {badgeRarities.map((rarity) => (
                  <button
                    key={rarity.value}
                    type="button"
                    onClick={() => handleRarityChange(rarity.value)}
                    className={`p-2 rounded-md text-xs font-medium text-white transition-all ${
                      formData.rarity === rarity.value
                        ? "ring-2 ring-offset-2 ring-gray-400 scale-105"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: rarity.color }}
                    title={`${rarity.label} - ${rarity.points} points`}
                  >
                    {rarity.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Criteria Configuration */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Award Criteria *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                {criteriaTemplates.map((template) => (
                  <button
                    key={template.value}
                    type="button"
                    onClick={() => handleCriteriaTemplate(template.value)}
                    className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                      formData.criteria === template.value
                        ? "bg-blue-100 border-blue-500 text-blue-700"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                    title={template.description}
                  >
                    {template.label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                name="criteria"
                value={formData.criteria}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., first_submission, 10_tasks, xp_500, streak_7"
              />
              {criteriaHelper && (
                <div className="flex items-center mt-2 text-sm text-blue-600">
                  <InformationCircleIcon className="h-4 w-4 mr-1" />
                  {criteriaHelper}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="color"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Badge Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="h-10 w-16 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="points_value"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Points Value
                </label>
                <input
                  type="number"
                  id="points_value"
                  name="points_value"
                  value={formData.points_value}
                  onChange={handleChange}
                  min={1}
                  max={1000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Advanced Options
            </h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_secret"
                name="is_secret"
                checked={formData.is_secret}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="is_secret"
                className="ml-2 block text-sm text-gray-900"
              >
                Secret Badge (hidden until earned)
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Badge...
                </>
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5 mr-2" />
                  Create Badge
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
