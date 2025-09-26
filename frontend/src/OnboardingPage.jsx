import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./utils/AuthContext";
import { useTheme } from "./ThemeContext";
import apiClient from "./api/axios";
import toast from "react-hot-toast";
import debounce from "lodash.debounce";
import {
  UserIcon,
  SparklesIcon,
  TrophyIcon,
  GlobeAltIcon,
  ArrowRightIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// ================================
// 🎉 WELCOME CELEBRATION MODAL
// ================================
function WelcomeModal({ isOpen, onClose, userData }) {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl text-center max-w-md mx-4 transform animate-fadeInUp">
        {/* Celebration Header */}
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-gradient-brand rounded-full flex items-center justify-center mx-auto mb-4 animate-bounceGentle">
            <SparklesIcon className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 text-4xl animate-bounce">
            🎉
          </div>
          <div className="absolute -top-2 -left-2 text-4xl animate-bounce delay-300">
            ✨
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gradient-brand mb-2">
          Welcome to Impact ID!
        </h2>
        <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
          Hey {userData?.fullName || "there"}! 👋
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your journey to making a positive impact starts now. Let's change the
          world together!
        </p>

        {/* Quick Stats Preview */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-xp-100 dark:bg-xp-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-xl">🎯</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Start with
            </p>
            <p className="font-bold text-xp-600">0 XP</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-streak-100 dark:bg-streak-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-xl">🔥</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Streak</p>
            <p className="font-bold text-streak-600">0 days</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-essence-100 dark:bg-essence-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-xl">💎</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Essence</p>
            <p className="font-bold text-essence-600">0</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full btn-impact bg-gradient-brand text-white font-bold py-3 px-6 rounded-xl hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <span>Start My Journey</span>
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ================================
// 🎮 IMPACT CATEGORY SELECTION
// ================================
function ImpactCategoryStep({ selectedCategories, onCategoryToggle }) {
  const categories = [
    {
      id: "environment",
      name: "Environment",
      icon: "🌱",
      color: "bg-impact-environment",
      description: "Climate action & sustainability",
    },
    {
      id: "social",
      name: "Social Impact",
      icon: "🤝",
      color: "bg-impact-social",
      description: "Community & social justice",
    },
    {
      id: "technology",
      name: "Technology",
      icon: "💻",
      color: "bg-impact-technology",
      description: "Innovation & digital access",
    },
    {
      id: "education",
      name: "Education",
      icon: "📚",
      color: "bg-impact-education",
      description: "Learning & knowledge sharing",
    },
    {
      id: "health",
      name: "Health",
      icon: "❤️",
      color: "bg-impact-health",
      description: "Wellness & healthcare",
    },
    {
      id: "community",
      name: "Community",
      icon: "🏘️",
      color: "bg-impact-community",
      description: "Local & global communities",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          What impact areas interest you?
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Choose one or more areas where you'd like to make a difference
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryToggle(category.id)}
            className={`
                            p-4 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden
                            ${
                              selectedCategories.includes(category.id)
                                ? "border-brand-blue bg-brand-blue/10 dark:bg-brand-blue/20"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                            }
                        `}
          >
            {selectedCategories.includes(category.id) && (
              <div className="absolute top-2 right-2">
                <CheckIcon className="w-5 h-5 text-brand-blue" />
              </div>
            )}

            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center text-white`}
              >
                <span className="text-lg">{category.icon}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                  {category.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {category.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ================================
// 📋 MAIN ONBOARDING COMPONENT
// ================================
export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    bio: "",
    impactCategories: [],
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const { refetchUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const totalSteps = 3;

  // ================================
  // 🔍 USERNAME AVAILABILITY CHECK
  // ================================
  const checkUsername = debounce(async () => {
    if (formData.username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const response = await apiClient.get("/api/auth/check-username", {
        params: { username: formData.username },
      });
      setUsernameAvailable(response.data.available);
    } catch (error) {
      console.error("Error checking username availability:", error);
      setUsernameAvailable(false);
    } finally {
      setCheckingUsername(false);
    }
  }, 500);

  useEffect(() => {
    checkUsername();
    return () => checkUsername.cancel();
  }, [formData.username]);

  // ================================
  // 📝 FORM HANDLERS
  // ================================
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCategoryToggle = (categoryId) => {
    setFormData((prev) => ({
      ...prev,
      impactCategories: prev.impactCategories.includes(categoryId)
        ? prev.impactCategories.filter((id) => id !== categoryId)
        : [...prev.impactCategories, categoryId],
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.username) {
      return toast.error("Full Name and Username are required.");
    }

    if (!usernameAvailable) {
      return toast.error("Please choose an available username.");
    }

    setLoading(true);
    try {
      await apiClient.put("/api/users/@me", {
        username: formData.username.trim(),
        bio: formData.bio ? formData.bio.trim() : undefined,
      });
      await refetchUser();
      toast.success("Welcome to Impact ID! 🎉");
      setShowModal(true);
    } catch (err) {
      console.error("Error during onboarding:", err);
      toast.error(err.response?.data?.detail || "Onboarding failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate("/dashboard");
  };

  // ================================
  // 🎨 STEP VALIDATION
  // ================================
  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName.trim().length > 0;
      case 2:
        return formData.username.trim().length >= 3 && usernameAvailable;
      case 3:
        return true; // Optional step
      default:
        return false;
    }
  };

  const canSubmit = () => {
    return (
      formData.fullName.trim().length > 0 &&
      formData.username.trim().length >= 3 &&
      usernameAvailable
    );
  };

  // ================================
  // 🎯 RENDER STEP CONTENT
  // ================================
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-brand-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                What should we call you?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Let's start with your name
              </p>
            </div>

            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="input w-full"
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-brand-purple rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">@</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                Choose your username
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This is how others will find you on Impact ID
              </p>
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="@your_username"
                  className={`input w-full pr-10 ${
                    formData.username.length >= 3
                      ? usernameAvailable === true
                        ? "border-green-500 focus:ring-green-500"
                        : usernameAvailable === false
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      : ""
                  }`}
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {checkingUsername ? (
                    <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-brand-blue rounded-full"></div>
                  ) : formData.username.length >= 3 ? (
                    usernameAvailable === true ? (
                      <CheckIcon className="h-5 w-5 text-green-500" />
                    ) : usernameAvailable === false ? (
                      <XMarkIcon className="h-5 w-5 text-red-500" />
                    ) : null
                  ) : null}
                </div>
              </div>

              {formData.username.length >= 3 && (
                <p
                  className={`text-sm mt-2 ${
                    usernameAvailable === true
                      ? "text-green-600"
                      : usernameAvailable === false
                        ? "text-red-600"
                        : "text-gray-500"
                  }`}
                >
                  {checkingUsername
                    ? "Checking availability..."
                    : usernameAvailable === true
                      ? "✓ Username is available!"
                      : usernameAvailable === false
                        ? "✗ Username is taken"
                        : "Checking..."}
                </p>
              )}

              {formData.username.length > 0 && formData.username.length < 3 && (
                <p className="text-sm text-gray-500 mt-2">
                  Username must be at least 3 characters
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Bio (Optional)
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us a bit about yourself..."
                rows={3}
                className="input w-full resize-none"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <ImpactCategoryStep
            selectedCategories={formData.impactCategories}
            onCategoryToggle={handleCategoryToggle}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm font-medium text-brand-blue">
                {Math.round((currentStep / totalSteps) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-brand h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <GlobeAltIcon className="w-8 h-8 text-brand-blue" />
              <h1 className="text-2xl font-bold text-gradient-brand">
                Impact ID
              </h1>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
              Complete Your Profile
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Let's set up your account to start making an impact
            </p>
          </div>

          {/* Form */}
          <div className="card-impact">
            <form onSubmit={handleSubmit} className="space-y-6">
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={`
                                        px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                                        ${
                                          currentStep === 1
                                            ? "text-gray-400 cursor-not-allowed"
                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        }
                                    `}
                >
                  Back
                </button>

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceedToNextStep()}
                    className={`
                                            px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2
                                            ${
                                              canProceedToNextStep()
                                                ? "bg-brand-blue text-white hover:bg-brand-blue-dark"
                                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            }
                                        `}
                  >
                    <span>Next</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !canSubmit()}
                    className={`
                                            px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2
                                            ${
                                              canSubmit() && !loading
                                                ? "bg-gradient-brand text-white hover:scale-105"
                                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            }
                                        `}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Setting up...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Setup</span>
                        <TrophyIcon className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      <WelcomeModal
        isOpen={showModal}
        onClose={handleModalClose}
        userData={formData}
      />
    </>
  );
}
