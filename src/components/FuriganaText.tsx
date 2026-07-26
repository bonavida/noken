import { parseFurigana } from '@/utils/furigana';

interface FuriganaTextProps {
  text: string;
}

// React counterpart of ui/Furigana.astro for use inside islands
export const FuriganaText = ({ text }: FuriganaTextProps) => (
  <span className="jp" lang="ja">
    {parseFurigana(text).map((segment, index) =>
      segment.ruby ? (
        <span key={`${segment.base}-${index}`} className="ruby-word">
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
