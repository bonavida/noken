import { parseFurigana } from '@/utils/furigana';

interface FuriganaTextProps {
  text: string;
  // Compact contexts (search results) opt out of the hover zoom
  zoom?: boolean;
}

// React counterpart of ui/Furigana.astro for use inside islands
export const FuriganaText = ({ text, zoom = true }: FuriganaTextProps) => (
  <span className="jp" lang="ja">
    {parseFurigana(text).map((segment, index) =>
      segment.ruby ? (
        <span key={`${segment.base}-${index}`} className={zoom ? 'ruby-word' : undefined}>
          <ruby>
            {segment.base}
            <rp>(</rp>
            <rt>{segment.ruby}</rt>
            <rp>)</rp>
          </ruby>
        </span>
      ) : (
        segment.base
      )
    )}
  </span>
);
