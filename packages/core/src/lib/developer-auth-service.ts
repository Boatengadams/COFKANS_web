/**
 * Developer Console 3-Layer Authentication System
 * Layer 1: Email/Password (Firebase Auth)
 * Layer 2: TOTP (Google Authenticator/Authy)
 * Layer 3: Security PIN
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  addDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { logSecurityEvent, SecurityEventType } from './security-service';
import * as crypto from 'crypto-js';

const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export interface DeveloperAuth {
  uid: string;
  totpSecret?: string;
  totpEnabled: boolean;
  pinHash?: string;
  pinEnabled: boolean;
  setupCompleted: boolean;
  failedAttempts: number;
  lockedUntil?: number;
  lastSuccessfulAuth?: any;
  blockedIPs: string[];
}

export interface AuthAttempt {
  uid: string;
  email: string;
  ipAddress: string;
  success: boolean;
  failureReason?: string;
  timestamp: any;
  userAgent?: string;
}

/**
 * Generate TOTP secret for setup
 */
export function generateTOTPSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

/**
 * Generate QR code data URL for TOTP setup
 */
export function generateQRCodeData(email: string, secret: string): string {
  const issuer = 'Cofkans Electricals';
  const label = `${issuer}:${email}`;
  const otpauth = `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
  return otpauth;
}

/**
 * Verify TOTP code
 */
export function verifyTOTP(secret: string, token: string): boolean {
  if (!secret || !token || token.length !== 6) return false;

  const time = Math.floor(Date.now() / 1000);
  const timeSlice = Math.floor(time / 30);

  // Check current window and ±1 window for clock drift
  for (let i = -1; i <= 1; i++) {
    const calculatedToken = generateTOTPToken(secret, timeSlice + i);
    if (calculatedToken === token) return true;
  }

  return false;
}

/**
 * Generate TOTP token for a given time slice
 */
function generateTOTPToken(secret: string, timeSlice: number): string {
  const key = base32Decode(secret);
  const time = Buffer.alloc(8);
  time.writeBigInt64BE(BigInt(timeSlice), 0);

  const hmac = crypto.HmacSHA1(
    crypto.lib.WordArray.create(time as any),
    crypto.lib.WordArray.create(key as any)
  );
  const hmacBytes = hmacToBytes(hmac);

  const offset = hmacBytes[19] & 0xf;
  const code =
    ((hmacBytes[offset] & 0x7f) << 24) |
    ((hmacBytes[offset + 1] & 0xff) << 16) |
    ((hmacBytes[offset + 2] & 0xff) << 8) |
    (hmacBytes[offset + 3] & 0xff);

  return (code % 1000000).toString().padStart(6, '0');
}

function hmacToBytes(hmac: any): number[] {
  const words = hmac.words;
  const bytes: number[] = [];
  for (let i = 0; i < words.length; i++) {
    bytes.push((words[i] >>> 24) & 0xff);
    bytes.push((words[i] >>> 16) & 0xff);
    bytes.push((words[i] >>> 8) & 0xff);
    bytes.push(words[i] & 0xff);
  }
  return bytes;
}

function base32Decode(encoded: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let index = 0;
  const output = Buffer.alloc(Math.ceil((encoded.length * 5) / 8));

  for (let i = 0; i < encoded.length; i++) {
    const idx = alphabet.indexOf(encoded[i].toUpperCase());
    if (idx === -1) continue;

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 0xff;
      bits -= 8;
    }
  }

  return output.slice(0, index);
}

/**
 * Hash security PIN
 */
export function hashPIN(pin: string): string {
  return crypto.SHA256(pin).toString();
}

/**
 * Verify security PIN
 */
export function verifyPIN(pin: string, hash: string): boolean {
  return hashPIN(pin) === hash;
}

/**
 * Get developer auth settings
 */
export async function getDeveloperAuth(uid: string): Promise<DeveloperAuth | null> {
  try {
    const docRef = doc(db, 'developerAuth', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as DeveloperAuth;
    }
    return null;
  } catch (error) {
    console.error('Error getting developer auth:', error);
    return null;
  }
}

/**
 * Initialize developer auth (first-time setup)
 */
export async function initializeDeveloperAuth(
  uid: string,
  totpSecret: string,
  pinHash: string
): Promise<void> {
  try {
    await setDoc(doc(db, 'developerAuth', uid), {
      uid,
      totpSecret,
      totpEnabled: true,
      pinHash,
      pinEnabled: true,
      setupCompleted: true,
      failedAttempts: 0,
      blockedIPs: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error initializing developer auth:', error);
    throw error;
  }
}

/**
 * Check if account is locked
 */
export async function isAccountLocked(uid: string): Promise<boolean> {
  const auth = await getDeveloperAuth(uid);
  if (!auth) return false;

  if (auth.lockedUntil && auth.lockedUntil > Date.now()) {
    return true;
  }

  // Clear lock if expired
  if (auth.lockedUntil && auth.lockedUntil <= Date.now()) {
    await updateDoc(doc(db, 'developerAuth', uid), {
      failedAttempts: 0,
      lockedUntil: null,
      updatedAt: serverTimestamp(),
    });
    return false;
  }

  return false;
}

/**
 * Check if IP is blocked
 */
export async function isIPBlocked(uid: string, ipAddress: string): Promise<boolean> {
  const auth = await getDeveloperAuth(uid);
  if (!auth) return false;
  return auth.blockedIPs?.includes(ipAddress) || false;
}

/**
 * Record failed authentication attempt
 */
export async function recordFailedAttempt(
  uid: string,
  email: string,
  ipAddress: string,
  reason: string
): Promise<{ locked: boolean; blocked: boolean }> {
  const auth = await getDeveloperAuth(uid);
  if (!auth) return { locked: false, blocked: false };

  const newFailedAttempts = (auth.failedAttempts || 0) + 1;
  const updates: any = {
    failedAttempts: increment(1),
    updatedAt: serverTimestamp(),
  };

  let locked = false;
  let blocked = false;

  // Lock account after MAX_FAILED_ATTEMPTS
  if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
    updates.lockedUntil = Date.now() + LOCKOUT_DURATION;
    updates.blockedIPs = [...(auth.blockedIPs || []), ipAddress];
    locked = true;
    blocked = true;

    // Log security event
    await logSecurityEvent({
      type: SecurityEventType.SUSPICIOUS_ACTIVITY,
      userId: uid,
      email,
      metadata: {
        reason: 'developer_auth_lockout',
        failedAttempts: newFailedAttempts,
        ipAddress,
      },
    });

    // TODO: Send alert email/SMS to developer
    await sendSecurityAlert(email, ipAddress, newFailedAttempts);
  }

  await updateDoc(doc(db, 'developerAuth', uid), updates);

  // Log attempt
  await logAuthAttempt({
    uid,
    email,
    ipAddress,
    success: false,
    failureReason: reason,
    timestamp: serverTimestamp(),
  });

  return { locked, blocked };
}

/**
 * Record successful authentication
 */
export async function recordSuccessfulAuth(uid: string, email: string, ipAddress: string): Promise<void> {
  await updateDoc(doc(db, 'developerAuth', uid), {
    failedAttempts: 0,
    lastSuccessfulAuth: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await logAuthAttempt({
    uid,
    email,
    ipAddress,
    success: true,
    timestamp: serverTimestamp(),
  });
}

/**
 * Log authentication attempt
 */
async function logAuthAttempt(attempt: AuthAttempt): Promise<void> {
  try {
    await addDoc(collection(db, 'developerAuthAttempts'), attempt);
  } catch (error) {
    console.error('Error logging auth attempt:', error);
  }
}

/**
 * Send security alert (email/SMS)
 */
async function sendSecurityAlert(
  email: string,
  ipAddress: string,
  failedAttempts: number
): Promise<void> {
  // TODO: Implement actual email/SMS sending
  // For now, just log to Firestore
  try {
    await addDoc(collection(db, 'securityAlerts'), {
      type: 'developer_lockout',
      email,
      ipAddress,
      failedAttempts,
      timestamp: serverTimestamp(),
      message: `Developer account locked after ${failedAttempts} failed authentication attempts from IP: ${ipAddress}`,
    });

    console.log(`🚨 SECURITY ALERT: Developer account ${email} locked. IP: ${ipAddress}`);
  } catch (error) {
    console.error('Error sending security alert:', error);
  }
}

/**
 * Unblock IP address (admin recovery)
 */
export async function unblockIP(uid: string, ipAddress: string): Promise<void> {
  const auth = await getDeveloperAuth(uid);
  if (!auth) return;

  const newBlockedIPs = (auth.blockedIPs || []).filter(ip => ip !== ipAddress);

  await updateDoc(doc(db, 'developerAuth', uid), {
    blockedIPs: newBlockedIPs,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Unlock account (admin recovery)
 */
export async function unlockAccount(uid: string): Promise<void> {
  await updateDoc(doc(db, 'developerAuth', uid), {
    failedAttempts: 0,
    lockedUntil: null,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Get client IP address (browser-side)
 */
export async function getClientIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch (error) {
    console.error('Error getting client IP:', error);
    return 'unknown';
  }
}
