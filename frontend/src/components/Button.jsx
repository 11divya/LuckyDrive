import { Button as AntButton } from 'antd';

// Shared <Button> — wraps AntD with three locked variants:
//   primary   = solid gold + dark text (default for all CTAs)
//   secondary = transparent + outline border
//   ghost     = transparent, no border, muted text

const variantProps = {
  primary: { type: 'primary' },
  secondary: { type: 'default' },
  ghost: { type: 'text' },
};

export default function Button({
  variant = 'primary',
  block = false,
  size = 'large',
  className = '',
  children,
  ...rest
}) {
  const ap = variantProps[variant] || variantProps.primary;
  return (
    <AntButton
      {...ap}
      size={size}
      block={block}
      className={className}
      {...rest}
    >
      {children}
    </AntButton>
  );
}
