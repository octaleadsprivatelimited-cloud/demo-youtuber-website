'use client';
import { Children, createElement, type ComponentPropsWithRef, type JSX } from 'react';
import { useLanguage } from './LanguageProvider';
import { translate } from '@/lib/i18n/translate';

/** Localize at React render time, without rewriting React-owned DOM nodes. */
export function LocalizedElement<T extends keyof JSX.IntrinsicElements>({ as, children, ...props }: { as: T } & ComponentPropsWithRef<T>) {
  const { language, content } = useLanguage();
  const localized: Record<string, unknown> = { ...props };
  for (const key of ['title', 'alt', 'placeholder', 'aria-label']) {
    if (typeof localized[key] === 'string') localized[key] = translate(localized[key] as string, language);
  }
  // Preserve native option values: translated labels must not change form data.
  if (as === 'option' && localized.value === undefined && typeof children === 'string') localized.value = children;
  return createElement(as, localized, Children.map(children, child => typeof child === 'string' ? (language === 'te' && content[child.trim().replace(/\s+/g, ' ')] || translate(child, language)) : child));
}
