import { useState } from 'react';

interface TagBadgeProps {
	tag: string;
	isSelected?: boolean;
	onClick?: (tag: string, selected: boolean) => void;
	variant?: 'default' | 'filter';
	size?: 'sm' | 'md';
	disabled?: boolean;
}

export default function TagBadge({
	tag,
	isSelected = false,
	onClick,
	variant = 'default',
	size = 'md',
	disabled = false,
}: TagBadgeProps) {
	const handleClick = () => {
		if (!disabled && onClick) {
			onClick(tag, !isSelected);
		}
	};

	const baseClasses = 'badge tag-badge';
	const variantClasses = {
		default: 'badge-secondary',
		filter: isSelected ? 'badge-primary' : 'badge-outline-secondary',
	};
	const sizeClasses = {
		sm: 'tag-badge-sm',
		md: '',
	};
	const interactiveClasses = onClick && !disabled ? 'tag-badge-interactive' : '';
	const disabledClasses = disabled ? 'tag-badge-disabled' : '';

	const className = [
		baseClasses,
		variantClasses[variant],
		sizeClasses[size],
		interactiveClasses,
		disabledClasses,
	]
		.filter(Boolean)
		.join(' ');

	const TagComponent = onClick && !disabled ? 'button' : 'span';

	return (
		<TagComponent
			type={TagComponent === 'button' ? 'button' : undefined}
			className={className}
			onClick={handleClick}
			disabled={disabled}
			aria-pressed={onClick ? isSelected : undefined}
			role={onClick ? 'button' : undefined}
		>
			{tag}
		</TagComponent>
	);
}