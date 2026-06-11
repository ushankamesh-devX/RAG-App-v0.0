from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Conversational RAG API"
    GEMINI_API: str = ""
    CHROMA_PERSIST_DIRECTORY: str = "./chroma_db"

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
