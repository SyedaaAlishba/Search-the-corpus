/**
 * SearchEngine.js
 * Direct port of SearchEngine.h / SearchEngine.cpp
 *
 * Every method below mirrors its C++ counterpart's control flow:
 *  - tokenize(): lowercase, split on whitespace, strip punctuation
 *  - buildIndex(): feed every token into the HashTable + Trie
 *  - search(): phrase search ("...") / OR search (contains " or ") / AND search (default)
 *  - rankResults(): score = sum of word frequency across query terms, sorted desc
 *  - getSuggestions(): delegate to Trie
 *
 * The C++ code used two module-level globals (`Trie trie;` and
 * `unordered_set<string> uniqueWords;`) shared across the whole program.
 * We keep that same shape as instance fields owned by one SearchEngine,
 * since a static site only ever needs a single engine instance.
 */

import HashTable from "./HashTable.js";
import Trie from "./Trie.js";
import FileCrawler from "./FileCrawler.js";
import DocumentLoader from "./DocumentLoader.js";

const PUNCTUATION_RE = /[!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~]/g;

class SearchEngine {
    constructor() {
        this.documents = [];       // vector<Document>
        this.index = new HashTable(); // HashTable index
        this.trie = new Trie();       // global Trie trie;
        this.uniqueWords = new Set(); // unordered_set<string> uniqueWords;
    }

    // ---------------- LOAD DOCUMENTS ----------------
    async loadDocuments() {
        const loader = new DocumentLoader();
        const crawler = new FileCrawler();

        const files = await crawler.getFiles("./data");

        let docID = 0;
        for (const file of files) {
            const content = await loader.readFile(file);

            if (content.length > 0) {
                this.documents.push({
                    id: docID,
                    filename: file,
                    content: content,
                });
                docID++;
            }
        }
    }

    // ---------------- TOKENIZER ----------------
    tokenize(text) {
        const words = [];
        const lowered = text.toLowerCase();
        const rawWords = lowered.split(/\s+/);

        for (let word of rawWords) {
            word = word.replace(PUNCTUATION_RE, "");
            if (word.length > 0) words.push(word);
        }

        return words;
    }

    // ---------------- BUILD INDEX ----------------
    buildIndex() {
        for (let docId = 0; docId < this.documents.length; docId++) {
            const words = this.tokenize(this.documents[docId].content);

            for (const word of words) {
                this.index.insert(word, docId);

                if (!this.uniqueWords.has(word)) {
                    this.trie.insert(word);
                    this.uniqueWords.add(word);
                }
            }
        }
    }

    // ---------------- SEARCH MAIN ----------------
    search(query) {
        if (!query || query.length === 0) return [];

        // ---------------- PHRASE SEARCH ----------------
        if (query.length >= 2 && query[0] === '"' && query[query.length - 1] === '"') {
            const phrase = query.substring(1, query.length - 1);
            return this.phraseSearch(phrase);
        }

        const lowerQuery = query.toLowerCase();

        // ---------------- OR SEARCH ----------------
        if (lowerQuery.includes(" or ")) {
            const queryWords = lowerQuery
                .split(/\s+/)
                .map(w => w.replace(PUNCTUATION_RE, ""))
                .filter(w => w.length > 0 && w !== "or");

            return this.orSearch(queryWords);
        }

        // ---------------- AND SEARCH ----------------
        const queryWords = query
            .split(/\s+/)
            .map(w => w.replace(PUNCTUATION_RE, "").toLowerCase())
            .filter(w => w.length > 0 && w !== "or");

        if (queryWords.length === 0) return [];

        let result = this.index.search(queryWords[0]);

        for (let i = 1; i < queryWords.length; i++) {
            const current = this.index.search(queryWords[i]);
            result = result.filter(id => current.includes(id));
        }

        return result;
    }

    // ---------------- PHRASE SEARCH ----------------
    phraseSearch(phrase) {
        const result = [];

        const cleanPhrase = phrase.toLowerCase().replace(PUNCTUATION_RE, "");

        for (let i = 0; i < this.documents.length; i++) {
            let doc = this.documents[i].content.toLowerCase().replace(PUNCTUATION_RE, "");

            if (this.containsPhrase(doc, cleanPhrase)) {
                result.push(i);
            }
        }

        return result;
    }

    // ---------------- HELPER ----------------
    containsPhrase(text, phrase) {
        return text.includes(phrase);
    }

    // ---------------- OR SEARCH ----------------
    orSearch(queryWords) {
        const result = [];

        for (const w of queryWords) {
            const docs = this.index.search(w);
            for (const id of docs) {
                if (!result.includes(id)) result.push(id);
            }
        }

        return result;
    }

    // ---------------- RANK RESULTS ----------------
    rankResults(docs, query) {
        const queryWords = query
            .split(/\s+/)
            .map(w => w.replace(PUNCTUATION_RE, "").toLowerCase())
            .filter(w => w.length > 0 && w !== "or");

        const ranked = docs.map(id => {
            let score = 0;
            for (const w of queryWords) {
                score += this.index.getFrequency(w, id);
            }
            return {
                docID: id,
                filename: this.documents[id].filename,
                score: score,
            };
        });

        ranked.sort((a, b) => b.score - a.score);
        return ranked;
    }

    // ---------------- SEARCH WITH RANKING ----------------
    searchWithRanking(query) {
        const docs = this.search(query);
        return this.rankResults(docs, query);
    }

    // ---------------- AUTOCOMPLETE ----------------
    getSuggestions(prefix) {
        if (!prefix || prefix.length === 0) return [];
        return this.trie.getSuggestions(prefix.toLowerCase());
    }

    getDocuments() {
        return this.documents;
    }
}

export default SearchEngine;
