import React from 'react';
import PropTypes from 'prop-types';
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
    preventClose = false, // Prevent close when action is in progress
}) {
    const modalRef = React.useRef(null);
    const closeButtonRef = React.useRef(null);
    const previouslyFocusedElement = React.useRef(null);

    // Capture element that had focus before opening
    React.useEffect(() => {
        if (isOpen) {
            previouslyFocusedElement.current = document.activeElement;
        }
    }, [isOpen]);

    // Handle escape key - MUST be called before early return
    React.useEffect(() => {
        if (!isOpen) return;
        
        const handleEscape = (e) => {
            if (e.key === 'Escape' && !preventClose && !isConfirming) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose, preventClose, isConfirming]);

    // Manage initial focus when modal opens for accessibility
    React.useEffect(() => {
        if (!isOpen) return;
        // Prefer focusing the close button if present, otherwise the modal container
        const toFocus = closeButtonRef.current || modalRef.current;
        if (toFocus && typeof toFocus.focus === 'function') {
            // Slight delay to ensure element is mounted
            setTimeout(() => toFocus.focus(), 0);
        }
    }, [isOpen]);

    // Return focus to the previously focused element when modal closes
    React.useEffect(() => {
        if (!isOpen && previouslyFocusedElement.current && typeof previouslyFocusedElement.current.focus === 'function') {
            previouslyFocusedElement.current.focus();
        }
    }, [isOpen]);

    // Basic focus trap within modal
    React.useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key !== 'Tab') return;
            const focusableSelectors = [
                'a[href]','button:not([disabled])','textarea:not([disabled])','input:not([disabled])','select:not([disabled])','[tabindex]:not([tabindex="-1"])'
            ];
            const focusable = modalRef.current ? Array.from(modalRef.current.querySelectorAll(focusableSelectors.join(','))) : [];
            if (focusable.length === 0) return;
            const firstEl = focusable[0];
            const lastEl = focusable[focusable.length - 1];
            if (!e.shiftKey && document.activeElement === lastEl) {
                e.preventDefault();
                firstEl.focus();
            } else if (e.shiftKey && document.activeElement === firstEl) {
                e.preventDefault();
                lastEl.focus();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Early return after hooks
    if (!isOpen) return null;

    // Handle backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !preventClose && !isConfirming) {
            onClose();
        }
    };

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
            onClick={handleBackdropClick}
            onKeyDown={(e) => {
                if (e.key === 'Escape' && !preventClose && !isConfirming) {
                    onClose();
                }
            }}
            role="dialog"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            aria-modal="true"
            aria-live="assertive"
        >
            <div
                ref={modalRef}
                className={`bg-white rounded-lg shadow-xl p-0 w-full ${sizeClass} m-4 transform transition-all`}
                tabIndex={-1}
            >
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
                                ref={closeButtonRef}
                                className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Close modal"
                            >
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-4" id="modal-description">
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

// PropTypes for ConfirmationModal
ConfirmationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    isConfirming: PropTypes.bool,
    variant: PropTypes.oneOf(['danger', 'warning', 'info', 'success', 'question']),
    size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
    showIcon: PropTypes.bool,
    preventClose: PropTypes.bool
};

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