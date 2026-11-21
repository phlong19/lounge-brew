import {test} from 'node:test';
import assert from 'node:assert/strict';
import {blogSlugFromTitle} from '../../src/lib/admin/blog-slug.ts';
test('article slugs transliterate Vietnamese, collapse punctuation and cap URL length',()=>{
 assert.equal(blogSlugFromTitle('Đêm nhạc ở Trixie – Nguyên Hà!'),'dem-nhac-o-trixie-nguyen-ha');
 assert.equal(blogSlugFromTitle('  Cà phê & Âm nhạc 2026  '),'ca-phe-am-nhac-2026');
 assert.equal(blogSlugFromTitle(''), '');assert.equal(blogSlugFromTitle('🎵'),'');
 const long=blogSlugFromTitle('Đêm nhạc '.repeat(100));assert(long.length<=200);assert(!long.endsWith('-'));
});
