from pydantic import BaseModel

class ChatRequest(BaseModel):
    session_id: str
    message: str

class ChatResponse(BaseModel):
    answer: str

class DocumentUploadResponse(BaseModel):
    filename: str
    message: str

class DocumentListResponse(BaseModel):
    documents: list[str]

class DocumentDeleteResponse(BaseModel):
    filename: str
    chunks_deleted: int
    message: str
