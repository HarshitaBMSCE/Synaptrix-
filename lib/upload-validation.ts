export const supportedScreenshotMimeTypes = ["image/png", "image/jpeg", "image/webp", "image/heic"] as const;
export const maxScreenshotSizeBytes = 10 * 1024 * 1024;

export function validateScreenshotFile(input: { type: string; size: number }) {
  if (!supportedScreenshotMimeTypes.includes(input.type as (typeof supportedScreenshotMimeTypes)[number])) {
    return { valid: false, message: "Unsupported format. Upload PNG, JPEG, WEBP, or HEIC when your browser supports it." };
  }
  if (input.size > maxScreenshotSizeBytes) {
    return { valid: false, message: "File too large. Maximum screenshot size is 10 MB." };
  }
  return { valid: true, message: "" };
}
