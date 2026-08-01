# Mini Search Engine — Web Port

A browser port of the C++ Mini Search Engine (Qt) project. Same algorithms,
same behavior — custom hash table with polynomial rolling hash and separate
chaining, trie + DFS autocomplete, AND/OR/phrase search, word-frequency
ranking — implemented in vanilla HTML/CSS/JS with no backend and no
external search library.

## Run it locally

Because the JS uses ES modules (`import`/`export`) and `fetch()` for the
data files, you can't just double-click `index.html` — it needs to be served
over HTTP (browsers block module imports and fetch on the `file://` scheme).

```bash
cd minisearch
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static server works the same way (`npx serve`, VS Code Live Server, etc.).

## Deploy

This is a pure static site — copy the whole `minisearch/` folder as-is to:

- **GitHub Pages** — push to a repo, enable Pages on the branch/folder.
- **Netlify / Vercel** — drag-and-drop the folder, or connect the repo. No
  build step, no framework, no environment variables needed.

## Adding your own documents

Drop `.txt` files into `data/`, then add their filenames to
`data/manifest.json`. That file plays the role the C++ `FileCrawler` played
via `fs::directory_iterator` — since a static site has no filesystem to
scan at runtime, the manifest is how it learns what to load.

## What's intentionally unchanged vs. the C++ version

- `HashTable.js` — identical hash formula (`hash*31+c mod 10`) and separate
  chaining via a linked structure per bucket.
- `Trie.js` — identical 26-child trie and recursive DFS for suggestions.
- `SearchEngine.js` — identical tokenizer, AND/OR/phrase search logic, and
  frequency-based ranking.

## What had to adapt (and why)

- `FileCrawler.js` reads `data/manifest.json` instead of walking the OS
  filesystem — browsers have no API to list an arbitrary folder.
- `DocumentLoader.js` uses `fetch()` instead of `ifstream`.

## Bonus (non-core) additions

- **Index Trace panel** — a toggle that shows, live, which hash bucket a word
  lands in, the chain it walks through, and the trie path DFS would explore.
  Purely a read-only view into the existing data structures — it doesn't
  change how search or ranking work, it just makes the DSA visible.
- **Snippet extraction with highlighting** — the UI spec asked for preview
  snippets with matched content; this is layered on top of ranking, not a
  change to it.
