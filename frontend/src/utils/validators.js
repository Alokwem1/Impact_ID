// ================================
// 📧 EMAIL VALIDATION
// ================================

// Enhanced email validation with comprehensive checks
export function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;

  // Remove whitespace
  email = email.trim();

  // Length check
  if (email.length === 0 || email.length > 255) return false;

  // Enhanced regex pattern for better email validation
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  // Basic format check
  if (!emailRegex.test(email)) return false;

  // Additional checks for common issues
  if (email.includes("..")) return false; // No consecutive dots
  if (email.startsWith(".") || email.endsWith(".")) return false; // No leading/trailing dots
  if (email.includes("@.") || email.includes(".@")) return false; // No dots adjacent to @

  return true;
}

// Email validation with detailed error messages
export function validateEmail(email) {
  if (!email || typeof email !== "string") {
    return { isValid: false, error: "Email is required" };
  }

  email = email.trim();

  if (email.length === 0) {
    return { isValid: false, error: "Email is required" };
  }

  if (email.length > 255) {
    return { isValid: false, error: "Email must be less than 255 characters" };
  }

  if (!isValidEmail(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }

  return { isValid: true, error: null };
}

// ================================
// 👤 USERNAME VALIDATION
// ================================

// Enhanced username validation matching your RegisterPage requirements
export function isValidUsername(username) {
  if (!username || typeof username !== "string") return false;

  // Length check (3-50 characters as per your RegisterPage)
  if (username.length < 3 || username.length > 50) return false;

  // Pattern check: letters, numbers, and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  return usernameRegex.test(username);
}

// Username validation with detailed error messages
export function validateUsername(username) {
  if (!username || typeof username !== "string") {
    return { isValid: false, error: "Username is required" };
  }

  username = username.trim();

  if (username.length === 0) {
    return { isValid: false, error: "Username is required" };
  }

  if (username.length < 3) {
    return { isValid: false, error: "Username must be at least 3 characters" };
  }

  if (username.length > 50) {
    return {
      isValid: false,
      error: "Username must be less than 50 characters",
    };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      isValid: false,
      error: "Username can only contain letters, numbers, and underscores",
    };
  }

  // Additional checks for quality usernames
  if (username.startsWith("_") || username.endsWith("_")) {
    return {
      isValid: false,
      error: "Username cannot start or end with underscores",
    };
  }

  if (username.includes("__")) {
    return {
      isValid: false,
      error: "Username cannot contain consecutive underscores",
    };
  }

  // Reserved usernames check
  const reservedUsernames = [
    "admin",
    "administrator",
    "root",
    "api",
    "www",
    "mail",
    "email",
    "support",
    "help",
    "info",
    "contact",
    "service",
    "system",
    "null",
    "undefined",
    "anonymous",
    "guest",
    "user",
    "users",
    "impact",
    "impactid",
    "impact_id",
    "moderator",
    "mod",
    "test",
    "demo",
    "example",
    "sample",
  ];

  if (reservedUsernames.includes(username.toLowerCase())) {
    return {
      isValid: false,
      error: "This username is reserved. Please choose another.",
    };
  }

  return { isValid: true, error: null };
}

// ================================
// 🔐 PASSWORD VALIDATION
// ================================

// Enhanced password validation matching your RegisterPage requirements
export function isValidPassword(password) {
  if (!password || typeof password !== "string") return false;

  // Length check (8-128 characters as per your RegisterPage)
  if (password.length < 8 || password.length > 128) return false;

  // Strength requirements: at least one uppercase, one lowercase, and one number
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  return hasLowercase && hasUppercase && hasNumber;
}

// Password validation with detailed error messages
export function validatePassword(password) {
  if (!password || typeof password !== "string") {
    return { isValid: false, error: "Password is required" };
  }

  if (password.length === 0) {
    return { isValid: false, error: "Password is required" };
  }

  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters" };
  }

  if (password.length > 128) {
    return {
      isValid: false,
      error: "Password must be less than 128 characters",
    };
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return {
      isValid: false,
      error:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    };
  }

  // Additional security checks
  if (/(.)\1{2,}/.test(password)) {
    return {
      isValid: false,
      error:
        "Password cannot contain more than 2 consecutive identical characters",
    };
  }

  // Common weak patterns
  const weakPatterns = [
    /^123456/,
    /password/i,
    /^qwerty/i,
    /^abc123/i,
    /^admin/i,
  ];

  for (const pattern of weakPatterns) {
    if (pattern.test(password)) {
      return {
        isValid: false,
        error: "Password is too common. Please choose a more secure password.",
      };
    }
  }

  return { isValid: true, error: null };
}

// Password strength assessment
export function getPasswordStrength(password) {
  if (!password) return { score: 0, level: "none", feedback: [] };

  let score = 0;
  const feedback = [];

  // Length scoring
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
    feedback.push("Great! Contains special characters");
  }

  // Complexity bonuses
  if (!/(.)\1{1,}/.test(password)) {
    score += 1;
    feedback.push("No repeated characters");
  }

  if (!/^[a-zA-Z]*$/.test(password) && !/^\d*$/.test(password)) {
    score += 1;
  }

  // Determine level
  let level = "weak";
  if (score >= 6) level = "strong";
  else if (score >= 4) level = "medium";
  else if (score >= 2) level = "fair";

  // Add helpful feedback
  if (password.length < 12) feedback.push("Consider using 12+ characters");
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
    feedback.push("Add special characters for extra security");

  return { score, level, feedback };
}

// ================================
// 🔗 WALLET ADDRESS VALIDATION
// ================================

// Ethereum wallet address validation
export function isValidEthereumAddress(address) {
  if (!address || typeof address !== "string") return false;

  // Remove 0x prefix if present
  const cleanAddress = address.toLowerCase().replace(/^0x/, "");

  // Check length (40 hex characters)
  if (cleanAddress.length !== 40) return false;

  // Check hex format
  return /^[0-9a-f]{40}$/i.test(cleanAddress);
}

// Wallet address validation with error messages
export function validateWalletAddress(address) {
  if (!address || typeof address !== "string") {
    return { isValid: false, error: "Wallet address is required" };
  }

  address = address.trim();

  if (!isValidEthereumAddress(address)) {
    return {
      isValid: false,
      error: "Please enter a valid Ethereum wallet address",
    };
  }

  return { isValid: true, error: null };
}

// ================================
// 📋 FORM VALIDATION
// ================================

// Enhanced registration form validation matching your RegisterPage
export function validateRegistrationForm({
  username,
  email,
  password,
  confirmPassword,
  fullName = "",
}) {
  const errors = {};

  // Username validation
  const usernameResult = validateUsername(username);
  if (!usernameResult.isValid) {
    errors.username = usernameResult.error;
  }

  // Email validation
  const emailResult = validateEmail(email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error;
  }

  // Password validation
  const passwordResult = validatePassword(password);
  if (!passwordResult.isValid) {
    errors.password = passwordResult.error;
  }

  // Confirm password validation
  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  // Full name validation (optional but validate if provided)
  if (fullName && fullName.trim()) {
    if (fullName.trim().length > 100) {
      errors.fullName = "Full name must be less than 100 characters";
    }
    if (!/^[a-zA-Z\s'-]+$/.test(fullName.trim())) {
      errors.fullName =
        "Full name can only contain letters, spaces, hyphens, and apostrophes";
    }
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

// Login form validation
export function validateLoginForm({ username, password }) {
  const errors = {};

  if (!username || !username.trim()) {
    errors.username = "Username or email is required";
  }

  if (!password) {
    errors.password = "Password is required";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

// Profile update validation
export function validateProfileUpdate({ username, email, fullName, bio }) {
  const errors = {};

  // Username validation (if provided)
  if (username !== undefined) {
    const usernameResult = validateUsername(username);
    if (!usernameResult.isValid) {
      errors.username = usernameResult.error;
    }
  }

  // Email validation (if provided)
  if (email !== undefined) {
    const emailResult = validateEmail(email);
    if (!emailResult.isValid) {
      errors.email = emailResult.error;
    }
  }

  // Full name validation (if provided)
  if (fullName !== undefined && fullName.trim()) {
    if (fullName.trim().length > 100) {
      errors.fullName = "Full name must be less than 100 characters";
    }
    if (!/^[a-zA-Z\s'-]+$/.test(fullName.trim())) {
      errors.fullName =
        "Full name can only contain letters, spaces, hyphens, and apostrophes";
    }
  }

  // Bio validation (if provided)
  if (bio !== undefined && bio.trim()) {
    if (bio.trim().length > 500) {
      errors.bio = "Bio must be less than 500 characters";
    }
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

// ================================
// 🔧 UTILITY FUNCTIONS
// ================================

// Sanitize input by removing dangerous characters
export function sanitizeInput(input) {
  if (!input || typeof input !== "string") return "";

  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/['"]/g, "") // Remove quotes
    .substring(0, 1000); // Limit length
}

// Check if string contains only safe characters
export function isSafeString(str) {
  if (!str || typeof str !== "string") return false;

  // Allow letters, numbers, spaces, and common punctuation
  return /^[a-zA-Z0-9\s\-_.@]+$/.test(str);
}

// Validate URL format
export function isValidUrl(url) {
  if (!url || typeof url !== "string") return false;

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

// Real-time validation debouncer
export function createValidator(validationFn, delay = 300) {
  let timeoutId;

  return function validate(value, callback) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const result = validationFn(value);
      callback(result);
    }, delay);
  };
}

// ================================
// 📊 VALIDATION HELPERS
// ================================

// Get validation status icon
export function getValidationIcon(isValid, isValidating = false) {
  if (isValidating) return "⏳";
  if (isValid === null || isValid === undefined) return "";
  return isValid ? "✅" : "❌";
}

// Get validation CSS classes
export function getValidationClasses(isValid, touched = false) {
  const baseClasses = "border transition-colors duration-200";

  if (!touched) {
    return `${baseClasses} border-gray-300 focus:border-blue-500`;
  }

  if (isValid === true) {
    return `${baseClasses} border-green-500 focus:border-green-600`;
  }

  if (isValid === false) {
    return `${baseClasses} border-red-500 focus:border-red-600`;
  }

  return `${baseClasses} border-gray-300 focus:border-blue-500`;
}

// Export validation constants
export const VALIDATION_CONSTANTS = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  EMAIL_MAX_LENGTH: 255,
  FULL_NAME_MAX_LENGTH: 100,
  BIO_MAX_LENGTH: 500,
};

// Export regex patterns
export const VALIDATION_PATTERNS = {
  EMAIL:
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  USERNAME: /^[a-zA-Z0-9_]+$/,
  PASSWORD_STRENGTH: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  ETHEREUM_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  SAFE_STRING: /^[a-zA-Z0-9\s\-_.@]+$/,
};
