// Checks that SUMMARY.md and the pages under v3.0 match:
// every page SUMMARY.md links to exists, and every page under v3.0 is listed.
// SUMMARY.md drives the navigation of the website and GitBook, so a page it does not list
// cannot be reached from the sidebar.
//
// Run it from the repository root: node scripts/check-summary.mjs

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, normalize, sep } from 'node:path';

const toPosix = (path) => path.split(sep).join('/');

const listPages = (dir) => readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);

    if (statSync(path).isDirectory()) {
        return listPages(path);
    }

    return path.endsWith('.md') ? [toPosix(path)] : [];
});

const summary = readFileSync('SUMMARY.md', 'utf8');

const linked = [...summary.matchAll(/\]\(([^)#\s]+[.]md)(#[^)]*)?\)/g)]
    .map((match) => toPosix(normalize(match[1])));

const missing = linked.filter((page) => !existsSync(page));
const unlisted = listPages('v3.0').filter((page) => !linked.includes(page));

for (const page of missing) {
    console.log(`SUMMARY.md links to a page that does not exist: ${page}`);
}

for (const page of unlisted) {
    console.log(`Page is not listed in SUMMARY.md: ${page}`);
}

if (missing.length > 0 || unlisted.length > 0) {
    process.exit(1);
}

console.log(`SUMMARY.md lists all ${linked.length} pages, and every link points to an existing page.`);
