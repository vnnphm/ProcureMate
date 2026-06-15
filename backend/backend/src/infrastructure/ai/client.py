import json
from typing import Any

from openai import AsyncOpenAI

from src.infrastructure.config.settings import settings


def get_openai_client() -> AsyncOpenAI:
    if not settings.OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY not set")

    return AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def generate_json(prompt: str) -> dict[str, Any]:
    client = get_openai_client()

    response = await client.responses.create(
        model="gpt-5.4-mini",
        input=prompt,
        text={
            "format": {
                "type": "json_object",
            }
        },
    )

    return dict(json.loads(response.output_text))


async def generate_text(prompt: str) -> str:
    client = get_openai_client()

    response = await client.responses.create(
        model="gpt-5.4-mini",
        input=prompt,
    )

    return response.output_text