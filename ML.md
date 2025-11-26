Here is the text converted into a professional, structured `README.md` format.

***

# Tarumbeta Recommendation Engine

## Overview
The Tarumbeta Recommendation Engine is a specialized machine learning system designed to match music learners with suitable instructors within the Kenyan context. It employs a hybrid content-based filtering approach, leveraging semantic understanding and strict logistical constraints to ensure high-quality, actionable matches.

## 🧠 System Architecture

### Instructor Recommendation Module
This core module calculates the semantic and logistical distance between learner preferences and instructor profiles to generate ranked recommendations.

* **Model Architecture:** Hybrid Content-Based Filtering Engine.
* **Retrieval Engine:** **FAISS** (Facebook AI Similarity Search) for high-speed, scalable vector retrieval.
* **Semantic Engine:** **SBERT** (Sentence-BERT) for natural language understanding of bio keywords.

### Feature Engineering
The model processes user profiles using a three-tier feature structure:

1.  **Hard Constraints (Categorical):**
    * Location (e.g., "Westlands, Nairobi")
    * Instrument Type
    * Teaching Language
    * Skill Level
2.  **Qualifiers (Numerical):**
    * Hourly Rate
    * Instructor Rating (Normalized)
3.  **Semantic Context (Text):**
    * Bio Keywords derived from course titles and learner goals.

### ⚡ Vectorization Strategy: Weighted Concatenation
To solve the problem of "Semantic Drift" (where distinct locations might match due to similar text descriptions), the system uses a **Brute Force Weighted Architecture**:

| Feature Group | Weight | Purpose |
| :--- | :--- | :--- |
| **Categorical** | **80%** | Enforces strict geographic and instrument matching. |
| **Numerical** | **10%** | Acts as a tie-breaker based on quality and price. |
| **Semantic** | **10%** | Captures nuance (e.g., "Rockstar" → "Guitar") without breaking hard constraints. |

---

## 📊 Performance & Evaluation

The model was stress-tested to measure its ability to respect hard constraints while providing relevant semantic matches.

* **Top-1 Accuracy: 77.00%**
    * *Definition:* The probability that the very first recommendation is a perfect match (Right City + Right Instrument).
    * *Note:* This represents the **"Data Ceiling"** of available supply; the remaining error margin accounts for queries where no instructor physically exists in the requested location.
* **Precision@5: ~65%**
    * *Definition:* The average percentage of the top 5 results that perfectly satisfy all hard constraints.

**Key Impact:**
* Eliminates **Semantic Drift**.
* Ensures **Zero-Latency Inference** via pre-computed indices.
* Enables **Concept Matching** (linking abstract queries to concrete instruments).

---

## 📂 Datasets

The model was trained on a synthesized "Supply & Demand" ecosystem designed to mirror the Kenyan market.

### 1. Supply Side (Instructors)
* **Source:** [Udemy Courses Dataset (Kaggle/Andrewmvd)](https://www.kaggle.com/datasets/andrewmvd/udemy-courses) filtered for Musical Instruments.
* **Size:** ~680 Real Music Course Profiles.
* **Context Injection:** Global profiles were adapted to the Tarumbeta context by injecting **Open Schools Kenya** geolocation data, mapping instructors to specific Kenyan wards (e.g., Kibera, Westlands, Eldoret).

**Features Mapped:**
* `Course Title` → **Bio Keywords** (Contains semantics like "Strumming", "Theory").
* `Price` → **Hourly Rate**.
* `Num_Reviews` → Log-normalized to **Rating (0-5)**.
* `Level` → **Skill Level** (Beginner, Intermediate, Advanced).

> **Why this was used:** Real-world course titles provide rich natural language semantics critical for SBERT training, solving the "Cold Start" content problem better than purely synthetic text.

### 2. Demand Side (Learners)
* **Source:** Synthetic Demand Dataset modeled on *High School Students Music Genre Preferences* and *Online Music Education* statistics.
* **Size:** 5,000 Learner Records.

**Dataset Details:**
* **Generation:** Probabilistic sampling using `numpy.random`.
* **Location Distribution:** Weighted to favor major urban centers (Nairobi 50%, Mombasa 15%) to mirror tech adoption patterns.
* **Instrument Distribution:** Aligned with global trends (Guitar/Piano ~30%, Cello/Flute ~5%).
* **Taxonomy:** Aligned strictly with the **IRMAS dataset** to ensure mathematical matchability.

> **Why this was used:** It simulates a massive "Cold Start" scenario, allowing for controlled validation of how the model prioritizes "Hard Constraints" (Location) over "Soft Constraints" (Genre).

---

## 🛠 Tech Stack
* **Python**
* **FAISS** (Vector Search)
* **Sentence-Transformers** (SBERT)
* **Pandas / NumPy** (Data Processing)
* **Scikit-Learn** (Normalization & Encoding)
