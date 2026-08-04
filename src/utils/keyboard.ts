// Shared by every keyboard shortcut on the site: a bare key must never steal
// a keystroke that belongs to a field the user is writing in.
export const isTyping = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
    target.closest('[role="dialog"]') !== null
  );
};
