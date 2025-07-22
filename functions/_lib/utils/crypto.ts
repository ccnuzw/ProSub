// _lib/utils/crypto.ts

// Helper function to convert ArrayBuffer to hex string
export function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.prototype.map.call(new Uint8Array(buffer), (x: number) => ('00' + x.toString(16)).slice(-2)).join('');
}

// Password hashing using Web Crypto API (SHA-256)
export async function hashPassword(password: string): Promise<string> {
  const saltBuffer = crypto.getRandomValues(new Uint8Array(16));
  const salt = arrayBufferToHex(saltBuffer.buffer);
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', passwordBuffer);
  const hashHex = arrayBufferToHex(hashBuffer);
  return `${salt}:${hashHex}`;
}

// Password comparison
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    const [salt, key] = hash.split(':');
    if (!salt || !key) return false;
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password + salt);
    const derivedKeyBuffer = await crypto.subtle.digest('SHA-256', passwordBuffer);
    const derivedKeyHex = arrayBufferToHex(derivedKeyBuffer);
    return derivedKeyHex === key;
  } catch (e) {
    console.error("Password comparison failed", e);
    return false;
  }
}
