// Face data encryption utilities
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'HRMS_FACE_ENCRYPTION_KEY_2024'; // In production, use environment variable

export interface EncryptedFaceData {
  encryptedData: string;
  iv: string;
  timestamp: number;
}

export interface FaceData {
  descriptor: number[];
  detection: {
    score: number;
    box: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
  image: string;
}

/**
 * Encrypt face data for secure storage
 */
export function encryptFaceData(faceData: FaceData): EncryptedFaceData {
  try {
    const jsonData = JSON.stringify(faceData);
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(jsonData, ENCRYPTION_KEY, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    return {
      encryptedData: encrypted.toString(),
      iv: iv.toString(),
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Error encrypting face data:', error);
    throw new Error('Failed to encrypt face data');
  }
}

/**
 * Decrypt face data from storage
 */
export function decryptFaceData(encryptedData: EncryptedFaceData): FaceData {
  try {
    const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);
    const decrypted = CryptoJS.AES.decrypt(encryptedData.encryptedData, ENCRYPTION_KEY, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Error decrypting face data:', error);
    throw new Error('Failed to decrypt face data');
  }
}

/**
 * Hash face descriptor for comparison without exposing raw data
 */
export function hashFaceDescriptor(descriptor: number[]): string {
  const descriptorString = descriptor.join(',');
  return CryptoJS.SHA256(descriptorString).toString();
}

/**
 * Validate face data structure
 */
export function validateFaceData(faceData: any): faceData is FaceData {
  return (
    faceData &&
    Array.isArray(faceData.descriptor) &&
    faceData.descriptor.length === 128 &&
    faceData.detection &&
    typeof faceData.detection.score === 'number' &&
    faceData.detection.box &&
    typeof faceData.detection.box.x === 'number' &&
    typeof faceData.detection.box.y === 'number' &&
    typeof faceData.detection.box.width === 'number' &&
    typeof faceData.detection.box.height === 'number' &&
    typeof faceData.image === 'string'
  );
}
