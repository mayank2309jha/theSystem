// NLP, transformers, and large language models.
export const nlpLLMSkills = [
  {
    id: "nlp",
    name: "Natural Language Processing (NLP)",
    category: "NLP & LLMs",
    level: 10,
    why: "Demonstrated via the Multi-Model Content Moderation project (DistilBERT, 13-class fallacy engine) and Search & Retrieval Engine's BM25 + semantic hybrid retrieval.",
    subskills: [
      { id: "nlp-tokenization", name: "Tokenization", weight: 2, todos: ["Compare word-level, subword (BPE), and character-level tokenization on a real sentence", "Explain why subword tokenization handles out-of-vocabulary words better"] },
      { id: "nlp-tfidf-bm25", name: "TF-IDF & BM25", weight: 2, todos: ["Derive the BM25 formula term-by-term from memory and explain k1/b's roles", "Implement TF-IDF scoring from scratch on a small corpus"] },
      { id: "nlp-classification", name: "Text Classification", weight: 2, todos: ["Compute and report a per-class confusion matrix for a real multi-class classifier", "Compare a classical baseline (TF-IDF+logistic regression) against a transformer fine-tune on the same task"] },
      { id: "nlp-ner", name: "Named Entity Recognition", weight: 1, todos: ["Run an off-the-shelf NER model on real text and evaluate its errors", "Explain the BIO tagging scheme used in sequence labeling"] },
    ],
  },
  {
    id: "transformers",
    name: "Transformers & Attention",
    category: "NLP & LLMs",
    level: 10,
    why: "Attention mechanisms and transformer architecture recurred across Qualcomm, SAP AI roles, Rakuten, Honda, and Neysa interviews.",
    subskills: [
      { id: "transformers-attention-mechanism", name: "Self-Attention Mechanism", weight: 3, todos: ["Explain softmax's actual role in attention weighting (a real Qualcomm question that has tripped up a candidate before)", "Compute a toy self-attention calculation by hand for a 3-token sequence"] },
      { id: "transformers-architecture", name: "Encoder-Decoder Architecture", weight: 2, todos: ["Explain why FFN sits on top of attention layers in the transformer block", "Compare encoder-only, decoder-only, and encoder-decoder architectures with a model example for each"] },
      { id: "transformers-positional-encoding", name: "Positional Encodings", weight: 1, todos: ["Explain why transformers need positional encodings (no inherent order-awareness)", "Compare sinusoidal vs learned positional embeddings"] },
      { id: "transformers-attention-variants", name: "Attention Variants", weight: 2, todos: ["List and explain all major attention variants (self, cross, multi-head, causal) and why each exists", "Explain multi-head attention's benefit over single-head with more dimensions"] },
    ],
  },
  {
    id: "bert",
    name: "BERT / Pretrained Language Models",
    category: "NLP & LLMs",
    level: 10,
    why: "Used directly in the Multi-Model Content Moderation project's DistilBERT comparison against 8 classical models.",
    subskills: [
      { id: "bert-pretraining", name: "Pretraining Objectives (MLM/NSP)", weight: 2, todos: ["Explain masked language modeling and why it enables bidirectional context", "Explain why BERT can't be used directly for text generation"] },
      { id: "bert-finetuning", name: "Fine-tuning for Downstream Tasks", weight: 2, todos: ["Fine-tune a pretrained model on a new task end to end (a fresh dataset, not the 2023 project)", "Explain the difference between feature extraction and full fine-tuning"] },
      { id: "bert-distillation", name: "Model Distillation", weight: 1, todos: ["Explain how DistilBERT achieves similar performance with fewer parameters", "Explain the trade-off between model size and accuracy in a distilled model"] },
    ],
  },
  {
    id: "llms-prompting",
    name: "Large Language Models (LLMs) & Prompting",
    category: "NLP & LLMs",
    level: 10,
    why: "Increasingly relevant across ML/AI roles industry-wide in 2026 — an emerging area beyond the original resume set.",
    subskills: [
      { id: "llm-prompt-engineering", name: "Prompt Engineering Techniques", weight: 2, todos: ["Write and iterate on a few-shot prompt to improve a real task's output quality", "Explain chain-of-thought prompting and when it helps versus doesn't"] },
      { id: "llm-agentic-workflows", name: "Agentic / Tool-use Workflows", weight: 2, todos: ["Build a small agent workflow that calls at least one external tool/function", "Explain the difference between a single LLM call and a multi-step agent loop"] },
      { id: "llm-evaluation", name: "LLM Output Evaluation", weight: 2, todos: ["Design an evaluation rubric for a generative task where accuracy isn't binary", "Explain why LLM-as-judge evaluation has known biases and how to mitigate one"] },
    ],
  },
  {
    id: "embeddings",
    name: "Embeddings & Vector Search",
    category: "NLP & LLMs",
    level: 10,
    why: "Demonstrated in the Search & Retrieval Engine's 384-dimensional sentence-transformer hybrid retrieval pipeline.",
    subskills: [
      { id: "embeddings-semantic-similarity", name: "Semantic Similarity", weight: 2, todos: ["Compute cosine similarity between real sentence embeddings and sanity-check the ranking", "Explain why embeddings capture semantic meaning that keyword matching misses"] },
      { id: "embeddings-hybrid-retrieval", name: "Hybrid Retrieval (BM25 + embeddings)", weight: 3, todos: ["Re-derive the min-max normalized weighted fusion approach from the Search Engine project", "Explain a case where pure keyword search (BM25) beats semantic search"] },
      { id: "embeddings-ann-indexes", name: "Approximate Nearest Neighbor Indexes", weight: 2, todos: ["Explain the recall-vs-latency trade-off of an ANN index (IVFFlat/HNSW) versus brute force", "Benchmark an ANN index against brute-force search on real embedding data"] },
    ],
  },
  {
    id: "rag",
    name: "Retrieval-Augmented Generation (RAG)",
    category: "NLP & LLMs",
    level: 10,
    why: "Directly probed in a real SAP AI-track interview (\"scalability issues,\" \"what could be improved\") — a production-relevant application of embeddings + LLMs together.",
    subskills: [
      { id: "rag-pipeline-design", name: "RAG Pipeline Design", weight: 3, todos: ["Build a minimal RAG pipeline: chunk -> embed -> retrieve -> generate", "Explain chunking strategy trade-offs (fixed-size vs semantic chunking)"] },
      { id: "rag-production-issues", name: "Production Scaling & Failure Modes", weight: 2, todos: ["Identify 3 concrete ways a RAG pipeline could fail in production (stale index, retrieval miss, hallucination) and a mitigation for each", "Explain how you'd measure whether retrieval quality is the bottleneck versus generation quality"] },
    ],
  },
];
