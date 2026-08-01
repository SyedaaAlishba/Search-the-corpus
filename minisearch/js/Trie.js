/**
 * Trie.js
 * Direct port of Tries.h / Tries.cpp
 *
 * Same 26-child structure (a-z only, non-alpha chars are skipped exactly
 * like the C++ `if (!isalpha(c)) continue;`), same isEnd marker,
 * same recursive DFS to collect suggestions.
 */

class TrieNode {
    constructor() {
        this.children = new Array(26).fill(null);
        this.isEnd = false;
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    // ---------------- INSERT ----------------
    insert(word) {
        let node = this.root;

        for (const ch of word) {
            if (!/[a-zA-Z]/.test(ch)) continue; // mirrors `if (!isalpha(c)) continue;`

            const c = ch.toLowerCase();
            const index = c.charCodeAt(0) - 97; // 'a' === 97

            if (!node.children[index]) {
                node.children[index] = new TrieNode();
            }
            node = node.children[index];
        }

        node.isEnd = true;
    }

    // ---------------- DFS HELPER ----------------
    dfs(node, prefix, results) {
        if (!node) return;

        if (node.isEnd) results.push(prefix);

        for (let i = 0; i < 26; i++) {
            if (node.children[i]) {
                const c = String.fromCharCode(97 + i);
                this.dfs(node.children[i], prefix + c, results);
            }
        }
    }

    // ---------------- SUGGESTIONS ----------------
    getSuggestions(prefix) {
        let node = this.root;

        for (const ch of prefix) {
            if (!/[a-zA-Z]/.test(ch)) return [];

            const c = ch.toLowerCase();
            const index = c.charCodeAt(0) - 97;

            if (!node.children[index]) return [];
            node = node.children[index];
        }

        const results = [];
        this.dfs(node, prefix.toLowerCase(), results);
        return results;
    }

    /**
     * Extra (non-C++) helper for the "Index Trace" UI panel: returns the
     * exact node-by-node path walked for a prefix, so the trie traversal
     * can be visualized letter by letter without touching core logic.
     */
    tracePath(prefix) {
        let node = this.root;
        const path = [];

        for (const ch of prefix) {
            if (!/[a-zA-Z]/.test(ch)) return { path, complete: false };
            const c = ch.toLowerCase();
            const index = c.charCodeAt(0) - 97;
            if (!node.children[index]) {
                path.push({ char: c, exists: false });
                return { path, complete: false };
            }
            node = node.children[index];
            path.push({ char: c, exists: true });
        }
        return { path, complete: true };
    }
}

export default Trie;
