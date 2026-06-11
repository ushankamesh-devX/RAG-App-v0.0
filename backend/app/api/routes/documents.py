import os
import shutil
from fastapi import APIRouter, UploadFile, File
from app.models.schemas import DocumentUploadResponse, DocumentListResponse, DocumentDeleteResponse
from app.services.vectorstore import process_and_store_document, get_stored_documents, delete_document
from app.core.exceptions import RAGException

router = APIRouter()

UPLOAD_DIR = "./temp_uploads"

@router.get("/list", response_model=DocumentListResponse)
async def list_documents():
    try:
        documents = get_stored_documents()
        return DocumentListResponse(documents=documents)
    except Exception as e:
        raise RAGException(message=f"Error listing documents: {str(e)}")

@router.delete("/delete/{filename}", response_model=DocumentDeleteResponse)
async def delete_doc(filename: str):
    try:
        chunks_deleted = delete_document(filename)
        if chunks_deleted == 0:
            raise RAGException(message=f"Document '{filename}' not found.", status_code=404)
        return DocumentDeleteResponse(
            filename=filename,
            chunks_deleted=chunks_deleted,
            message=f"Deleted {chunks_deleted} chunks for '{filename}'."
        )
    except RAGException:
        raise
    except Exception as e:
        raise RAGException(message=f"Error deleting document: {str(e)}")


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise RAGException(message="Only PDF files are supported.", status_code=400)
    
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        chunks_added = process_and_store_document(file_path)
        
        return DocumentUploadResponse(
            filename=file.filename,
            message=f"Successfully processed {chunks_added} chunks into the vector store."
        )
    except Exception as e:
        raise RAGException(message=f"Error processing document: {str(e)}")
    finally:
        # Clean up the temporary file
        if os.path.exists(file_path):
            os.remove(file_path)
