/**
 * FileCrawler.js
 * Browser equivalent of FileCrawler.h / FileCrawler.cpp
 *
 * IMPORTANT ADAPTATION (the one unavoidable difference from the C++ version):
 * The original used `fs::directory_iterator(folderPath)` to walk the OS
 * filesystem at runtime. A static site served over HTTP has no filesystem
 * access and cannot list an arbitrary folder for security reasons — there is
 * no browser API for "give me every file in this directory."
 *
 * The role is preserved exactly (discover which document files exist before
 * loading them); only the discovery mechanism changes, from an OS directory
 * scan to reading a small `manifest.json` that lists the files, which plays
 * the same part `directory_iterator` played.
 */

class FileCrawler {
    /**
     * @param {string} folderPath - e.g. "./data"
     * @returns {Promise<string[]>} list of file paths, mirroring the C++
     *   `vector<string> files` return value.
     */
    async getFiles(folderPath) {
        const manifestPath = `${folderPath}/manifest.json`;

        try {
            const response = await fetch(manifestPath);

            if (!response.ok) {
                console.log(`Folder not found: ${folderPath}`);
                return [];
            }

            const manifest = await response.json();
            // manifest.json is a simple array of filenames, e.g. ["doc1.txt", "doc2.txt"]
            return manifest.map(filename => `${folderPath}/${filename}`);
        } catch (err) {
            console.log(`Folder not found: ${folderPath}`);
            return [];
        }
    }
}

export default FileCrawler;
