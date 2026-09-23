from pydantic_settings import BaseSettings

DEFAULT_DEV_SECRET = "mediscan-dev-secret-change-in-production"

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    # SQLite by default — zero setup required for development
    DATABASE_URL: str = "sqlite+aiosqlite:///./mediscan.db"

    SECRET_KEY: str = DEFAULT_DEV_SECRET
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Optional: OpenRouter key for MediBot (bot is disabled if not provided)
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL: str = "openai/gpt-4o-mini"

    # Optional: Nutritionix fallback (OpenFoodFacts works without a key)
    NUTRITIONIX_APP_ID: str = ""
    NUTRITIONIX_API_KEY: str = ""

    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()


def validate_runtime_settings() -> None:
    """Fail fast for production settings that would make auth unsafe."""
    if settings.ENVIRONMENT.lower() in {"prod", "production"}:
        if settings.SECRET_KEY == DEFAULT_DEV_SECRET or len(settings.SECRET_KEY) < 32:
            raise RuntimeError("SECRET_KEY must be a unique 32+ character value in production.")
