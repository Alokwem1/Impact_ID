import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  MapPinIcon,
  GlobeAltIcon,
  CameraIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import apiClient from "../api/axios";
import { queryKeys } from "../api/queryKeys";
import toast from "react-hot-toast";
import { useAuth } from "../utils/AuthContext";

// ================================
// 📊 CORRECTED API FUNCTIONS
// ================================

// ✅ FIXED: Corrected API endpoint to match your backend users router
const updateUserProfile = async (payload) => {
  const { data } = await apiClient.put("/api/users/@me", payload);
  return data;
};

// ✅ FIXED: Corrected API endpoint to match your backend auth router
const changePassword = async (payload) => {
  const { data } = await apiClient.post("/api/auth/change-password", payload);
  return data;
};

// ✅ FIXED: Corrected API endpoint to match your backend users router
const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  const { data } = await apiClient.post("/api/users/@me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Check username availability (backend exposes /api/auth/check-username?username=<value>)
const checkUsernameAvailability = async (username) => {
  if (!username) return false;
  try {
    const { data } = await apiClient.get("/api/auth/check-username", {
      params: { username },
    });
    return !!data.available;
  } catch (error) {
    return false;
  }
};

// Check email availability (backend exposes /api/auth/check-email?email=<value>)
const checkEmailAvailability = async (email) => {
  if (!email) return false;
  try {
    const { data } = await apiClient.get("/api/auth/check-email", {
      params: { email },
    });
    return !!data.available;
  } catch (error) {
    return false;
  }
};

// ================================
// 🛠️ UTILITY FUNCTIONS
// ================================

const validateUrl = (url) => {
  if (!url) return true;
  try {
    new URL(url.startsWith("http") ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
};

const validateSocialLink = (platform, value) => {
  if (!value) return true;

  const patterns = {
    twitter: /^@?[\w]+$/,
    linkedin: /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$|^[\w-]+$/,
    github: /^(https?:\/\/)?(www\.)?github\.com\/[\w-]+\/?$|^[\w-]+$/,
    instagram: /^@?[\w.]+$/,
  };

  return patterns[platform] ? patterns[platform].test(value) : true;
};

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, level: "weak", feedback: [] };

  let score = 0;
  const feedback = [];

  // Length scoring
  if (password.length >= 8) score += 1;
  else feedback.push("At least 8 characters");

  if (password.length >= 12) score += 1;
  else if (password.length >= 8)
    feedback.push("12+ characters for better security");

  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push("Include lowercase letters");

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push("Include uppercase letters");

  if (/\d/.test(password)) score += 1;
  else feedback.push("Include numbers");

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push("Include special characters");

  // Determine level
  let level = "weak";
  if (score >= 5) level = "strong";
  else if (score >= 3) level = "medium";

  return { score, level, feedback };
};

export default function UpdateProfileForm() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Availability checking state
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Enhanced profile form data with validation
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    bio: "",
    location: "",
    website: "",
    social_links: {
      twitter: "",
      linkedin: "",
      github: "",
      instagram: "",
    },
    privacy_settings: {
      show_email: false,
      show_location: true,
      show_streak: true,
      show_badges: true,
    },
  });

  // Enhanced password form data
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Form validation errors
  const [errors, setErrors] = useState({});

  // Effect to sync form state when user data becomes available
  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        social_links: {
          twitter: user.social_links?.twitter || "",
          linkedin: user.social_links?.linkedin || "",
          github: user.social_links?.github || "",
          instagram: user.social_links?.instagram || "",
        },
        privacy_settings: {
          show_email: user.privacy_settings?.show_email ?? false,
          show_location: user.privacy_settings?.show_location ?? true,
          show_streak: user.privacy_settings?.show_streak ?? true,
          show_badges: user.privacy_settings?.show_badges ?? true,
        },
      }));
    }
  }, [user]);

  // Debounced availability checking
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (
        profileData.username &&
        profileData.username !== user?.username &&
        profileData.username.length >= 3
      ) {
        setCheckingAvailability(true);
        const available = await checkUsernameAvailability(profileData.username);
        setUsernameAvailable(available);
        setCheckingAvailability(false);
      } else {
        setUsernameAvailable(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [profileData.username, user?.username]);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (
        profileData.email &&
        profileData.email !== user?.email &&
        profileData.email.includes("@")
      ) {
        setCheckingAvailability(true);
        const available = await checkEmailAvailability(profileData.email);
        setEmailAvailable(available);
        setCheckingAvailability(false);
      } else {
        setEmailAvailable(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [profileData.email, user?.email]);

  // ✅ ENHANCED: Profile update mutation with better error handling
  const profileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      toast.success("Profile updated successfully!", {
        icon: "✅",
        duration: 3000,
      });
      if (refreshUser) refreshUser();
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
      if (user?.username) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.user.profile(user.username),
        });
      }
      setErrors({});
    },
    onError: (err) => {
      console.error("Profile update error:", err);
      const errorMessage =
        err.response?.data?.detail || "Failed to update profile.";
      toast.error(errorMessage);

      // Handle field-specific errors
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    },
  });

  // ✅ ENHANCED: Password change mutation with better error handling
  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Password changed successfully!", {
        icon: "🔐",
        duration: 3000,
      });
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setErrors({});
    },
    onError: (err) => {
      console.error("Password change error:", err);
      const errorMessage =
        err.response?.data?.detail || "Failed to change password.";
      toast.error(errorMessage);
    },
  });

  // ✅ ENHANCED: Avatar upload mutation with better progress tracking
  const avatarMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (data) => {
      toast.success("Avatar updated successfully!", {
        icon: "📸",
        duration: 3000,
      });
      if (refreshUser) refreshUser();
      setAvatarPreview(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
    onError: (err) => {
      console.error("Avatar upload error:", err);
      const errorMessage =
        err.response?.data?.detail || "Failed to upload avatar.";
      toast.error(errorMessage);
      setAvatarPreview(null);
    },
  });

  // Enhanced form change handler with validation
  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Clear field-specific errors
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }

    if (name.startsWith("social_")) {
      const platform = name.replace("social_", "");
      setProfileData((prev) => ({
        ...prev,
        social_links: {
          ...prev.social_links,
          [platform]: value,
        },
      }));

      // Validate social link
      if (value && !validateSocialLink(platform, value)) {
        setErrors((prev) => ({
          ...prev,
          [name]: `Invalid ${platform} format`,
        }));
      }
    } else if (name.startsWith("privacy_")) {
      const setting = name.replace("privacy_", "");
      setProfileData((prev) => ({
        ...prev,
        privacy_settings: {
          ...prev.privacy_settings,
          [setting]: checked,
        },
      }));
    } else {
      setProfileData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));

      // Real-time validation
      if (name === "website" && value && !validateUrl(value)) {
        setErrors((prev) => ({
          ...prev,
          website: "Please enter a valid URL",
        }));
      }

      if (name === "username" && value.length > 0 && value.length < 3) {
        setErrors((prev) => ({
          ...prev,
          username: "Username must be at least 3 characters",
        }));
      }
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear password errors
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);

      avatarMutation.mutate(file);
    }
  };

  // Enhanced form validation
  const validateProfileForm = () => {
    const newErrors = {};

    if (!profileData.username || profileData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!profileData.email || !profileData.email.includes("@")) {
      newErrors.email = "Please enter a valid email address";
    }

    if (profileData.website && !validateUrl(profileData.website)) {
      newErrors.website = "Please enter a valid URL";
    }

    if (usernameAvailable === false) {
      newErrors.username = "Username is already taken";
    }

    if (emailAvailable === false) {
      newErrors.email = "Email is already in use";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    // Build payload with only changed fields
    const payload = {};
    const originalUser = user || {};

    if (profileData.username !== originalUser.username)
      payload.username = profileData.username;
    if (profileData.email !== originalUser.email)
      payload.email = profileData.email;
    if (profileData.bio !== (originalUser.bio || ""))
      payload.bio = profileData.bio;
    if (profileData.location !== (originalUser.location || ""))
      payload.location = profileData.location;
    if (profileData.website !== (originalUser.website || ""))
      payload.website = profileData.website;

    // Check if social links changed
    const originalSocial = originalUser.social_links || {};
    if (
      JSON.stringify(profileData.social_links) !==
      JSON.stringify(originalSocial)
    ) {
      payload.social_links = profileData.social_links;
    }

    // Check if privacy settings changed
    const originalPrivacy = originalUser.privacy_settings || {};
    if (
      JSON.stringify(profileData.privacy_settings) !==
      JSON.stringify(originalPrivacy)
    ) {
      payload.privacy_settings = profileData.privacy_settings;
    }

    if (Object.keys(payload).length === 0) {
      return toast.error("No changes to update.");
    }

    profileMutation.mutate(payload);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    if (!passwordData.current_password) {
      return toast.error("Current password is required.");
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      return toast.error("New passwords do not match.");
    }

    const strength = getPasswordStrength(passwordData.new_password);
    if (strength.level === "weak") {
      return toast.error(
        "Password is too weak. Please follow the requirements.",
      );
    }

    passwordMutation.mutate({
      current_password: passwordData.current_password,
      new_password: passwordData.new_password,
    });
  };

  const tabs = [
    { id: "profile", label: "Profile Info", icon: UserIcon },
    { id: "security", label: "Security", icon: LockClosedIcon },
    { id: "privacy", label: "Privacy", icon: EyeIcon },
  ];

  // Get input field classes with error states
  const getInputClasses = (fieldName, hasIcon = false) => {
    const baseClasses = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
      hasIcon ? "pl-10" : ""
    }`;

    if (errors[fieldName]) {
      return `${baseClasses} border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500`;
    }

    return `${baseClasses} border-gray-300 focus:ring-blue-500 focus:border-transparent`;
  };

  const passwordStrength = getPasswordStrength(passwordData.new_password);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Account Settings</h2>
            <p className="text-blue-100 mt-1">
              Manage your profile, security, and privacy settings
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-6">
        {/* Enhanced Profile Tab */}
        {activeTab === "profile" && (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Enhanced Avatar Section */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="Current avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-xl font-bold">
                        {user?.username?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                  <CameraIcon className="h-4 w-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={avatarMutation.isPending}
                  />
                </label>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Profile Picture
                </h3>
                <p className="text-sm text-gray-600">
                  Upload a new avatar (max 5MB, JPG/PNG)
                </p>
                {avatarMutation.isPending && (
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-blue-600">Uploading...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    value={profileData.username}
                    onChange={handleProfileChange}
                    className={getInputClasses("username", true)}
                    placeholder="Enter your username"
                    required
                  />
                  {checkingAvailability && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    </div>
                  )}
                  {usernameAvailable === true && (
                    <CheckCircleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                  {usernameAvailable === false && (
                    <ExclamationTriangleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
                  )}
                </div>
                {errors.username && (
                  <p className="text-xs text-red-500 mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className={getInputClasses("email", true)}
                    placeholder="Enter your email"
                    required
                  />
                  {emailAvailable === true && (
                    <CheckCircleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                  {emailAvailable === false && (
                    <ExclamationTriangleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
                  )}
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Enhanced Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleProfileChange}
                rows={3}
                maxLength={500}
                className={getInputClasses("bio")}
                placeholder="Tell us about yourself..."
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  {profileData.bio.length}/500 characters
                </p>
                {profileData.bio.length > 450 && (
                  <p className="text-xs text-orange-500">
                    {500 - profileData.bio.length} remaining
                  </p>
                )}
              </div>
            </div>

            {/* Enhanced Location & Website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    value={profileData.location}
                    onChange={handleProfileChange}
                    className={getInputClasses("location", true)}
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <div className="relative">
                  <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    name="website"
                    value={profileData.website}
                    onChange={handleProfileChange}
                    className={getInputClasses("website", true)}
                    placeholder="https://yourwebsite.com"
                  />
                  {profileData.website && validateUrl(profileData.website) && (
                    <CheckCircleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                </div>
                {errors.website && (
                  <p className="text-xs text-red-500 mt-1">{errors.website}</p>
                )}
              </div>
            </div>

            {/* Enhanced Social Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Social Links
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(profileData.social_links).map(
                  ([platform, url]) => (
                    <div key={platform}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {platform}
                      </label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name={`social_${platform}`}
                          value={url}
                          onChange={handleProfileChange}
                          className={getInputClasses(
                            `social_${platform}`,
                            true,
                          )}
                          placeholder={`Your ${platform} handle or URL`}
                        />
                        {url && validateSocialLink(platform, url) && (
                          <CheckCircleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                        )}
                      </div>
                      {errors[`social_${platform}`] && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors[`social_${platform}`]}
                        </p>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={
                profileMutation.isPending ||
                checkingAvailability ||
                usernameAvailable === false ||
                emailAvailable === false
              }
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {profileMutation.isPending ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                "Save Profile Changes"
              )}
            </button>
          </form>
        )}

        {/* Enhanced Security Tab */}
        {activeTab === "security" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <ShieldCheckIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Change Password
                </h3>
                <p className="text-sm text-gray-600">
                  Update your password to keep your account secure.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password *
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password *
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {passwordData.new_password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-medium text-gray-600">
                      Password Strength:
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        passwordStrength.level === "strong"
                          ? "text-green-600"
                          : passwordStrength.level === "medium"
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {passwordStrength.level.toUpperCase()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.level === "strong"
                          ? "bg-green-500"
                          : passwordStrength.level === "medium"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{
                        width: `${(passwordStrength.score / 6) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  className={`pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    passwordData.confirm_password &&
                    passwordData.new_password !== passwordData.confirm_password
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Confirm new password"
                  required
                />
                {passwordData.confirm_password &&
                  passwordData.new_password ===
                    passwordData.confirm_password && (
                    <CheckCircleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
              </div>
              {passwordData.confirm_password &&
                passwordData.new_password !== passwordData.confirm_password && (
                  <p className="text-xs text-red-500 mt-1">
                    Passwords do not match
                  </p>
                )}
            </div>

            {/* Enhanced Password Requirements */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center space-x-2">
                <KeyIcon className="h-4 w-4" />
                <span>Password Requirements:</span>
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon
                    className={`h-4 w-4 ${passwordData.new_password.length >= 8 ? "text-green-500" : "text-gray-400"}`}
                  />
                  <span>At least 8 characters long</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon
                    className={`h-4 w-4 ${/[A-Z]/.test(passwordData.new_password) ? "text-green-500" : "text-gray-400"}`}
                  />
                  <span>Contains uppercase letter</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon
                    className={`h-4 w-4 ${/[a-z]/.test(passwordData.new_password) ? "text-green-500" : "text-gray-400"}`}
                  />
                  <span>Contains lowercase letter</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon
                    className={`h-4 w-4 ${/\d/.test(passwordData.new_password) ? "text-green-500" : "text-gray-400"}`}
                  />
                  <span>Contains number</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon
                    className={`h-4 w-4 ${/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.new_password) ? "text-green-500" : "text-gray-400"}`}
                  />
                  <span>Contains special character</span>
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={
                passwordMutation.isPending || passwordStrength.level === "weak"
              }
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {passwordMutation.isPending ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Changing Password...</span>
                </div>
              ) : (
                "Change Password"
              )}
            </button>
          </form>
        )}

        {/* Enhanced Privacy Tab */}
        {activeTab === "privacy" && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <EyeIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Privacy Settings
                </h3>
                <p className="text-sm text-gray-600">
                  Control what information is visible on your public profile.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(profileData.privacy_settings).map(
                ([setting, enabled]) => (
                  <div
                    key={setting}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 capitalize">
                        {setting.replace("show_", "").replace("_", " ")}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {setting === "show_email" &&
                          "Display your email address on your public profile"}
                        {setting === "show_location" &&
                          "Show your location to other users"}
                        {setting === "show_streak" &&
                          "Display your current streak on your profile"}
                        {setting === "show_badges" &&
                          "Show your earned badges to other users"}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        name={`privacy_${setting}`}
                        checked={enabled}
                        onChange={handleProfileChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ),
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">
                    Privacy Note
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    These settings control your public profile visibility. Some
                    information may still be visible to administrators for
                    platform functionality.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleProfileSubmit}
              disabled={profileMutation.isPending}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {profileMutation.isPending ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                "Save Privacy Settings"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
