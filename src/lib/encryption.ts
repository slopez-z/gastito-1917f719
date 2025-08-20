/**
 * Data encryption utilities using Web Crypto API
 * Provides secure encryption/decryption for sensitive localStorage data
 */

// Encryption key management
const ENCRYPTION_KEY_STORAGE = 'app-encryption-key';
const SESSION_TIMEOUT = 30 * 24 * 60 * 60 * 1000; // 30 days

interface EncryptedData {
  data: string;
  iv: string;
  timestamp: number;
}

/**
 * Generate or retrieve encryption key from sessionStorage
 */
async function getOrCreateEncryptionKey(): Promise<CryptoKey> {
  const stored = sessionStorage.getItem(ENCRYPTION_KEY_STORAGE);
  
  if (stored) {
    try {
      const keyData = JSON.parse(stored);
      // Check if session has expired
      if (Date.now() - keyData.timestamp > SESSION_TIMEOUT) {
        sessionStorage.removeItem(ENCRYPTION_KEY_STORAGE);
        return generateNewKey();
      }
      
      const keyBuffer = new Uint8Array(Object.values(keyData.key));
      return await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
      );
    } catch {
      return generateNewKey();
    }
  }
  
  return generateNewKey();
}

async function generateNewKey(): Promise<CryptoKey> {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  // Store key in sessionStorage (expires when browser closes)
  const keyBuffer = await crypto.subtle.exportKey('raw', key);
  const keyData = {
    key: Array.from(new Uint8Array(keyBuffer)),
    timestamp: Date.now()
  };
  
  sessionStorage.setItem(ENCRYPTION_KEY_STORAGE, JSON.stringify(keyData));
  
  return key;
}

/**
 * Encrypt sensitive data
 */
export async function encryptData(data: string): Promise<string> {
  try {
    const key = await getOrCreateEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(data)
    );
    
    const encryptedData: EncryptedData = {
      data: Array.from(new Uint8Array(encrypted)).map(b => b.toString(16).padStart(2, '0')).join(''),
      iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
      timestamp: Date.now()
    };
    
    return JSON.stringify(encryptedData);
  } catch (error) {
    console.error('Encryption failed:', error);
    // Fallback to unencrypted data in case of encryption failure
    return data;
  }
}

/**
 * Decrypt sensitive data
 */
export async function decryptData(encryptedString: string): Promise<string> {
  try {
    // Check if data is actually encrypted
    let encryptedData: EncryptedData;
    try {
      encryptedData = JSON.parse(encryptedString);
      // Validate structure
      if (!encryptedData.data || !encryptedData.iv || !encryptedData.timestamp) {
        throw new Error('Invalid encrypted data structure');
      }
    } catch {
      // Data is not encrypted, return as-is (for backward compatibility)
      return encryptedString;
    }
    
    const key = await getOrCreateEncryptionKey();
    const iv = new Uint8Array(encryptedData.iv.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
    const data = new Uint8Array(encryptedData.data.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    // Try to return unencrypted data for backward compatibility
    try {
      JSON.parse(encryptedString);
      return encryptedString;
    } catch {
      return '{}';
    }
  }
}

/**
 * Clear encryption session (force re-encryption on next use)
 */
export function clearEncryptionSession(): void {
  sessionStorage.removeItem(ENCRYPTION_KEY_STORAGE);
}

/**
 * Check if session has expired
 */
export function isSessionExpired(): boolean {
  const stored = sessionStorage.getItem(ENCRYPTION_KEY_STORAGE);
  if (!stored) return true;
  
  try {
    const keyData = JSON.parse(stored);
    return Date.now() - keyData.timestamp > SESSION_TIMEOUT;
  } catch {
    return true;
  }
}