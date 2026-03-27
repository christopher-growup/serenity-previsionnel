/**
 * Triggers a "Save As" dialog using the File System Access API when available,
 * with a fallback to programmatic download for unsupported browsers.
 */
export async function saveFileWithDialog(
  blob: Blob,
  filename: string,
  description: string,
  accept: Record<string, string[]>,
): Promise<void> {
  // Try the File System Access API (shows native "Save As" dialog)
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as unknown as { showSaveFilePicker: (opts: unknown) => Promise<FileSystemFileHandle> })
        .showSaveFilePicker({
          suggestedName: filename,
          types: [{ description, accept }],
        });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err: unknown) {
      // User cancelled the dialog
      if (err instanceof Error && err.name === 'AbortError') return;
      // Fall through to legacy approach
    }
  }

  // Fallback: programmatic download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Small delay before revoking to let the download start
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
