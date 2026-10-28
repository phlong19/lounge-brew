import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { remoteImagePatterns } from "../../src/lib/config/image-patterns.ts";

const require = createRequire(import.meta.url);
const { hasRemoteMatch } = require("next/dist/shared/lib/match-remote-pattern");
const { getImgProps } = require("next/dist/shared/lib/get-img-props");
const { imageConfigDefault } = require("next/dist/shared/lib/image-config");
const { default: defaultLoader } = require("next/dist/shared/lib/image-loader");
const allowed = (patterns, source) =>
  hasRemoteMatch([], patterns, new URL(source));

test("Trixie remote images are confined to HTTPS media at the exact venue host", () => {
  const patterns = remoteImagePatterns();
  assert.equal(
    allowed(patterns, "https://trixie.com.vn/media/images/show.jpg"),
    true,
  );
  for (const source of [
    "http://trixie.com.vn/media/images/show.jpg",
    "https://www.trixie.com.vn/media/images/show.jpg",
    "https://other.example/media/images/show.jpg",
    "https://trixie.com.vn/other/show.jpg",
    "https://trixie.com.vn:8443/media/images/show.jpg",
  ])
    assert.equal(allowed(patterns, source), false, source);
});

test("configured Supabase origin allows only public storage images including transformations", () => {
  const patterns = remoteImagePatterns("https://venue.supabase.co");
  for (const source of [
    "https://venue.supabase.co/storage/v1/object/public/posters/show.jpg",
    "https://venue.supabase.co/storage/v1/render/image/public/posters/show.jpg?width=800&quality=80",
  ]) {
    assert.equal(allowed(patterns, source), true, source);
    const { props } = getImgProps(
      { src: source, alt: "Trixie show", width: 800, height: 1200 },
      {
        defaultLoader,
        imgConf: { ...imageConfigDefault, remotePatterns: patterns },
      },
    );
    assert.match(props.src, /^\/_next\/image\?url=/);
    assert.equal(
      new URL(props.src, "https://trixie.invalid").searchParams.get("url"),
      source,
    );
  }
  for (const source of [
    "https://unconfigured.supabase.co/storage/v1/object/public/posters/show.jpg",
    "https://venue.supabase.co/storage/v1/object/sign/posters/show.jpg?token=private",
    "https://venue.supabase.co/rest/v1/posters/show.jpg",
    "http://venue.supabase.co/storage/v1/object/public/posters/show.jpg",
    "https://venue.supabase.co:8443/storage/v1/object/public/posters/show.jpg",
  ])
    assert.equal(allowed(patterns, source), false, source);
});

test("invalid or wildcard Supabase settings never broaden image access", () => {
  const base = remoteImagePatterns();
  for (const setting of [
    "",
    "not-a-url",
    "javascript:alert(1)",
    "ftp://venue.supabase.co",
    "https://*.supabase.co",
    "https://user:secret@venue.supabase.co",
  ]) {
    assert.deepEqual(remoteImagePatterns(setting), base, setting);
  }
  const local = remoteImagePatterns("http://127.0.0.1:54321");
  assert.equal(
    allowed(
      local,
      "http://127.0.0.1:54321/storage/v1/object/public/posters/show.jpg",
    ),
    true,
  );
  assert.equal(
    allowed(
      local,
      "http://127.0.0.1:54322/storage/v1/object/public/posters/show.jpg",
    ),
    false,
  );
});

test("trusted media validation accepts owned paths and rejects unconfigured sources", async () => {
  const { isTrustedMediaSource } = await import(
    "../../src/lib/config/image-patterns.ts"
  );
  const origin = "https://venue.supabase.co";
  for (const source of [
    "/trixie/venue-1.jpg",
    "https://trixie.com.vn/media/images/show.jpg",
    "https://venue.supabase.co/storage/v1/object/public/posters/show.jpg",
    "https://venue.supabase.co/storage/v1/render/image/public/posters/show.jpg?width=800",
  ])
    assert.equal(isTrustedMediaSource(source, origin), true, source);
  for (const source of [
    "//trixie.com.vn/media/images/show.jpg",
    "https://other.example/poster.jpg",
    "https://trixie.com.vn/other/poster.jpg",
    "https://user:secret@trixie.com.vn/media/show.jpg",
    "https://venue.supabase.co/storage/v1/object/sign/poster.jpg",
    "https://unconfigured.supabase.co/storage/v1/object/public/poster.jpg",
    "javascript:alert(1)",
    "data:image/png;base64,content",
    "/\\other.example/poster.jpg",
  ])
    assert.equal(isTrustedMediaSource(source, origin), false, source);
});

test("Next config passes the trusted patterns to its image optimizer", async () => {
  const {
    transpileConfig,
  } = require("next/dist/build/next-config-ts/transpile-config");
  const { fileURLToPath } = await import("node:url");
  const { default: config } = await transpileConfig({
    nextConfigPath: fileURLToPath(
      new URL("../../next.config.ts", import.meta.url),
    ),
    dir: fileURLToPath(new URL("../../", import.meta.url)),
  });
  assert.deepEqual(
    config.images.remotePatterns,
    remoteImagePatterns(process.env.NEXT_PUBLIC_SUPABASE_URL),
  );
  const source = "https://trixie.com.vn/media/images/show.jpg";
  const { props } = getImgProps(
    { src: source, alt: "Trixie show", width: 800, height: 1200 },
    { defaultLoader, imgConf: { ...imageConfigDefault, ...config.images } },
  );
  assert.equal(
    new URL(props.src, "https://trixie.invalid").searchParams.get("url"),
    source,
  );
});
