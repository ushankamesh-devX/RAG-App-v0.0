import os
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from app.core.config import settings

# Ensure API key is set for LangChain Google GenAI wrapper
os.environ["GOOGLE_API_KEY"] = settings.GEMINI_API

def get_llm():
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0
    )

def get_embeddings():
    return GoogleGenerativeAIEmbeddings(
        model="gemini-embedding-2-preview"
    )
