import os
from pathlib import Path

from dotenv import load_dotenv
from anthropic import Anthropic


# Project root शोधणे
PROJECT_ROOT = Path(__file__).resolve().parents[2]

# .env file load करणे
ENV_PATH = PROJECT_ROOT / ".env"
load_dotenv(ENV_PATH)

# API key environment मधून घेणे
api_key = os.getenv("ANTHROPIC_API_KEY")

# API key आहे का ते check करणे
if not api_key:
    print("❌ ANTHROPIC_API_KEY .env मध्ये सापडली नाही.")
    raise SystemExit(1)

print("✅ ANTHROPIC_API_KEY .env मधून मिळाली.")
print("🔄 Claude API ला test request पाठवत आहे...")


try:
    client = Anthropic(api_key=api_key)

    response = client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=20,
        messages=[
            {
                "role": "user",
                "content": "Reply with only: API WORKING"
            }
        ]
    )

    print("\n✅ SUCCESS!")
    print("Claude API Key working आहे.")
    print("Claude response:")

    for block in response.content:
        if hasattr(block, "text"):
            print(block.text)

except Exception as error:

    print("\n❌ CLAUDE API TEST FAILED")
    print("Error type:", type(error).__name__)
    print("Error:", error)