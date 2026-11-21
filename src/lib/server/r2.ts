import "server-only";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export function r2Config() {
  const {
    R2_ACCOUNT_ID: account,
    R2_ACCESS_KEY_ID: accessKeyId,
    R2_SECRET_ACCESS_KEY: secretAccessKey,
    R2_BUCKET_NAME: bucket,
    R2_PUBLIC_BASE_URL: base,
  } = process.env;
  if (!account || !accessKeyId || !secretAccessKey || !bucket || !base)
    throw new Error("R2 configuration missing");
  const url = new URL(base);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw new Error("Invalid R2 public origin");
  return {
    bucket,
    base: url.href.replace(/\/$/, ""),
    client: new S3Client({
      region: "auto",
      endpoint: `https://${account}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
      maxAttempts: 3,
    }),
  };
}

export function r2PublicUrl(path: string) {
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (!base) throw new Error("R2 public origin missing");
  return `${base.replace(/\/$/, "")}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export async function putR2Image(
  path: string,
  bytes: Buffer,
  contentType: string,
) {
  const config = r2Config();
  await config.client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: path,
      Body: bytes,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}
