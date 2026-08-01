/**
 * main.js
 * Browser equivalent of mainwindow.cpp
 *
 * Qt used connect(searchBox, textChanged, ...) and connect(searchButton, clicked, ...).
 * Here we use addEventListener("input", ...) and addEventListener("click", ...)
 * for the same two behaviors: live autocomplete, and ranked search results.
 */

import SearchEngine from "./SearchEngine.js";

const engine = new SearchEngine();

const searchBox = document.getElementById("searchBox");
const searchButton = document.getElementById("searchButton");
const suggestionBox = document.getElementById("suggestionBox");
const resultBox = document.getElementById("resultBox");
const statusText = document.getElementById("statusText");
const traceToggle = document.getElementById("traceToggle");
const tracePanel = document.getElementById("tracePanel");
const traceContent = document.getElementById("traceContent");
const docCount = document.getElementById("docCount");

let traceVisible = false;

// ---------------- INIT ----------------
async function init() {
    statusText.textContent = "Loading documents and building index...";

    await engine.loadDocuments();
    engine.buildIndex();

    const docs = engine.getDocuments();
    docCount.textContent = docs.length;
    statusText.textContent = `Index ready — ${docs.length} documents, try "java OR python", "machine learning", or "hash table"`;

    renderDocumentList(docs);
}

// ---------------- INITIAL DOCUMENT LIST ----------------
function renderDocumentList(docs) {
    resultBox.innerHTML = "";

    if (docs.length === 0) {
        resultBox.innerHTML = `<p class="empty-state">No documents found in ./data</p>`;
        return;
    }

    for (const doc of docs) {
        const cleanName = cleanFilename(doc.filename);
        resultBox.appendChild(buildResultCard(cleanName, null, doc.content));
    }
}

// ---------------- LIVE SUGGESTIONS ----------------
searchBox.addEventListener("input", (e) => {
    const text = e.target.value;
    suggestionBox.innerHTML = "";

    if (text.trim().length === 0) {
        suggestionBox.classList.remove("visible");
        if (traceVisible) renderTrace("");
        return;
    }

    // Only the last word gets autocomplete treatment, like a real search box
    const lastWord = text.split(/\s+/).pop().toLowerCase();
    const suggestions = engine.getSuggestions(lastWord);

    if (suggestions.length > 0) {
        suggestionBox.classList.add("visible");
        for (const s of suggestions.slice(0, 8)) {
            const li = document.createElement("li");
            li.textContent = s;
            li.addEventListener("click", () => {
                const words = text.split(/\s+/);
                words[words.length - 1] = s;
                searchBox.value = words.join(" ") + " ";
                suggestionBox.classList.remove("visible");
                searchBox.focus();
            });
            suggestionBox.appendChild(li);
        }
    } else {
        suggestionBox.classList.remove("visible");
    }

    if (traceVisible) renderTrace(lastWord);
});

document.addEventListener("click", (e) => {
    if (!suggestionBox.contains(e.target) && e.target !== searchBox) {
        suggestionBox.classList.remove("visible");
    }
});

// ---------------- SEARCH ----------------
function runSearch() {
    suggestionBox.classList.remove("visible");
    resultBox.innerHTML = "";

    const query = searchBox.value.trim();

    if (query.length === 0) {
        renderDocumentList(engine.getDocuments());
        return;
    }

    const results = engine.searchWithRanking(query);

    if (results.length === 0) {
        resultBox.innerHTML = `<p class="empty-state">No results found.</p>`;
        statusText.textContent = `0 results for "${query}"`;
        return;
    }

    statusText.textContent = `${results.length} result${results.length === 1 ? "" : "s"} for "${query}"`;

    for (const r of results) {
        const cleanName = cleanFilename(r.filename);
        const doc = engine.getDocuments()[r.docID];
        resultBox.appendChild(buildResultCard(cleanName, r.score, doc.content, query));
    }
}

searchButton.addEventListener("click", runSearch);
searchBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter") runSearch();
});

// ---------------- RESULT CARD ----------------
function buildResultCard(title, score, content, query) {
    const card = document.createElement("article");
    card.className = "result-card";

    const titleEl = document.createElement("h3");
    titleEl.textContent = title;
    card.appendChild(titleEl);

    if (score !== null && score !== undefined) {
        const scoreEl = document.createElement("span");
        scoreEl.className = "score-pill";
        scoreEl.textContent = `Score: ${score}`;
        card.appendChild(scoreEl);
    }

    const snippetEl = document.createElement("p");
    snippetEl.className = "snippet";
    snippetEl.innerHTML = buildSnippet(content, query);
    card.appendChild(snippetEl);

    return card;
}

// Extract a preview snippet around the first matched query word, and
// bold the matches — this is a UI convenience layered on top of the
// unchanged ranking/search logic, not a change to the algorithms themselves.
function buildSnippet(content, query) {
    const SNIPPET_LEN = 160;

    if (!query) {
        return escapeHtml(content.substring(0, SNIPPET_LEN)) + "...";
    }

    const words = query
        .replace(/["]/g, "")
        .split(/\s+/)
        .map(w => w.toLowerCase())
        .filter(w => w.length > 0 && w !== "or");

    const lowerContent = content.toLowerCase();
    let matchIndex = -1;

    for (const w of words) {
        const idx = lowerContent.indexOf(w);
        if (idx !== -1 && (matchIndex === -1 || idx < matchIndex)) {
            matchIndex = idx;
        }
    }

    if (matchIndex === -1) {
        return escapeHtml(content.substring(0, SNIPPET_LEN)) + "...";
    }

    const start = Math.max(0, matchIndex - 60);
    const end = Math.min(content.length, matchIndex + 120);
    let snippet = content.substring(start, end);

    let html = escapeHtml(snippet);
    for (const w of words) {
        const re = new RegExp(`(${escapeRegex(w)})`, "gi");
        html = html.replace(re, "<mark>$1</mark>");
    }

    return (start > 0 ? "..." : "") + html + (end < content.length ? "..." : "");
}

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanFilename(path) {
    return path.split(/[\\/]/).pop();
}

// ---------------- INDEX TRACE PANEL (signature feature) ----------------
// Visualizes the hash bucket + chain the current word walks through,
// and the trie path DFS would explore, without altering the underlying
// HashTable / Trie logic at all — purely a read-only view into it.
traceToggle.addEventListener("click", () => {
    traceVisible = !traceVisible;
    tracePanel.classList.toggle("visible", traceVisible);
    traceToggle.textContent = traceVisible ? "Hide index trace" : "Show index trace";
    if (traceVisible) {
        const lastWord = searchBox.value.split(/\s+/).pop().toLowerCase();
        renderTrace(lastWord);
    }
});

function renderTrace(word) {
    if (!word) {
        traceContent.innerHTML = `<p class="trace-empty">Type a word to see its hash bucket and trie path.</p>`;
        return;
    }

    const hashTrace = engine.index.traceLookup(word);
    const trieTrace = engine.trie.tracePath(word);

    const bucketRow = `Bucket <strong>${hashTrace.bucket}</strong> / ${
        engine.index.constructor.SIZE
    } &nbsp;·&nbsp; hash("${word}") = ((...(0×31+c₀)×31+c₁)...) mod ${engine.index.constructor.SIZE}`;

    const chainRow = hashTrace.chain.length > 0
        ? hashTrace.chain.map(w => (w === word ? `<mark>${w}</mark>` : w)).join(" → ")
        : "(empty bucket)";

    const trieRow = trieTrace.path
        .map(step => `<span class="trie-step ${step.exists ? "ok" : "miss"}">${step.char}</span>`)
        .join("");

    traceContent.innerHTML = `
        <div class="trace-block">
            <span class="trace-label">Hash Table lookup</span>
            <p class="trace-line">${bucketRow}</p>
            <p class="trace-line">Chain walked: ${chainRow}</p>
            <p class="trace-line">${hashTrace.found ? "✔ found in " + hashTrace.steps + " step(s)" : "✘ not indexed"}</p>
        </div>
        <div class="trace-block">
            <span class="trace-label">Trie path (DFS root)</span>
            <p class="trace-line trie-path">${trieRow || "(empty prefix)"}</p>
            <p class="trace-line">${trieTrace.complete ? "✔ path exists — DFS would run from here" : "✘ path breaks — no further nodes"}</p>
        </div>
    `;
}

init();
