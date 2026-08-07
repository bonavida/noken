import { parseFurigana } from '@/utils/furigana';

interface FuriganaTextProps {
  text: string;
  // Compact contexts (search results) opt out of the hover zoom
  zoom?: boolean;
  // Characters listed here become links to their kanji page. Left undefined
  // wherever the text already sits inside a link, since anchors cannot nest.
  linkKanji?: string[];
  // Prefix that keeps kanji links in the current language ('' or '/en')
  localePrefix?: string;
}

// Ruby bases may hold elements, so a word keeps one reading over several links:
// <ruby><a>会</a><a>社</a><rt>かいしゃ</rt></ruby>
const withLinks = (text: string, linkable: Set<string>, prefix: string) =>
  [...text].map((character, index) =>
    linkable.has(character) ? (
      <a
        key={`${character}-${index}`}
        href={`${prefix}/kanji/${encodeURIComponent(character)}`}
        className="hover:text-primary hover:underline hover:underline-offset-4"
      >
        {character}
      </a>
    ) : (
      character
    )
  );

// React counterpart of ui/Furigana.astro for use inside islands
export const FuriganaText = ({
  text,
  zoom = true,
  linkKanji,
  localePrefix = '',
}: FuriganaTextProps) => {
  const linkable = new Set(linkKanji ?? []);
  const render = (base: string) =>
    linkable.size > 0 ? withLinks(base, linkable, localePrefix) : base;

  return (
    <span className="jp" lang="ja">
      {parseFurigana(text).map((segment, index) =>
        segment.ruby ? (
          <span key={`${segment.base}-${index}`} className={zoom ? 'ruby-word' : undefined}>
            <ruby>
              {render(segment.base)}
              <rp>(</rp>
              <rt>{segment.ruby}</rt>
              <rp>)</rp>
            </ruby>
          </span>
        ) : (
          render(segment.base)
        )
      )}
    </span>
  );
};
