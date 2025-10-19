/**
 * Client-side encryption using libsodium (Post-Quantum Cryptography ready)
 */

import sodium from "libsodium-wrappers";

let sodiumReady = false;

export async function initSodium() {
  if (!sodiumReady) {
    await sodium.ready;
    sodiumReady = true;
  }
}

/**
 * Encrypt file with passphrase using symmetric encryption
 */
export async function encryptFile(
  file: File,
  passphrase: string
): Promise<{ encryptedData: Uint8Array; nonce: Uint8Array; salt: Uint8Array }> {
  await initSodium();

  // Convert file to Uint8Array
  const fileBuffer = await file.arrayBuffer();
  const fileData = new Uint8Array(fileBuffer);

  // Generate salt for key derivation
  const salt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);

  // Derive key from passphrase
  const key = sodium.crypto_pwhash(
    sodium.crypto_secretbox_KEYBYTES,
    passphrase,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_DEFAULT
  );

  // Generate nonce
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);

  // Encrypt the file
  const encryptedData = sodium.crypto_secretbox_easy(fileData, nonce, key);

  return { encryptedData, nonce, salt };
}

/**
 * Decrypt file with passphrase
 */
export async function decryptFile(
  encryptedData: Uint8Array,
  nonce: Uint8Array,
  salt: Uint8Array,
  passphrase: string
): Promise<Uint8Array> {
  await initSodium();

  // Derive key from passphrase using same salt
  const key = sodium.crypto_pwhash(
    sodium.crypto_secretbox_KEYBYTES,
    passphrase,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_DEFAULT
  );

  // Decrypt the file
  const decryptedData = sodium.crypto_secretbox_open_easy(
    encryptedData,
    nonce,
    key
  );

  if (!decryptedData) {
    throw new Error("Decryption failed: Invalid passphrase or corrupted data");
  }

  return decryptedData;
}

/**
 * Generate Zero-Knowledge Proof commitment (simplified mock)
 */
export async function generateZKProof(passphrase: string): Promise<string> {
  await initSodium();

  // In a real implementation, this would generate a proper ZK proof
  // For now, we create a commitment hash
  const hash = sodium.crypto_generichash(32, sodium.from_string(passphrase));
  return sodium.to_hex(hash);
}

/**
 * Verify ZK Proof (simplified mock)
 */
export async function verifyZKProof(
  passphrase: string,
  commitment: string
): Promise<boolean> {
  await initSodium();

  const hash = sodium.crypto_generichash(32, sodium.from_string(passphrase));
  return sodium.to_hex(hash) === commitment;
}

/**
 * Convert Uint8Array to Base64 for storage/transmission
 */
export function arrayToBase64(array: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000; // prevent call stack overflow for large arrays

  for (let offset = 0; offset < array.length; offset += chunkSize) {
    const chunk = array.subarray(offset, offset + chunkSize);
    let chunkString = "";

    for (let i = 0; i < chunk.length; i += 1) {
      chunkString += String.fromCharCode(chunk[i]);
    }

    binary += chunkString;
  }

  return btoa(binary);
}

/**
 * Convert Base64 back to Uint8Array
 */
export function base64ToArray(base64: string): Uint8Array {
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return array;
}

/**
 * Create a downloadable blob from decrypted data
 */
export function createDownloadableFile(
  data: Uint8Array,
  filename: string,
  mimeType: string
): void {
  const buffer = new ArrayBuffer(data.byteLength);
  new Uint8Array(buffer).set(data);
  const blob = new Blob([buffer], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
