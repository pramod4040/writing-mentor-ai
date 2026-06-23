'use client';

import { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

type AccordionContextValue = {
  openItems: string[];
  toggle: (id: string) => void;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);

export function Accordion({
  children,
  className,
  defaultOpen = [],
}: {
  children: React.ReactNode;
  className?: string;
  defaultOpen?: string[];
}) {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  const toggle = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggle }}>
      <div className={cn('space-y-2', className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn('rounded-lg border border-[var(--border)] bg-[var(--card)]', className)}
      data-accordion-id={id}
    >
      {children}
    </div>
  );
}

export function AccordionTrigger({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('AccordionTrigger must be used within Accordion');
  const isOpen = ctx.openItems.includes(id);

  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center justify-between px-4 py-3 text-left text-base font-medium hover:bg-[var(--accent-soft)]',
        className,
      )}
      onClick={() => ctx.toggle(id)}
      aria-expanded={isOpen}
    >
      <span>{children}</span>
      <span className="text-[var(--muted)]">{isOpen ? '−' : '+'}</span>
    </button>
  );
}

export function AccordionContent({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('AccordionContent must be used within Accordion');
  if (!ctx.openItems.includes(id)) return null;

  return (
    <div className={cn('border-t border-[var(--border)] px-4 py-3', className)}>{children}</div>
  );
}
