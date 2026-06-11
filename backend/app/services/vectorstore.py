import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from app.core.config import settings
from app.services.llm import get_embeddings

def get_vector_store():
    embeddings = get_embeddings()
    # Initialize Chroma vector store with persistence
    vectorstore = Chroma(
        embedding_function=embeddings,
        persist_directory=settings.CHROMA_PERSIST_DIRECTORY
    )
    return vectorstore

def process_and_store_document(file_path: str):
    loader = PyPDFLoader(file_path)
    docs = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=50)
    splits = text_splitter.split_documents(docs)

    vectorstore = get_vector_store()
    vectorstore.add_documents(documents=splits)
    
    return len(splits)

def get_retriever():
    vectorstore = get_vector_store()
    return vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 3}
    )

def get_stored_documents():
    """Get a list of unique document filenames stored in ChromaDB."""
    vectorstore = get_vector_store()
    # Get all stored metadata from the underlying Chroma collection
    collection_data = vectorstore.get()
    
    if not collection_data or not collection_data.get("metadatas"):
        return []
    
    # Extract unique source filenames from metadata
    sources = set()
    for metadata in collection_data["metadatas"]:
        if metadata and "source" in metadata:
            # PyPDFLoader stores the full path; extract just the filename
            filename = os.path.basename(metadata["source"])
            sources.add(filename)
    
    return sorted(list(sources))

def delete_document(filename: str):
    """Delete all embeddings for a given document filename from ChromaDB."""
    vectorstore = get_vector_store()
    collection_data = vectorstore.get()
    
    if not collection_data or not collection_data.get("metadatas"):
        return 0
    
    # Find IDs of all chunks belonging to this document
    ids_to_delete = []
    for idx, metadata in enumerate(collection_data["metadatas"]):
        if metadata and "source" in metadata:
            if os.path.basename(metadata["source"]) == filename:
                ids_to_delete.append(collection_data["ids"][idx])
    
    if ids_to_delete:
        vectorstore.delete(ids=ids_to_delete)
    
    return len(ids_to_delete)
