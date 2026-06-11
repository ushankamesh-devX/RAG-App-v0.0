# Backend API Architecture

This document outlines a standard, clean, and not over-engineered backend architecture using **FastAPI** for the Conversational RAG application. The design separates concerns into distinct layers: routing, business logic (services), and configuration, ensuring maintainability and ease of testing.

## Folder Structure

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application instance, CORS setup, and router inclusion
│   ├── api/
│   │   ├── __init__.py
│   │   ├── dependencies.py     # FastAPI dependencies (e.g., getting services)
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── chat.py         # Endpoints for conversation (e.g., POST /chat)
│   │       └── documents.py    # Endpoints for document ingestion (e.g., POST /upload)
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py           # Pydantic BaseSettings for env vars (GEMINI_API, etc.)
│   │   └── exceptions.py       # Custom API exception handlers
│   ├── services/
│   │   ├── __init__.py
│   │   ├── llm.py              # Initialization of ChatGoogleGenerativeAI and GoogleGenerativeAIEmbeddings
│   │   ├── vectorstore.py      # ChromaDB integration, PyPDFLoader, and TextSplitter logic
│   │   └── rag.py              # LangChain RAG chains and history-aware retrieval logic
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py          # Pydantic models for request/response validation
│   └── utils/
│       ├── __init__.py
│       └── session_store.py    # In-memory dictionary or external store for ChatMessageHistory
├── .env                        # Environment variables
├── requirements.txt            # Python dependencies (fastapi, langchain, uvicorn, etc.)
└── README.md
```

## Component Architecture

### 1. API Routing Layer (`app/api/routes`)
Acts as the entry point for HTTP requests.
- **`chat.py`**: Contains the `/chat` endpoint. It accepts a JSON payload with `session_id` and the user's `message`, calls the RAG service, and returns the AI's response.
- **`documents.py`**: Contains endpoints like `/upload` to handle PDF file uploads. It passes the uploaded file to the vector store service for processing and embedding.

### 2. Service Layer (`app/services`)
Encapsulates the core business logic and LangChain integrations, keeping the API routes clean.
- **`llm.py`**: Configures and provides instances of `ChatGoogleGenerativeAI` (gemini-2.5-flash) and `GoogleGenerativeAIEmbeddings` (gemini-embedding-2-preview).
- **`vectorstore.py`**: Manages document ingestion. Uses `PyPDFLoader` to extract text from uploaded PDFs, `RecursiveCharacterTextSplitter` to chunk the text, and `Chroma` to store and retrieve the embeddings.
- **`rag.py`**: The heart of the application. It ties together the LLM and the Vector Store to create the `history_aware_retriever` and the `RunnableWithMessageHistory` chain for answering user questions with context.

### 3. Data Validation Layer (`app/models/schemas.py`)
Uses Pydantic to validate data entering and leaving the API.
- **`ChatRequest`**: `{ "session_id": "string", "message": "string" }`
- **`ChatResponse`**: `{ "answer": "string" }`

### 4. Session & State Management (`app/utils/session_store.py`)
Manages the chat histories required by LangChain's `RunnableWithMessageHistory`.
- For a simple standard architecture, this can start as an in-memory dictionary mapping `session_id` to a `ChatMessageHistory` object (as seen in the source notebook). 
- If horizontal scaling is needed later, this module can be easily swapped out to use Redis (`RedisChatMessageHistory`) without affecting the rest of the application.

### 5. Core Configuration (`app/core/config.py`)
Utilizes `pydantic-settings` to load configuration from the `.env` file, ensuring type safety for variables like `GEMINI_API` and any database URIs.

## Technology Stack
* **Framework**: FastAPI
* **Server**: Uvicorn
* **AI & Orchestration**: LangChain, LangChain-Google-GenAI, LangChain-Chroma
* **Vector Database**: ChromaDB (Local/Persistent)
* **Validation**: Pydantic
