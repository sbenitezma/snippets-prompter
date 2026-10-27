import type { HTMLAttributes } from 'react';

export function Card({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return <article className={['card', className].filter(Boolean).join(' ')} {...rest} />;
}
