import { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid,
} from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

export default function Question({
  question,
  onAnswerSelect,
  onNext,
  disabled = false,
  isSubmitting = false,
  showExplanation = true,
  timeLimit = null,
  questionNumber = 1,
  totalQuestions = 1,
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());

  // Timer for tracking time spent on question
  useEffect(() => {
    if (isSubmitted || disabled) return;

    const interval = setInterval(() => {
      setTimeSpent(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [isSubmitted, disabled, startTime]);

  // Auto-submit if time limit reached (for timed questions)
  useEffect(() => {
    if (timeLimit && timeSpent >= timeLimit * 1000 && !isSubmitted) {
      handleSubmit(true); // Auto-submit
    }
  }, [timeSpent, timeLimit, isSubmitted]);

  const handleSubmit = (autoSubmit = false) => {
    if (!selectedOption && !autoSubmit) {
      toast.error("Please select an answer before submitting.", {
        icon: "⚠️",
        duration: 3000,
      });
      return;
    }

    if (autoSubmit && !selectedOption) {
      toast.error("Time's up! No answer selected.", {
        icon: "⏰",
        duration: 4000,
      });
    }

    // Based on your backend structure, questions have options array
    const isCorrect =
      selectedOption === question.correct_answer ||
      (question.options &&
        selectedOption ===
          question.options.find((opt) => opt.is_correct)?.text);

    onAnswerSelect(selectedOption || "", isCorrect);
    setIsSubmitted(true);

    // Show immediate feedback
    if (isCorrect) {
      toast.success("Correct! Well done! 🎉", {
        duration: 3000,
        icon: "✅",
      });
    } else {
      toast.error("Not quite right. Keep learning! 💪", {
        duration: 3000,
        icon: "❌",
      });
    }
  };

  const handleOptionSelect = (option) => {
    if (isSubmitted || disabled) return;
    setSelectedOption(option);
  };

  const getOptionClasses = (option) => {
    const baseClasses =
      "relative block p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-[1.02]";

    if (disabled && !isSubmitted) {
      return `${baseClasses} opacity-50 cursor-not-allowed bg-gray-50 border-gray-200`;
    }

    if (isSubmitted) {
      const isCorrect =
        option === question.correct_answer ||
        (question.options &&
          question.options.find((opt) => opt.text === option)?.is_correct);
      const isSelected = option === selectedOption;

      if (isCorrect) {
        return `${baseClasses} bg-green-50 border-green-500 text-green-900 cursor-default shadow-lg`;
      } else if (isSelected && !isCorrect) {
        return `${baseClasses} bg-red-50 border-red-500 text-red-900 cursor-default shadow-lg`;
      } else {
        return `${baseClasses} opacity-60 bg-gray-50 border-gray-300 cursor-default`;
      }
    } else if (option === selectedOption) {
      return `${baseClasses} bg-blue-50 border-blue-500 text-blue-900 shadow-md ring-2 ring-blue-200`;
    } else {
      return `${baseClasses} bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md`;
    }
  };

  const getOptionIcon = (option) => {
    if (!isSubmitted) return null;

    const isCorrect =
      option === question.correct_answer ||
      (question.options &&
        question.options.find((opt) => opt.text === option)?.is_correct);
    const isSelected = option === selectedOption;

    if (isCorrect) {
      return <CheckCircleIconSolid className="h-6 w-6 text-green-600" />;
    } else if (isSelected && !isCorrect) {
      return <XCircleIconSolid className="h-6 w-6 text-red-600" />;
    }
    return null;
  };

  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Parse question options - handle both array and simple string formats
  const getQuestionOptions = () => {
    if (question.options && Array.isArray(question.options)) {
      return question.options.map((opt) => opt.text || opt);
    }
    // For simple quiz questions, create options from the question text
    // This would be customized based on your exact data structure
    return question.choices || [];
  };

  const questionOptions = getQuestionOptions();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Question Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border border-blue-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <QuestionMarkCircleIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">
                Question {questionNumber} of {totalQuestions}
              </h3>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center space-x-1 text-gray-500 text-sm">
                  <ClockIcon className="h-4 w-4" />
                  <span>Time: {formatTime(timeSpent)}</span>
                </div>
                {timeLimit && (
                  <div className="flex items-center space-x-1 text-orange-600 text-sm">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <span>Limit: {timeLimit}s</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hint Button */}
          {question.hint && !isSubmitted && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center space-x-1 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
            >
              <LightBulbIcon className="h-4 w-4" />
              <span>Hint</span>
            </button>
          )}
        </div>

        {/* Question Text */}
        <h2 className="text-xl font-bold text-gray-900 leading-relaxed">
          {question.question || question.text}
        </h2>

        {/* Hint Display */}
        {showHint && question.hint && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <LightBulbIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">Hint:</h4>
                <p className="text-yellow-800 text-sm mt-1">{question.hint}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Question Options */}
      <div className="space-y-3 mb-6">
        {questionOptions.length > 0 ? (
          questionOptions.map((option, index) => (
            <label key={index} className={getOptionClasses(option)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name={`question-${question.id || "current"}`}
                    value={option}
                    checked={option === selectedOption}
                    onChange={() => handleOptionSelect(option)}
                    className="hidden"
                    disabled={isSubmitted || disabled}
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 transition-colors ${
                      option === selectedOption
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {option === selectedOption && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                  <span className="text-gray-900 font-medium">{option}</span>
                </div>
                {getOptionIcon(option)}
              </div>
            </label>
          ))
        ) : (
          // Fallback for questions without structured options
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">
              This question requires a text response.
            </p>
            <textarea
              value={selectedOption || ""}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="w-full mt-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Type your answer here..."
              disabled={isSubmitted || disabled}
            />
          </div>
        )}
      </div>

      {/* Explanation */}
      {isSubmitted && showExplanation && question.explanation && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-start space-x-3">
            <SparklesIcon className="h-6 w-6 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
              <p className="text-blue-800 leading-relaxed">
                {question.explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {!isSubmitted ? (
          <button
            onClick={() => handleSubmit()}
            disabled={disabled || isSubmitting}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </div>
            ) : (
              "Submit Answer"
            )}
          </button>
        ) : (
          <button
            onClick={onNext}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
          >
            Next Question
          </button>
        )}
      </div>
    </div>
  );
}
