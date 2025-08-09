import React from 'react';
import { 
    ExclamationTriangleIcon,
    InformationCircleIcon,
    CheckCircleIcon,
    XCircleIcon,
    QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    children,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isConfirming = false,
    variant = 'danger', // 'danger', 'warning', 'info', 'success', 'question'
    size = 'md', // 'sm', 'md', 'lg', 'xl'
    showIcon = true,
    preventClose = false, // Prevent closing when action is in progress
}) {
    if (!isOpen) return null;

    // Handle backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !preventClose && !isConfirming) {
            onClose();
        }
    };

    // Handle escape key
    React.useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && !preventClose && !isConfirming) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose, preventClose, isConfirming]);

    // Get variant styles
    const getVariantStyles = () => {
        const variants = {
            danger: {
                icon: ExclamationTriangleIcon,
                iconColor: 'text-red-600',
                iconBg: 'bg-red-100',
                confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
                confirmButtonDisabled: 'bg-red-400'
            },
            warning: {
                icon: ExclamationTriangleIcon,
                iconColor: 'text-yellow-600',
                iconBg: 'bg-yellow-100',
                confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
                confirmButtonDisabled: 'bg-yellow-400'
            },
            info: {
                icon: InformationCircleIcon,
                iconColor: 'text-blue-600',
                iconBg: 'bg-blue-100',
                confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
                confirmButtonDisabled: 'bg-blue-400'
            },
            success: {
                icon: CheckCircleIcon,
                iconColor: 'text-green-600',
                iconBg: 'bg-green-100',
                confirmButton: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
                confirmButtonDisabled: 'bg-green-400'
            },
            question: {
                icon: QuestionMarkCircleIcon,
                iconColor: 'text-gray-600',
                iconBg: 'bg-gray-100',
                confirmButton: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500',
                confirmButtonDisabled: 'bg-gray-400'
            }
        };
        return variants[variant] || variants.danger;
    };

    // Get size styles
    const getSizeStyles = () => {
        const sizes = {
            sm: 'max-w-sm',
            md: 'max-w-md',
            lg: 'max-w-lg',
            xl: 'max-w-xl'
        };
        return sizes[size] || sizes.md;
    };

    const variantStyles = getVariantStyles();
    const sizeClass = getSizeStyles();
    const Icon = variantStyles.icon;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
            onClick={handleBackdropClick}
        >
            <div className={`bg-white rounded-lg shadow-xl p-0 w-full ${sizeClass} m-4 transform transition-all`}>
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center">
                        {showIcon && (
                            <div className={`flex-shrink-0 mx-auto w-12 h-12 flex items-center justify-center rounded-full ${variantStyles.iconBg} mr-4`}>
                                <Icon className={`h-6 w-6 ${variantStyles.iconColor}`} />
                            </div>
                        )}
                        <div className="flex-1">
                            <h3 id="modal-title" className="text-lg font-semibold text-gray-900">
                                {title}
                            </h3>
                        </div>
                        {!preventClose && !isConfirming && (
                            <button
                                onClick={onClose}
                                className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Close modal"
                            >
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-4">
                    <div className="text-sm text-gray-600 leading-relaxed">
                        {children}
                    </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        disabled={isConfirming}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isConfirming}
                        className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                            isConfirming 
                                ? variantStyles.confirmButtonDisabled + ' cursor-not-allowed'
                                : variantStyles.confirmButton
                        }`}
                    >
                        {isConfirming ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Processing...
                            </div>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Quick action variants for common use cases
export const DeleteConfirmationModal = (props) => (
    <ConfirmationModal
        variant="danger"
        confirmText="Delete"
        title="Confirm Deletion"
        showIcon={true}
        {...props}
    />
);

export const ApprovalConfirmationModal = (props) => (
    <ConfirmationModal
        variant="success"
        confirmText="Approve"
        title="Confirm Approval"
        showIcon={true}
        {...props}
    />
);

export const RejectConfirmationModal = (props) => (
    <ConfirmationModal
        variant="warning"
        confirmText="Reject"
        title="Confirm Rejection"
        showIcon={true}
        {...props}
    />
);

export const InfoConfirmationModal = (props) => (
    <ConfirmationModal
        variant="info"
        confirmText="Continue"
        title="Information"
        showIcon={true}
        {...props}
    />
);