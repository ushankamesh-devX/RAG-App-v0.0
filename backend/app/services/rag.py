from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_classic.chains import create_retrieval_chain, create_history_aware_retriever
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from app.services.llm import get_llm
from app.services.vectorstore import get_retriever

def get_rag_chain():
    llm = get_llm()
    retriever = get_retriever()
    
    # 1. Contextualize question
    contextualize_q_system_prompt = (
        "Given a chat history and the latest user question "
        "which might reference context in the chat history, "
        "formulate a standalone question which can be understood "
        "without the chat history. Do NOT answer the question, "
        "just reformulate it if needed and otherwise return it as is."
    )
    contextualize_q_prompt = ChatPromptTemplate.from_messages(
        [
            ("system", contextualize_q_system_prompt),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}"),
        ]
    )
    
    # Create the history-aware retriever
    history_aware_retriever = create_history_aware_retriever(
        llm, retriever, contextualize_q_prompt
    )
    
    # 2. Answer question
    system_prompt = (
        "You are an intelligent chatbot. Use the following context to answer the question. "
        "If you don't know the answer, just say that you don't know.\n\n"
        "Context:\n{context}"
    )
    qa_prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}"),
        ]
    )
    
    # Create the question-answering chain
    qa_chain = create_stuff_documents_chain(llm, qa_prompt)

    # Create the history aware RAG chain
    rag_chain = create_retrieval_chain(history_aware_retriever, qa_chain)
    
    return rag_chain
