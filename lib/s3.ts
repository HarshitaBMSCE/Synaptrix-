import { PutObjectCommand, S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

function s3Configured() {
  return Boolean(process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
}

export function isS3Configured() {
  return s3Configured();
}

function client() {
  return new S3Client({ region: process.env.AWS_REGION ?? "ap-south-1" });
}

function extensionForMime(mimeType: string) {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/heic") return "heic";
  return "png";
}

export async function createPresignedUpload(args: { clerkUserId: string; fileName: string; mimeType: string; size: number; category?: string }) {
  const category = args.category === "screenshot" ? "screenshots" : args.category ?? "other";
  const objectKey = `users/${args.clerkUserId}/${category}/${randomUUID()}.${extensionForMime(args.mimeType)}`;

  if (!s3Configured()) {
    throw new Error("AWS S3 credentials are required for evidence uploads.");
  }

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: objectKey,
    ContentType: args.mimeType,
    ContentLength: args.size
  });

  return {
    objectKey,
    uploadUrl: await getSignedUrl(client(), command, { expiresIn: 300 }),
    headers: { "content-type": args.mimeType }
  };
}

export async function createPresignedDownload(objectKey: string) {
  if (!s3Configured()) {
    throw new Error("AWS S3 credentials are required for evidence downloads.");
  }
  const command = new GetObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: objectKey });
  return getSignedUrl(client(), command, { expiresIn: 180 });
}

export async function getPrivateObjectBytes(objectKey: string) {
  if (!s3Configured()) {
    throw new Error("AWS S3 credentials are required to read private evidence.");
  }
  const response = await client().send(new GetObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: objectKey }));
  const chunks: Uint8Array[] = [];
  if (!response.Body) throw new Error("S3 object body was empty.");
  for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
