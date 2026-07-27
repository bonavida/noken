import { Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FuriganaText } from '@/components/FuriganaText';
import { Button } from '@/ui/react/button';
import { cn } from '@/utils/cn';
import {
  prepareEntries,
  searchEntries,
  type Searchable,
  type SearchEntry,
  type SearchKind,
} from '@/utils/search';

interface SearchDialogProps {
  labels: {
    open: string;
    title: string;
    placeholder: string;
    loading: string;
    empty: string;
    hint: string;
    groups: Record<SearchKind, string>;
    navigate: string;
    select: string;
    close: string;
    lesson: string;
  };
}

const INDEX_URL = '/search-index.json';
const MAX_RESULTS = 24;

// True when the keystroke belongs to a field the user is writing in, so the
// bare "/" shortcut leaves the vocabulary filter and quiz inputs alone
const isTyping = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
    target.closest('[role="dialog"]') !== null
  );
};

// Results arrive sorted by score, so grouping by first appearance keeps the
// best match at the top while still gathering each kind together.
const groupResults = (results: Searchable[]) =>
  results.reduce<{ kind: SearchKind; items: Searchable[] }[]>((groups, entry) => {
    const group = groups.find((candidate) => candidate.kind === entry.kind);
    if (group) {
      group.items.push(entry);
      return groups;
    }
    return [...groups, { kind: entry.kind, items: [entry] }];
  }, []);

export const SearchDialog = ({ labels }: SearchDialogProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState<Searchable[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeRef = useRef<HTMLAnchorElement | null>(null);
  // Guards against a second fetch while the first is still in flight
  const requested = useRef(false);

  // Fetched on demand rather than in an effect: the dialog opening is the event
  // that needs the data, and the index never changes afterwards.
  const loadIndex = async () => {
    if (requested.current) return;
    requested.current = true;
    setLoading(true);
    try {
      const response = await fetch(INDEX_URL);
      setEntries(prepareEntries((await response.json()) as SearchEntry[]));
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const openDialog = () => {
    setOpen(true);
    void loadIndex();
  };

  // ⌘K / Ctrl+K toggles from anywhere; "/" opens, but only while reading, since
  // it is a printable character that belongs to whatever field has the focus
  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      const withModifier = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (withModifier) {
        event.preventDefault();
        setOpen((current) => {
          if (!current) void loadIndex();
          return !current;
        });
        return;
      }

      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTyping(event.target)) return;
      event.preventDefault();
      setOpen(true);
      void loadIndex();
    };
    document.addEventListener('keydown', onShortcut);
    return () => document.removeEventListener('keydown', onShortcut);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // The island is persisted across view transitions, so it has to close itself
  // once a result has taken the user somewhere else
  useEffect(() => {
    const onNavigation = () => {
      setOpen(false);
      setQuery('');
      setActive(0);
    };
    document.addEventListener('astro:after-swap', onNavigation);
    return () => document.removeEventListener('astro:after-swap', onNavigation);
  }, []);

  const results = useMemo(
    () => (entries ? searchEntries(entries, query, MAX_RESULTS) : []),
    [entries, query]
  );

  // Flat order for keyboard navigation, matching the rendered group order
  const flat = useMemo(() => groupResults(results).flatMap(({ items }) => items), [results]);
  const groups = useMemo(() => groupResults(results), [results]);

  const close = () => {
    setOpen(false);
    setQuery('');
    setActive(0);
  };

  const onKeydown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      close();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((current) => (flat.length === 0 ? 0 : (current + 1) % flat.length));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((current) => (flat.length === 0 ? 0 : (current - 1 + flat.length) % flat.length));
      return;
    }
    if (event.key !== 'Enter') return;
    // Clicking the anchor keeps view transitions working, unlike assigning href
    event.preventDefault();
    activeRef.current?.click();
  };

  // Position in the flat list: rows that share an href (two words from the same
  // lesson) must still highlight one at a time
  const flatIndex = useMemo(() => new Map(flat.map((entry, index) => [entry, index])), [flat]);

  return (
    <>
      {/* The wide trigger exists to advertise the shortcut; below lg there is
      no room for it and no keyboard to speak of, so an icon button stands in */}
      <button
        type="button"
        onClick={openDialog}
        className="text-muted-foreground hover:border-primary/40 hover:text-foreground hidden items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm transition-colors lg:inline-flex"
      >
        <Search className="size-4" aria-hidden="true" />
        <span>{labels.open}</span>
        {/* Both labels ship in the HTML and CSS picks one, so the key is right
        before paint instead of waiting for this island to hydrate */}
        <kbd className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs font-medium">
          <span className="mac:inline hidden">⌘K</span>
          <span className="mac:hidden">Ctrl K</span>
        </kbd>
      </button>

      <Button
        variant="ghost"
        size="icon"
        aria-label={labels.open}
        onClick={openDialog}
        className="lg:hidden"
      >
        <Search className="size-5" />
      </Button>

      {/* Portalled to the body: the header's backdrop-blur would otherwise be
      the containing block, trapping this overlay inside the header strip */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6">
            <button
              type="button"
              aria-label={labels.close}
              tabIndex={-1}
              onClick={close}
              className="bg-background/80 absolute inset-0 cursor-default backdrop-blur-sm"
            />

            <div
              role="dialog"
              aria-modal="true"
              aria-label={labels.title}
              className="bg-card relative mt-8 flex w-full max-w-xl flex-col overflow-hidden rounded-lg border shadow-2xl sm:mt-16"
            >
              <div className="flex items-center gap-2 border-b px-4">
                <Search className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
                <input
                  ref={inputRef}
                  type="search"
                  role="combobox"
                  aria-expanded={flat.length > 0}
                  aria-controls="search-results"
                  aria-label={labels.title}
                  autoComplete="off"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActive(0);
                  }}
                  onKeyDown={onKeydown}
                  placeholder={labels.placeholder}
                  className="flex-1 bg-transparent py-3.5 text-base outline-none"
                />
              </div>

              <div id="search-results" role="listbox" className="max-h-[60vh] overflow-y-auto p-2">
                {loading && (
                  <p className="text-muted-foreground px-2 py-6 text-center text-sm">
                    {labels.loading}
                  </p>
                )}

                {!loading && query.length === 0 && (
                  <p className="text-muted-foreground px-2 py-6 text-center text-sm">
                    {labels.hint}
                  </p>
                )}

                {!loading && query.length > 0 && flat.length === 0 && (
                  <p className="text-muted-foreground px-2 py-6 text-center text-sm">
                    {labels.empty}
                  </p>
                )}

                {groups.map(({ kind, items }) => (
                  <div key={kind} className="mb-1 last:mb-0">
                    <p className="text-muted-foreground px-2 py-1.5 text-xs font-semibold tracking-wide uppercase">
                      {labels.groups[kind]}
                    </p>
                    {items.map((entry) => {
                      const index = flatIndex.get(entry) ?? -1;
                      const isActive = index === active;
                      return (
                        <a
                          key={`${entry.kind}-${entry.href}-${entry.es}`}
                          ref={isActive ? activeRef : undefined}
                          href={entry.href}
                          role="option"
                          aria-selected={isActive}
                          onClick={close}
                          onMouseEnter={() => setActive(index)}
                          className={cn(
                            'flex items-baseline gap-3 rounded-md px-2 py-2 text-sm',
                            isActive && 'bg-accent text-accent-foreground'
                          )}
                        >
                          {entry.jp && (
                            <span className="jp shrink-0 text-base leading-relaxed" lang="ja">
                              <FuriganaText text={entry.jp} zoom={false} />
                            </span>
                          )}
                          <span className="min-w-0 flex-1 truncate">{entry.es}</span>
                          {entry.lesson != null && (
                            <span className="text-muted-foreground shrink-0 text-xs">
                              {labels.lesson} {entry.lesson}
                            </span>
                          )}
                        </a>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="text-muted-foreground hidden items-center gap-4 border-t px-4 py-2 text-xs sm:flex">
                <span>
                  <kbd className="bg-muted rounded px-1.5 py-0.5 font-sans">↑↓</kbd>{' '}
                  {labels.navigate}
                </span>
                <span>
                  <kbd className="bg-muted rounded px-1.5 py-0.5 font-sans">↵</kbd> {labels.select}
                </span>
                <span>
                  <kbd className="bg-muted rounded px-1.5 py-0.5 font-sans">esc</kbd> {labels.close}
                </span>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
