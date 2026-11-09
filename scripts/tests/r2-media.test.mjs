import {test} from "node:test";
import assert from "node:assert/strict";
import {remoteImagePatterns,isTrustedMediaSource} from "../../src/lib/config/image-patterns.ts";
test("R2 media allows only the configured HTTPS origin and path",()=>{
 const previous=process.env.NEXT_PUBLIC_R2_MEDIA_URL;
 try {
 process.env.NEXT_PUBLIC_R2_MEDIA_URL="https://images.example.com/public";
 assert(remoteImagePatterns().some(p=>p.hostname==="images.example.com"&&p.pathname==="/public/**"));
 assert(isTrustedMediaSource("https://images.example.com/public/editorial/a.jpg"));
 for(const url of ["https://images.example.com/private/a.jpg","https://images.example.com.evil.test/public/a.jpg","http://images.example.com/public/a.jpg","https://user@images.example.com/public/a.jpg"]) assert.equal(isTrustedMediaSource(url),false);
 process.env.NEXT_PUBLIC_R2_MEDIA_URL="https://*.example.com";
 assert.equal(remoteImagePatterns().some(p=>p.hostname.includes("*")),false);
 } finally {if(previous===undefined)delete process.env.NEXT_PUBLIC_R2_MEDIA_URL;else process.env.NEXT_PUBLIC_R2_MEDIA_URL=previous;}
});
