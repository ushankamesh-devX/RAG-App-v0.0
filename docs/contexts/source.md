Conversational RAG Application with LangChain and OpenAI LLM

# Install the necessary packages

!pip install langchain -qU
!pip install langchain-openai -qU
!pip install langchain-chroma -qU
!pip install langchain_community -qU

import os
from google.colab import userdata

Initialize OpenAI LLM

from langchain_openai import ChatOpenAI

# Set OpenAI API key

os.environ['OPENAI_API_KEY'] = userdata.get('OPENAI_API_KEY')

# Initialize the ChatOpenAI model

llm = ChatOpenAI(
model="gpt-3.5-turbo",
temperature=0
)

Initialize Embedding Model

from langchain_openai import OpenAIEmbeddings
embedding_model = OpenAIEmbeddings(model="text-embedding-3-small")

Load PDF Document

!pip install pypdf -qU

from langchain_community.document_loaders import PyPDFLoader

# Load the PDF document

loader = PyPDFLoader("/content/codeprolk.pdf")

docs = loader.load()

len(docs)

4
Split Documents into Chunks

from langchain_text_splitters import RecursiveCharacterTextSplitter

# Initialize the text splitter

text_splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=50)

# Split the documents into chunks

splits = text_splitter.split_documents(docs)

len(splits)

20
Create Vector Store and Retriever

from langchain_chroma import Chroma

# Create a vector store from the document chunks

vectorstore = Chroma.from_documents(documents=splits, embedding=embedding_model)

# Create a retriever from the vector store

retriever = vectorstore.as_retriever()

Define Prompt Template

from langchain_core.prompts import ChatPromptTemplate

# Define the system prompt

system_prompt = (
"You are an intelligent chatbot. Use the following context to answer the question. If you don't know the answer, just say that you don't know."
"\n\n"
"{context}"
)

# Create the prompt template

prompt = ChatPromptTemplate.from_messages(
[
("system", system_prompt),
("human", "{input}"),
]
)

prompt

ChatPromptTemplate(input_variables=['context', 'input'], messages=[SystemMessagePromptTemplate(prompt=PromptTemplate(input_variables=['context'], template="You are an intelligent chatbot. Use the following context to answer the question. If you don't know the answer, just say that you don't know.\n\n{context}")), HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['input'], template='{input}'))])
Create Retrieval-Augmented Generation (RAG) Chain

from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain

# Create the question-answering chain

qa_chain = create_stuff_documents_chain(llm, prompt)

# Create the RAG chain

rag_chain = create_retrieval_chain(retriever, qa_chain)

Invoke RAG Chain with Example Questions

response = rag_chain.invoke({"input": "who is codeprolk"})
response["answer"]

'CodePRO LK is a dynamic educational platform founded by Dinesh Piyasamara during the COVID-19 pandemic. It offers a diverse range of technology-related courses in Sinhala, focusing on programming, data science, and machine learning. CodePRO LK aims to empower Sri Lankans with valuable skills in the tech industry through accessible and high-quality education. The platform continues to evolve and expand its offerings to support its mission of preparing learners for success in the global tech industry.'

response = rag_chain.invoke({"input": "what is rag architecture"})
response["answer"]

'I\'m not familiar with "rag architecture." It seems to be a term or concept that is not related to the context provided about CodePRO LK and its community engagement, partnerships, and future directions in tech education. If you have more context or details about "rag architecture," I may be able to provide a better answer.'

response = rag_chain.invoke({"input": "what are the courses codeprolk offer"})
response["answer"]

'CodePRO LK offers a variety of free courses presented in Sinhala, catering to various proficiency levels from beginners to intermediates. Some key courses include Python GUI – Tkinter. In the future, CodePRO LK aims to expand its offerings to cover advanced topics like artificial intelligence, cybersecurity, and advanced data analytics.'

response = rag_chain.invoke({"input": "can you list down"})
response["answer"]

'List down what specifically? Please provide more details so I can assist you accurately.'
Add Chat History

from langchain.chains import create_history_aware_retriever
from langchain_core.prompts import MessagesPlaceholder

# Define the contextualize system prompt

contextualize_system_prompt = (
"using chat history and the latest user question, just reformulate question if needed and otherwise return it as is"
)

# Create the contextualize prompt template

contextualize_prompt = ChatPromptTemplate.from_messages(
[
("system", contextualize_system_prompt),
MessagesPlaceholder("chat_history"),
("human", "{input}"),
]
)

# Create the history-aware retriever

history_aware_retriever = create_history_aware_retriever(
llm, retriever, contextualize_prompt
)

Create History-Aware RAG Chain

from langchain.chains import create_history_aware_retriever
from langchain_core.prompts import MessagesPlaceholder

system_prompt = (
"You are an intelligent chatbot. Use the following context to answer the question. If you don't know the answer, just say that you don't know."
"\n\n"
"{context}"
)

prompt = ChatPromptTemplate.from_messages(
[
("system", system_prompt),
MessagesPlaceholder("chat_history"),
("human", "{input}"),
]
)

prompt

ChatPromptTemplate(input_variables=['chat_history', 'context', 'input'], input_types={'chat_history': typing.List[typing.Union[langchain_core.messages.ai.AIMessage, langchain_core.messages.human.HumanMessage, langchain_core.messages.chat.ChatMessage, langchain_core.messages.system.SystemMessage, langchain_core.messages.function.FunctionMessage, langchain_core.messages.tool.ToolMessage]]}, messages=[SystemMessagePromptTemplate(prompt=PromptTemplate(input_variables=['context'], template="You are an intelligent chatbot. Use the following context to answer the question. If you don't know the answer, just say that you don't know.\n\n{context}")), MessagesPlaceholder(variable_name='chat_history'), HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['input'], template='{input}'))])

# Create the question-answering chain

qa_chain = create_stuff_documents_chain(llm, prompt)

# Create the history aware RAG chain

rag_chain = create_retrieval_chain(history_aware_retriever, qa_chain)

Manage Chat Session History

from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

# Initialize the store for session histories

store = {}

# Function to get the session history for a given session ID

def get_session_history(session_id: str) -> BaseChatMessageHistory:
if session_id not in store:
store[session_id] = ChatMessageHistory()
return store[session_id]

# Create the conversational RAG chain with session history

conversational_rag_chain = RunnableWithMessageHistory(
rag_chain,
get_session_history,
input_messages_key="input",
history_messages_key="chat_history",
output_messages_key="answer",
)

Invoke Conversational RAG Chain with Example Questions

response = conversational_rag_chain.invoke(
{"input": "who is codeprolk"},
config={"configurable": {"session_id": "101"}},
)
response["answer"]

WARNING:langchain_core.tracers.core:Parent run 7d48947a-adae-4a9b-a748-45e9097146c1 not found for run b2a3d8cf-5aa5-4866-b4b3-96b67061ee9a. Treating as a root run.
'CodePRO LK is a dynamic educational platform founded by Dinesh Piyasamara during the COVID-19 pandemic. It offers a diverse range of technology-related courses in Sinhala, focusing on programming, data science, and machine learning. CodePRO LK aims to empower Sri Lankans with valuable skills in the tech industry through accessible and high-quality education. The platform continues to evolve and expand its offerings to support its mission of preparing learners for success in the global tech industry. Additionally, CodePRO LK engages its community through various events like webinars, live coding sessions, hackathons, and tech talks to provide networking opportunities and practical experience. The platform also collaborates with educational institutions, tech companies, and industry experts to enhance its content and resources, ensuring learners are well-prepared for real-world challenges.'

store

{'101': InMemoryChatMessageHistory(messages=[HumanMessage(content='who is codeprolk'), AIMessage(content='CodePRO LK is a dynamic educational platform founded by Dinesh Piyasamara during the COVID-19 pandemic. It offers a diverse range of technology-related courses in Sinhala, focusing on programming, data science, and machine learning. CodePRO LK aims to empower Sri Lankans with valuable skills in the tech industry through accessible and high-quality education. The platform continues to evolve and expand its offerings to support its mission of preparing learners for success in the global tech industry. Additionally, CodePRO LK engages its community through various events like webinars, live coding sessions, hackathons, and tech talks to provide networking opportunities and practical experience. The platform also collaborates with educational institutions, tech companies, and industry experts to enhance its content and resources, ensuring learners are well-prepared for real-world challenges.')])}

response = conversational_rag_chain.invoke(
{"input": "what is rag architecture"},
config={"configurable": {"session_id": "101"}},
)
response["answer"]

WARNING:langchain_core.tracers.core:Parent run c3646b41-4593-4272-9c98-9089f717a6c8 not found for run f66beff5-a633-4c99-9d10-281d0d77da06. Treating as a root run.
'I\'m sorry, but I don\'t have information on "rag architecture." It seems to be a specific term or concept that is not related to the context provided about CodePRO LK. If you have any other questions or need clarification on a different topic, feel free to ask!'

response = conversational_rag_chain.invoke(
{"input": "what are the courses codeprolk offer"},
config={"configurable": {"session_id": "101"}},
)
response["answer"]

WARNING:langchain_core.tracers.core:Parent run f87e5b41-ba35-49ef-9d2c-ee84f5eccd89 not found for run a77042d3-773f-41f5-be08-7940ef39d96e. Treating as a root run.
"CodePRO LK offers a variety of technology-related courses in Sinhala to empower learners with valuable skills in programming, data science, and machine learning. Some of the key courses offered by CodePRO LK include:\n\n1. Python GUI – Tkinter: This course covers the essentials of creating graphical user interfaces using Python's Tkinter library.\n\nCodePRO LK aims to cater to learners of all proficiency levels, from beginners to intermediates, ensuring that individuals at different stages can benefit from the courses. Additionally, the platform plans to expand its course offerings in the future to cover more advanced topics and emerging technologies such as artificial intelligence, cybersecurity, and advanced data analytics."

response = conversational_rag_chain.invoke(
{"input": "can you list down"},
config={"configurable": {"session_id": "101"}},
)
response["answer"]

WARNING:langchain_core.tracers.core:Parent run e883ec27-d3b6-48e0-aa25-9beecabcc3c3 not found for run abd2ab11-d52d-4545-9494-09bbf56c7a2b. Treating as a root run.
"I apologize for the confusion earlier. Here is a list of some of the courses offered by CodePRO LK:\n\n1. Python GUI – Tkinter: This course covers the essentials of creating graphical user interfaces using Python's Tkinter library.\n\nPlease note that CodePRO LK aims to expand its course offerings in the future to cover more advanced topics and emerging technologies such as artificial intelligence, cybersecurity, and advanced data analytics."
