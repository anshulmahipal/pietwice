import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

function backupFileNameForNow(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `bondwallet-backup-${y}${m}${day}.db`;
}

/**
 * Writes bytes to cache and opens the system share sheet (Save to Files, Drive, etc.).
 */
export async function shareMonthlyExpenseBackupFile(bytes: Uint8Array): Promise<void> {
  const outFile = new File(Paths.cache, backupFileNameForNow());
  outFile.create({ overwrite: true });
  outFile.write(bytes);
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device.');
  }
  await Sharing.shareAsync(outFile.uri);
}

/**
 * Lets the user pick a `.db` or other file; returns `null` if cancelled.
 */
export async function pickMonthlyExpenseBackupFile(): Promise<Uint8Array | null> {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    type: '*/*',
  });
  if (result.canceled || !result.assets?.[0]?.uri) {
    return null;
  }
  const uri = result.assets[0].uri;
  const picked = new File(uri);
  return picked.bytes();
}
