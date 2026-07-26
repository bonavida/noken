import { Monitor, Moon, Settings, Sun } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/ui/react/button';
import { Label } from '@/ui/react/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/react/popover';
import { Switch } from '@/ui/react/switch';
import { ToggleGroup, ToggleGroupItem } from '@/ui/react/toggle-group';
import type { FuriganaSize, Theme } from '@/utils/settings';

interface SettingsMenuProps {
  labels: {
    title: string;
    open: string;
    furigana: string;
    furiganaDescription: string;
    furiganaSize: string;
    furiganaSizeNormal: string;
    furiganaSizeLarge: string;
    theme: string;
    themeLight: string;
    themeDark: string;
    themeSystem: string;
    hideTranslations: string;
    hideTranslationsDescription: string;
  };
}

const THEME_OPTIONS = [
  { value: 'light', labelKey: 'themeLight', Icon: Sun },
  { value: 'dark', labelKey: 'themeDark', Icon: Moon },
  { value: 'system', labelKey: 'themeSystem', Icon: Monitor },
] as const;

export const SettingsMenu = ({ labels }: SettingsMenuProps) => {
  const { settings, updateSettings } = useSettings();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={labels.open}>
          <Settings className="size-5" />
        </Button>
      </PopoverTrigger>
      {/* Capped so it still fits on 320px-wide phones */}
      <PopoverContent align="end" className="w-[min(20rem,calc(100vw-2rem))]">
        <p className="mb-4 text-sm font-semibold">{labels.title}</p>

        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Label htmlFor="settings-furigana">{labels.furigana}</Label>
              <p className="text-muted-foreground mt-0.5 text-xs">{labels.furiganaDescription}</p>
            </div>
            <Switch
              id="settings-furigana"
              checked={settings.furigana}
              onCheckedChange={(checked) => updateSettings({ furigana: checked })}
            />
          </div>

          {settings.furigana && (
            <div className="flex items-center justify-between gap-4">
              <Label>{labels.furiganaSize}</Label>
              <ToggleGroup
                type="single"
                variant="outline"
                size="sm"
                value={settings.furiganaSize}
                onValueChange={(value) =>
                  value && updateSettings({ furiganaSize: value as FuriganaSize })
                }
              >
                <ToggleGroupItem value="normal" aria-label={labels.furiganaSizeNormal}>
                  <span className="jp text-xs" lang="ja">
                    あ
                  </span>
                </ToggleGroupItem>
                <ToggleGroupItem value="large" aria-label={labels.furiganaSizeLarge}>
                  <span className="jp text-base" lang="ja">
                    あ
                  </span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}

          <div className="flex items-start justify-between gap-4">
            <div>
              <Label htmlFor="settings-translations">{labels.hideTranslations}</Label>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {labels.hideTranslationsDescription}
              </p>
            </div>
            <Switch
              id="settings-translations"
              checked={settings.hideTranslations}
              onCheckedChange={(checked) => updateSettings({ hideTranslations: checked })}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label>{labels.theme}</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={settings.theme}
              onValueChange={(value) => value && updateSettings({ theme: value as Theme })}
            >
              {THEME_OPTIONS.map(({ value, labelKey, Icon }) => (
                <ToggleGroupItem key={value} value={value} aria-label={labels[labelKey]}>
                  <Icon className="size-4" />
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
