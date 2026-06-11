from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.exceptions import RAGException, rag_exception_handler
from app.api.routes import chat, documents

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Conversational RAG API using LangChain and Google Generative AI (Gemini)",
    version="1.0.0",
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
app.add_exception_handler(RAGException, rag_exception_handler)

# Include routers
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])

@app.get("/")
def root():
    return {"message": "Welcome to the Conversational RAG API. See /docs for the API documentation."}
