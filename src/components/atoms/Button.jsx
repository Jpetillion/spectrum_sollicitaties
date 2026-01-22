export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  as,
  ...props
}) {
  const baseClasses = 'button';
  const variantClass = `button--${variant}`;
  const sizeClass = `button--${size}`;
  const disabledClass = disabled ? 'button--disabled' : '';

  const Component = as || 'button';
  const elementProps = Component === 'button' ? { type, disabled } : {};

  return (
    <Component
      className={`${baseClasses} ${variantClass} ${sizeClass} ${disabledClass} ${className}`.trim()}
      onClick={onClick}
      {...elementProps}
      {...props}
    >
      {children}
    </Component>
  );
}
