# 🎬 Flopbuster: The Bad Review Movie Poster Generator

A rapid full-stack proof-of-concept (PoC) that transforms terrible customer reviews into dramatic, cinematic Hollywood movie posters. Built as a lightweight, highly responsive MVP demonstrating advanced AI pipeline orchestration and sleek reactive UX.

🔗 **Live Demo:** [https://tw-home-assignment.vercel.app]

---

## 🚀 Tech Stack

*   **Framework:** Nuxt 4 (Vue 3 + TypeScript)
*   **Styling & UI Kit:** `@nuxt/ui` (Tailwind CSS)
*   **Media Optimization:** `@nuxt/image` (`NuxtImg`)
*   **Server/API:** Nuxt Server Routes (`server/api/*`)
*   **AI Integration:** Vercel AI SDK v6 (`ai` + `@ai-sdk/google` for Gemini)
*   **Validation:** `zod`
*   **Persistence:** Browser `localStorage` (Tracks up to 10 historical posters)

---

## ⚡ Main Functionality

1.  **AI Metadata Pipeline:** Transforms a raw text review + chosen genre into structured Hollywood metadata (Title, Tagline, and optimized Image Prompt).
2.  **3-Stage Progressive Loader:** Enhances perceived performance by replacing static spinners with multi-step event triggers (*Scripting* -> *Painting* -> *Final Render*).
3.  **Local History Vault:** Automatically caches up to 10 generations in `localStorage` to allow instant on-click restores without redundant API calls.
4.  **Device Utility:** One-click handlers to download the graphic asset or copy the public image link to the clipboard.
5.  **Resilient Fallbacks:** Toast-based error tracking with instant fallback layout configurations.

---

## 🛠️ Architectural Decisions (Interview Value)

*   **Zero-Overhead Server:** Leveraged Nuxt Server Routes (Nitro engine) as a secure API gateway. This eliminates the deployment, CORS, and structural overhead of building a standalone Node/Python backend.
*   **Pipeline Decoupling:** Instead of holding an HTTP thread open for 10 seconds during heavy asset generation, the server returns the Gemini metadata instantly (Stage 1). The client then renders the Title/Tagline while fetching the image directly from Pollinations.ai via native DOM `@load` listeners (Stages 2 & 3).
*   **Type-Safe LLM Contracts:** Implemented the modern Vercel AI SDK v6 `Output.object` structure bound to `Zod` schemas, forcing native deterministic JSON compliance from Gemini.

---

## ⚙️ Local Development Setup

Follow these steps to spin up the project locally:

### 1. Clone & Install
```bash
# Clone the repository
git clone <your-repo-url>

# Navigate into the project root
cd flopbuster

# Install project dependencies
npm install
```

### 2. Configure Environment Variables
Copy the provided environment example file to create your local .env:

```bash
cp .env.example .env
```

Open your newly created .env file and insert your Gemini API Key from Google AI Studio:

```bash
GOOGLE_GENERATIVE_AI_API_KEY="your_actual_gemini_api_key_here"
```

### 3. Run the App
```bash
# Boot the local Nuxt development engine
npm run dev
```

Once initialized, open http://localhost:3000 in your browser to test the workflow.
