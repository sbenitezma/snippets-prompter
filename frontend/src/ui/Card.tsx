import type { ComponentProps } from 'react';

export function Card({ className, ...rest }: ComponentProps<'article'>) {
  return <article className={['card', className].filter(Boolean).join(' ')} {...rest} />;
}
