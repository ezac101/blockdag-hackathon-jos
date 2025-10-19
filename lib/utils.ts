import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a secure random passphrase
 */
export function generatePassphrase(wordCount: number = 6): string {
  const words = [
    'shadow', 'cipher', 'vault', 'phantom', 'whisper', 'enigma',
    'stealth', 'cloak', 'ghost', 'raven', 'storm', 'thunder',
    'falcon', 'lightning', 'wolf', 'dragon', 'phoenix', 'titan',
    'nova', 'comet', 'pulse', 'nexus', 'prism', 'vector',
    'quantum', 'alpha', 'omega', 'delta', 'sigma', 'zeta',
    'crystal', 'blade', 'hawk', 'viper', 'cobra', 'jaguar',
    'panther', 'lynx', 'swift', 'surge', 'blaze', 'frost'
  ];
  
  const numbers = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const selectedWords = [];
  
  for (let i = 0; i < wordCount; i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    selectedWords.push(words[randomIndex]);
  }
  
  return `${selectedWords.join('-')}-${numbers}`;
}

/**
 * Calculate passphrase strength (0-100)
 */
export function calculatePassphraseStrength(passphrase: string): number {
  if (!passphrase) return 0;
  
  let strength = 0;
  
  // Length bonus
  strength += Math.min(passphrase.length * 2, 40);
  
  // Character variety
  if (/[a-z]/.test(passphrase)) strength += 10;
  if (/[A-Z]/.test(passphrase)) strength += 10;
  if (/[0-9]/.test(passphrase)) strength += 10;
  if (/[^a-zA-Z0-9]/.test(passphrase)) strength += 10;
  
  // Multiple word/segment bonus
  const segments = passphrase.split(/[-_\s]/);
  if (segments.length >= 4) strength += 20;
  
  return Math.min(strength, 100);
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str: string, length: number = 20): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Generate mock transaction hash
 */
export function generateMockTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Validate passphrase format
 */
export function isValidPassphrase(passphrase: string): boolean {
  return passphrase.length >= 8;
}

/**
 * Generate a random delay for animations
 */
export function getRandomDelay(min: number = 0, max: number = 0.5): number {
  return Math.random() * (max - min) + min;
}
