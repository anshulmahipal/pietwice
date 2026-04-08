/**
 * Unit: backupLogic — detect valid SQLite 3 database payloads.
 */
import {
  base64ToUint8Array,
  looksLikeSqliteDatabase,
  uint8ArrayToBase64,
} from './backupLogic';

describe('backupLogic', () => {
  describe('looksLikeSqliteDatabase', () => {
    it('returns false for empty payload', () => {
      expect(looksLikeSqliteDatabase(new Uint8Array(0))).toBe(false);
    });

    it('returns false when header is too short', () => {
      expect(looksLikeSqliteDatabase(new Uint8Array([1, 2, 3]))).toBe(false);
    });

    it('returns true for standard SQLite format 3 header', () => {
      const header = new TextEncoder().encode('SQLite format 3\0');
      const bytes = new Uint8Array(512);
      bytes.set(header, 0);
      expect(looksLikeSqliteDatabase(bytes)).toBe(true);
    });

    it('returns false for non-SQLite binary', () => {
      const bytes = new Uint8Array(32);
      bytes.fill(0xff);
      expect(looksLikeSqliteDatabase(bytes)).toBe(false);
    });
  });

  describe('uint8ArrayToBase64 / base64ToUint8Array', () => {
    it('round-trips small payload', () => {
      const original = new Uint8Array([0, 127, 255, 10, 20]);
      expect(base64ToUint8Array(uint8ArrayToBase64(original))).toEqual(original);
    });

    it('round-trips payload larger than one String.fromCharCode chunk', () => {
      const original = new Uint8Array(0x9000);
      for (let i = 0; i < original.length; i += 1) {
        original[i] = i % 256;
      }
      expect(base64ToUint8Array(uint8ArrayToBase64(original))).toEqual(original);
    });
  });
});
