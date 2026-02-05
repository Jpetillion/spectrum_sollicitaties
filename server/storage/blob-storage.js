import { put, del, head } from '@vercel/blob';
import { existsSync, mkdirSync, writeFileSync, unlinkSync, readFileSync } from 'fs';
import path from 'path';

const USE_VERCEL_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;
// Use /tmp for serverless environments, ./uploads for local development
const UPLOAD_DIR = process.env.UPLOAD_DIR || (process.env.VERCEL ? '/tmp/uploads' : './uploads');

// Ensure local upload directory exists if we're using local storage
function ensureUploadDir() {
  if (!USE_VERCEL_BLOB && !existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Upload a file to either Vercel Blob (production) or local filesystem (development)
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - Original filename
 * @param {string} contentType - MIME type
 * @returns {Promise<{url: string, pathname: string}>}
 */
export async function uploadFile(buffer, filename, contentType) {
  const timestamp = Date.now();
  const randomSuffix = Math.round(Math.random() * 1E9);
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext);
  const uniqueFilename = `${basename}-${timestamp}-${randomSuffix}${ext}`;

  if (USE_VERCEL_BLOB) {
    // Upload to Vercel Blob
    const blob = await put(uniqueFilename, buffer, {
      access: 'public',
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    return {
      url: blob.url,
      pathname: blob.pathname
    };
  } else {
    // Save to local filesystem
    ensureUploadDir(); // Ensure directory exists before writing
    const filePath = path.join(UPLOAD_DIR, uniqueFilename);
    writeFileSync(filePath, buffer);

    return {
      url: `/uploads/${uniqueFilename}`,
      pathname: uniqueFilename
    };
  }
}

/**
 * Delete a file from storage
 * @param {string} pathname - File pathname or filename
 */
export async function deleteFile(pathname) {
  if (USE_VERCEL_BLOB) {
    // Delete from Vercel Blob
    const url = pathname.startsWith('http') ? pathname : `https://vercel.blob.com/${pathname}`;
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
  } else {
    // Delete from local filesystem
    const filename = path.basename(pathname);
    const filePath = path.join(UPLOAD_DIR, filename);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  }
}

/**
 * Check if a file exists
 * @param {string} pathname - File pathname or filename
 * @returns {Promise<boolean>}
 */
export async function fileExists(pathname) {
  if (USE_VERCEL_BLOB) {
    try {
      const url = pathname.startsWith('http') ? pathname : `https://vercel.blob.com/${pathname}`;
      await head(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
      return true;
    } catch (error) {
      return false;
    }
  } else {
    const filename = path.basename(pathname);
    const filePath = path.join(UPLOAD_DIR, filename);
    return existsSync(filePath);
  }
}

/**
 * Get the public URL for a file
 * @param {string} pathname - File pathname or filename
 * @returns {string}
 */
export function getFileUrl(pathname) {
  if (USE_VERCEL_BLOB) {
    // If it's already a full URL, return it
    if (pathname.startsWith('http')) {
      return pathname;
    }
    // Otherwise construct the Vercel Blob URL
    return `https://vercel.blob.com/${pathname}`;
  } else {
    const filename = path.basename(pathname);
    return `/uploads/${filename}`;
  }
}

/**
 * Get storage type being used
 * @returns {string} 'vercel-blob' or 'local'
 */
export function getStorageType() {
  return USE_VERCEL_BLOB ? 'vercel-blob' : 'local';
}
