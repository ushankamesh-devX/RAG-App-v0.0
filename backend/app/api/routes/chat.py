from fastapi import APIRouter, Depends
from app.models.schemas import ChatRequest, ChatResponse
from app.api.dependencies import get_conversational_rag_chain
from app.core.exceptions import RAGException

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    chain=Depends(get_conversational_rag_chain)
):
    try:
        response = chain.invoke(
            {"input": request.message},
            config={"configurable": {"session_id": request.session_id}},
        )
        return ChatResponse(answer=response["answer"])
    except Exception as e:
        raise RAGException(message=f"Error processing chat request: {str(e)}")
