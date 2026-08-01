/**
 * DocumentLoader.js
 * Direct behavioral port of DocumentLoader.h / DocumentLoader.cpp
 *
 * C++ used `ifstream` + `getline` to read a file line by line, joining lines
 * with a space. The browser equivalent is `fetch()` + `.text()`; we then
 * reproduce the same "join lines with a space" normalization so downstream
 * tokenization behaves identically either way.
 */

class DocumentLoader {
    /**
     * @param {string} filename - path to the .txt file (e.g. "./data/doc1.txt")
     * @returns {Promise<string>} file content, or "" on error (same as C++)
     */
    async readFile(filename) {
        try {
            const response = await fetch(filename);

            if (!response.ok) {
                console.log(`Error opening file: ${filename}`);
                return "";
            }

            const raw = await response.text();

            // Mirror the C++ loop: `while (getline(file, line)) content += line + " ";`
            const lines = raw.split(/\r\n|\r|\n/);
            let content = "";
            for (const line of lines) {
                if (line.length === 0 && lines.length === 1) continue;
                content += line + " ";
            }

            return content;
        } catch (err) {
            console.log(`Error opening file: ${filename}`);
            return "";
        }
    }
}

export default DocumentLoader;
