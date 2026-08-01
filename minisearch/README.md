# 🔍 Mini Search Engine

A **Data Structures & Algorithms** project that implements a document search engine completely from scratch using **C++**. The project demonstrates how modern search engines work internally by implementing custom data structures and search algorithms without relying on external search libraries.

> **Algorithms & Data Structures Used:** Custom Hash Table • Inverted Index • Polynomial Rolling Hash • Separate Chaining • Trie • DFS • Frequency-Based Ranking

---

## 📖 Overview

This Mini Search Engine indexes a collection of text documents and allows users to perform fast and efficient searches.

Instead of scanning every document for every search query, the engine first builds an **Inverted Index** using a custom **Hash Table**. This significantly reduces search time and demonstrates the practical use of Data Structures in Information Retrieval.

The project also includes a **Trie** for real-time autocomplete suggestions and supports multiple search modes similar to modern search engines.

---

## ✨ Features

- 📄 Load multiple text documents automatically
- 🔍 Single keyword search
- 🔗 AND Search
- 🔀 OR Search
- 💬 Phrase Search
- ⚡ Fast lookup using an Inverted Index
- 🌲 Trie-based Autocomplete
- 🔎 DFS Traversal for Suggestions
- 📊 Frequency-Based Ranking
- 🖥️ GUI built using Qt

---

## 🛠️ Data Structures Used

### 1. Custom Hash Table
Stores the inverted index mapping each word to the documents in which it appears.

**Purpose**
- Fast word lookup
- Document retrieval
- Frequency counting

---

### 2. Trie

Stores all unique words character by character.

**Purpose**
- Live autocomplete
- Prefix searching
- Fast word suggestions

---

### 3. Vector

Used to store:

- Documents
- Search results
- Word lists
- Document frequencies

---

### 4. Linked List (Separate Chaining)

Used inside the Hash Table to resolve collisions.

---

## 🧠 Algorithms Used

### Polynomial Rolling Hash

Converts every word into a bucket index.

```cpp
hash = (hash * 31 + c) % SIZE;
```

---

### Separate Chaining

Handles hash collisions by storing multiple words in the same bucket using linked lists.

---

### Tokenization

Converts raw document text into searchable words.

Steps:

- Convert to lowercase
- Remove punctuation
- Split into individual words

---

### Depth First Search (DFS)

Used inside the Trie to generate autocomplete suggestions.

---

### Frequency-Based Ranking

Search results are ranked according to how frequently the query words appear inside each document.

Higher frequency = Higher score.

---

## 🔍 Search Types

### Single Word Search

Example

```
algorithm
```

Returns every document containing the word.

---

### AND Search

Example

```
data structures
```

Returns only documents containing **both** words.

---

### OR Search

Example

```
java OR python
```

Returns documents containing either word.

---

### Phrase Search

Example

```
"machine learning"
```

Returns documents containing the exact phrase.

---

## 📁 Project Structure

```
MiniSearchEngine/
│
├── data/
│   ├── doc1.txt
│   ├── doc2.txt
│   └── ...
│
├── DocumentLoader
├── FileCrawler
├── SearchEngine
├── HashTable
├── Trie
├── MainWindow
└── main.cpp
```

---

## 🔄 Project Workflow

```
Documents
      │
      ▼
Document Loader
      │
      ▼
Tokenizer
      │
      ▼
Hash Table (Inverted Index)
      │
      ├─────────────► Trie
      │                 │
      │                 ▼
      │            Autocomplete
      ▼
Search Query
      │
      ▼
AND / OR / Phrase Search
      │
      ▼
Frequency Ranking
      │
      ▼
Search Results
```

---

## ⚙️ How It Works

### Step 1

The File Crawler finds all text documents inside the data folder.

↓

### Step 2

The Document Loader reads every document.

↓

### Step 3

The Tokenizer cleans the text by:

- Removing punctuation
- Converting to lowercase
- Splitting into words

↓

### Step 4

Each word is inserted into the Hash Table to build an Inverted Index.

↓

### Step 5

Unique words are inserted into the Trie for autocomplete.

↓

### Step 6

When a user searches:

- AND Search
- OR Search
- Phrase Search

the engine retrieves matching documents.

↓

### Step 7

Results are ranked according to word frequency.

↓

### Step 8

The ranked results are displayed to the user.

---

## 🚀 Technologies Used

- C++
- Qt Framework
- STL
- Object-Oriented Programming
- Data Structures & Algorithms

---

## 📚 Concepts Demonstrated

- Object-Oriented Programming
- File Handling
- String Processing
- Custom Hash Table
- Hashing
- Collision Resolution
- Inverted Index
- Trie
- Depth First Search (DFS)
- Searching Algorithms
- Ranking Algorithms

---

## 🎯 Learning Outcomes

This project demonstrates how search engines organize and retrieve information efficiently using fundamental Data Structures and Algorithms.

Instead of relying on external libraries, every core component—including indexing, searching, autocomplete, and ranking—was implemented from scratch to strengthen understanding of real-world DSA applications.

---

## 👩‍💻 Author

**Alishba**

BS Computer Science  
University of Karachi
