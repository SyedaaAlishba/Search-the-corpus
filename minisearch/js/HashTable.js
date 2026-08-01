/**
 * HashTable.js
 * Direct port of HashTable.h / HashTable.cpp
 *
 * Same polynomial rolling hash:  hash = (hash * 31 + charCode) % SIZE
 * Same collision strategy: separate chaining via a linked list per bucket.
 * Each bucket entry ("Node") stores a word plus a list of (docID, frequency) pairs,
 * exactly mirroring the C++ Node { string word; vector<pair<int,int>> docFreq; Node* next; }.
 */

class HashNode {
    constructor(word) {
        this.word = word;
        this.docFreq = []; // array of {docID, freq}
        this.next = null;
    }
}

class HashTable {
    static SIZE = 10; // identical to C++ `static const int SIZE = 10;`

    constructor() {
        this.table = new Array(HashTable.SIZE).fill(null);
    }

    // ---------------- HASH FUNCTION ----------------
    // Same formula as C++: hash = (hash * 31 + c) % SIZE, walking each char
    hashFunction(key) {
        let hash = 0;
        for (let i = 0; i < key.length; i++) {
            const charCode = key.charCodeAt(i);
            hash = (hash * 31 + charCode) % HashTable.SIZE;
        }
        return hash;
    }

    // ---------------- INSERT ----------------
    insert(word, docID) {
        const index = this.hashFunction(word);
        let ptr = this.table[index];

        while (ptr !== null) {
            if (ptr.word === word) {
                // check if doc already exists in this word's postings
                for (const p of ptr.docFreq) {
                    if (p.docID === docID) {
                        p.freq++; // increase frequency
                        return;
                    }
                }
                // new doc for this existing word
                ptr.docFreq.push({ docID, freq: 1 });
                return;
            }
            ptr = ptr.next;
        }

        // new node, inserted at head of the bucket's chain
        const node = new HashNode(word);
        node.docFreq.push({ docID, freq: 1 });
        node.next = this.table[index];
        this.table[index] = node;
    }

    // ---------------- SEARCH ----------------
    // Returns list of docIDs containing `word`
    search(word) {
        const index = this.hashFunction(word);
        let ptr = this.table[index];

        while (ptr !== null) {
            if (ptr.word === word) {
                return ptr.docFreq.map(p => p.docID);
            }
            ptr = ptr.next;
        }
        return [];
    }

    // ---------------- FREQUENCY ----------------
    getFrequency(word, docID) {
        const index = this.hashFunction(word);
        let ptr = this.table[index];

        while (ptr !== null) {
            if (ptr.word === word) {
                for (const p of ptr.docFreq) {
                    if (p.docID === docID) return p.freq;
                }
            }
            ptr = ptr.next;
        }
        return 0;
    }

    // ---------------- DISPLAY (DEBUG) ----------------
    display() {
        let out = "";
        for (let i = 0; i < HashTable.SIZE; i++) {
            out += `Bucket ${i}: `;
            let ptr = this.table[i];
            while (ptr !== null) {
                out += `${ptr.word} -> `;
                ptr = ptr.next;
            }
            out += "NULL\n";
        }
        return out;
    }

    /**
     * Extra (non-C++) helper purely for the "Index Trace" UI panel:
     * exposes the bucket index and the chain a given word walks through,
     * so the algorithm can be visualized without changing any core logic.
     */
    traceLookup(word) {
        const index = this.hashFunction(word);
        const chain = [];
        let ptr = this.table[index];
        let steps = 0;
        while (ptr !== null) {
            steps++;
            chain.push(ptr.word);
            if (ptr.word === word) {
                return { bucket: index, chain, steps, found: true };
            }
            ptr = ptr.next;
        }
        return { bucket: index, chain, steps, found: false };
    }
}

export default HashTable;
