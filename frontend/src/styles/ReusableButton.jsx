import React from 'react';
import {
    ArrowRightIcon,
    CheckIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    SparklesIcon,
    BoltIcon,
    TrophyIcon
} from '@heroicons/react/24/outline';
import {
    CheckIcon as CheckIconSolid,
    SparklesIcon as SparklesIconSolid,
    BoltIcon as BoltIconSolid,
    TrophyIcon as TrophyIconSolid
} from '@heroicons/react/24/solid';

export default function Button({ 
    children, 
    onClick, 
    variant = 'primary', 
    size = 'medium',
    type = 'button', 
    disabled = false,
    loading = false,
    icon = null,
    iconPosition = 'left',
    fullWidth = false,
    rounded = 'default',
    shadow = true,
    className = '',
    ariaLabel = null,
    tooltip = null,
    animate = true,
    ...props 
}) {
    // Base styles for all buttons
    const baseStyles = `
        inline-flex items-center justify-center font-semibold border 
        transition-all duration-200 ease-in-out 
        focus:outline-none focus:ring-2 focus:ring-offset-2 
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-95 select-none
        ${fullWidth ? 'w-full' : ''}
        ${animate ? 'transform hover:scale-105' : ''}
        ${shadow ? 'shadow-sm hover:shadow-md' : ''}
    `.trim().replace(/\s+/g, ' ');

    // Size variants
    const sizeStyles = {
        small: 'px-3 py-1.5 text-xs',
        medium: 'px-6 py-2.5 text-sm',
        large: 'px-8 py-3 text-base',
        xl: 'px-10 py-4 text-lg'
    };

    // Rounded variants
    const roundedStyles = {
        none: 'rounded-none',
        small: 'rounded-md',
        default: 'rounded-lg',
        large: 'rounded-xl',
        full: 'rounded-full'
    };

    // Color variants matching Impact ID branding
    const variantStyles = {
        // Primary - Impact ID blue gradient
        primary: `
            bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent 
            hover:from-blue-700 hover:to-indigo-700 
            focus:ring-blue-500
            shadow-blue-500/25 hover:shadow-blue-500/40
        `,
        
        // Secondary - Clean white with blue accent
        secondary: `
            bg-white text-blue-600 border-blue-200 
            hover:bg-blue-50 hover:border-blue-300 
            focus:ring-blue-500
        `,
        
        // Success - Green for achievements and completions
        success: `
            bg-gradient-to-r from-green-600 to-emerald-600 text-white border-transparent 
            hover:from-green-700 hover:to-emerald-700 
            focus:ring-green-500
            shadow-green-500/25 hover:shadow-green-500/40
        `,
        
        // Danger - Red for destructive actions
        danger: `
            bg-gradient-to-r from-red-600 to-rose-600 text-white border-transparent 
            hover:from-red-700 hover:to-rose-700 
            focus:ring-red-500
            shadow-red-500/25 hover:shadow-red-500/40
        `,
        
        // Warning - Orange for caution
        warning: `
            bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent 
            hover:from-orange-600 hover:to-amber-600 
            focus:ring-orange-500
            shadow-orange-500/25 hover:shadow-orange-500/40
        `,
        
        // Info - Blue for informational actions
        info: `
            bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-transparent 
            hover:from-cyan-600 hover:to-blue-600 
            focus:ring-cyan-500
            shadow-cyan-500/25 hover:shadow-cyan-500/40
        `,
        
        // Ghost - Transparent with hover effects
        ghost: `
            bg-transparent text-gray-600 border-transparent 
            hover:bg-gray-100 hover:text-gray-900 
            focus:ring-gray-500
        `,
        
        // Outline - Border only
        outline: `
            bg-transparent text-blue-600 border-blue-600 
            hover:bg-blue-600 hover:text-white 
            focus:ring-blue-500
        `,
        
        // Special variants for Impact ID platform
        impact: `
            bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent 
            hover:from-purple-700 hover:to-pink-700 
            focus:ring-purple-500
            shadow-purple-500/25 hover:shadow-purple-500/40
        `,
        
        xp: `
            bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-transparent 
            hover:from-yellow-600 hover:to-orange-600 
            focus:ring-yellow-500
            shadow-yellow-500/25 hover:shadow-yellow-500/40
        `,
        
        badge: `
            bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-transparent 
            hover:from-amber-600 hover:to-yellow-600 
            focus:ring-amber-500
            shadow-amber-500/25 hover:shadow-amber-500/40
        `
    };

    // Loading spinner component
    const LoadingSpinner = () => (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    );

    // Get appropriate icon based on variant
    const getVariantIcon = () => {
        if (loading) return <LoadingSpinner />;
        if (icon) return icon;
        
        const iconMap = {
            success: <CheckIconSolid className="h-4 w-4" />,
            danger: <XMarkIcon className="h-4 w-4" />,
            warning: <ExclamationTriangleIcon className="h-4 w-4" />,
            info: <InformationCircleIcon className="h-4 w-4" />,
            impact: <SparklesIconSolid className="h-4 w-4" />,
            xp: <BoltIconSolid className="h-4 w-4" />,
            badge: <TrophyIconSolid className="h-4 w-4" />
        };
        
        return iconMap[variant] || null;
    };

    const displayIcon = getVariantIcon();
    const hasIcon = displayIcon && !loading;
    const hasChildren = children && !loading;

    // Combine all styles
    const buttonClasses = `
        ${baseStyles}
        ${sizeStyles[size]}
        ${roundedStyles[rounded]}
        ${variantStyles[variant]}
        ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
        <div className={tooltip ? 'relative group' : ''}>
            <button
                type={type}
                onClick={onClick}
                disabled={disabled || loading}
                className={buttonClasses}
                aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
                aria-busy={loading}
                {...props}
            >
                {/* Left Icon */}
                {hasIcon && iconPosition === 'left' && (
                    <span className={hasChildren ? 'mr-2' : ''}>
                        {displayIcon}
                    </span>
                )}
                
                {/* Loading Spinner */}
                {loading && (
                    <span className={hasChildren ? 'mr-2' : ''}>
                        <LoadingSpinner />
                    </span>
                )}
                
                {/* Button Content */}
                {hasChildren && (
                    <span className={loading ? 'opacity-75' : ''}>
                        {children}
                    </span>
                )}
                
                {/* Right Icon */}
                {hasIcon && iconPosition === 'right' && (
                    <span className={hasChildren ? 'ml-2' : ''}>
                        {displayIcon}
                    </span>
                )}
            </button>
            
            {/* Tooltip */}
            {tooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                    <div className="bg-gray-900 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap">
                        {tooltip}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Pre-configured button variants for common Impact ID use cases
export const SubmitButton = (props) => (
    <Button variant="primary" icon={<ArrowRightIcon className="h-4 w-4" />} iconPosition="right" {...props} />
);

export const SuccessButton = (props) => (
    <Button variant="success" {...props} />
);

export const DangerButton = (props) => (
    <Button variant="danger" {...props} />
);

export const XPButton = (props) => (
    <Button variant="xp" {...props} />
);

export const BadgeButton = (props) => (
    <Button variant="badge" {...props} />
);

export const ImpactButton = (props) => (
    <Button variant="impact" {...props} />
);

// Button group component for related actions
export const ButtonGroup = ({ children, className = '' }) => (
    <div className={`inline-flex rounded-lg shadow-sm ${className}`} role="group">
        {React.Children.map(children, (child, index) => {
            if (!React.isValidElement(child)) return child;
            
            const isFirst = index === 0;
            const isLast = index === React.Children.count(children) - 1;
            
            return React.cloneElement(child, {
                ...child.props,
                rounded: 'none',
                className: `
                    ${child.props.className || ''} 
                    ${isFirst ? 'rounded-l-lg' : ''} 
                    ${isLast ? 'rounded-r-lg' : ''} 
                    ${!isFirst ? '-ml-px' : ''}
                `.trim()
            });
        })}
    </div>
);