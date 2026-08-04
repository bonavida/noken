import { useEffect } from 'react';
import { isTyping } from '@/utils/keyboard';

type Handlers = Record<string, (() => void) | undefined>;

// Answering with the keyboard is what makes drilling fast: number keys pick an
// option, space reveals or advances. Handlers are read on every render so they
// always see current state; an undefined entry means the key is inert for now.
export const useQuizKeys = (handlers: Handlers) => {
  useEffect(() => {
    const onKeydown = (event: KeyboardEvent) => {
      // Modifiers belong to the browser (⌘1 switches tabs)
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTyping(event.target)) return;

      const handler = handlers[event.key];
      if (!handler) return;
      event.preventDefault();
      handler();
    };

    document.addEventListener('keydown', onKeydown);
    return () => document.removeEventListener('keydown', onKeydown);
  });
};
