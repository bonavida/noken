import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Download, Upload } from 'lucide-react';
import { Button } from '@/ui/react/button';
import { createBackup, parseBackup, restoreBackup } from '@/utils/backup';

interface BackupControlsProps {
  labels: {
    data: string;
    dataDescription: string;
    exportData: string;
    importData: string;
    importConfirm: string;
    importError: string;
  };
}

const DOWNLOAD_URL_LIFETIME_MS = 60_000;

const downloadFile = (file: File) => {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.click();
  // Safari can lose the download if the URL is revoked right after the click
  setTimeout(() => URL.revokeObjectURL(url), DOWNLOAD_URL_LIFETIME_MS);
};

// iOS web apps handle the share sheet (with "Save to Files") more reliably than
// downloads. Everywhere else, or if sharing fails, it falls back to a download.
const saveFile = async (file: File) => {
  if (!navigator.canShare?.({ files: [file] })) return downloadFile(file);
  try {
    await navigator.share({ files: [file] });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return;
    downloadFile(file);
  }
};

export const BackupControls = ({ labels }: BackupControlsProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [failed, setFailed] = useState(false);

  const handleExport = () => {
    const backup = createBackup();
    const name = `noken-backup-${backup.exportedAt.slice(0, 10)}.json`;
    void saveFile(new File([JSON.stringify(backup)], name, { type: 'application/json' }));
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    // Cleared so picking the same file twice still fires a change event
    input.value = '';
    if (!file) return;

    setFailed(false);
    try {
      const backup = parseBackup(await file.text());
      if (!backup) return setFailed(true);
      if (!window.confirm(labels.importConfirm)) return;
      restoreBackup(backup);
      // Every island read its state on mount; a reload is what refreshes them all
      window.location.reload();
    } catch {
      setFailed(true);
    }
  };

  return (
    <div className="border-border border-t pt-4">
      <p className="text-sm font-medium">{labels.data}</p>
      <p className="text-muted-foreground mt-0.5 text-xs">{labels.dataDescription}</p>
      <div className="mt-3 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={handleExport}>
          <Download className="size-4" />
          {labels.exportData}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-4" />
          {labels.importData}
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        aria-label={labels.importData}
        onChange={(event) => void handleImport(event)}
      />
      {failed && (
        <p role="alert" className="text-destructive mt-2 text-xs">
          {labels.importError}
        </p>
      )}
    </div>
  );
};
