// File: src/components/helpers.ts
import { Signer } from "../../types";

export const MAX_FILE_MB = 10;
export const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];

export function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    alert("Link disalin ✨");
  } catch {
    window.prompt("Salin link ini:", text);
  }
}

/**
 * Normalisasi data signer supaya selalu ada foto_url
 */
export function mapSigner(s: any, uploadsBase: string): Signer {
  return {
    ...s,
    foto_url: s.photo ? `${uploadsBase}/${s.photo}` : undefined,
  };
}
