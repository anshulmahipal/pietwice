/** First bytes of a SQLite 3 database file (https://www.sqlite.org/fileformat.html). */
const SQLITE3_HEADER_PREFIX = 'SQLite format 3';

export function looksLikeSqliteDatabase(bytes: Uint8Array): boolean {
  if (bytes.length < 16) {
    return false;
  }
  for (let i = 0; i < SQLITE3_HEADER_PREFIX.length; i += 1) {
    if (bytes[i] !== SQLITE3_HEADER_PREFIX.charCodeAt(i)) {
      return false;
    }
  }
  /** Byte 15 must be nul per SQLite file header. */
  return bytes[15] === 0;
}

/** Encode binary backup for `expo-file-system` Base64 write (works without Node Buffer). */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export function base64ToUint8Array(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}
