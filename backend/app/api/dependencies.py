from langchain_core.runnables.history import RunnableWithMessageHistory
from app.services.rag import get_rag_chain
from app.utils.session_store import get_session_history

def get_conversational_rag_chain():
    rag_chain = get_rag_chain()
    
    conversational_rag_chain = RunnableWithMessageHistory(
        rag_chain,
        get_session_history,
        input_messages_key="input",
        history_messages_key="chat_history",
        output_messages_key="answer",
    )
    
    return conversational_rag_chain
