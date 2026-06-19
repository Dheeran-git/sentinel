"""Factory for Gemini chat models via langchain-google-genai."""
from langchain_google_genai import ChatGoogleGenerativeAI

from sentinel.config import settings


def flash():
    """Workhorse model: fast, multimodal, generous free quota."""
    return ChatGoogleGenerativeAI(
        model=settings.flash_model,
        google_api_key=settings.google_api_key,
        temperature=0.2,
    )


def pro():
    """Max-reasoning model for the hardest step (law grounding)."""
    return ChatGoogleGenerativeAI(
        model=settings.pro_model,
        google_api_key=settings.google_api_key,
        temperature=0.1,
    )
