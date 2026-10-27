import type { ButtonHTMLAttributes } from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Visual intent. Defaults to the primary action. */
  tone?: 'primary' | 'secondary' | 'danger';
};

export function Button({ tone = 'primary', type = 'button', ...rest }: ButtonProps) {
  return <button className="btn" data-tone={tone} type={type} {...rest} />;
}
