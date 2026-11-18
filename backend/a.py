
import os
from dotenv import load_dotenv
from openai import OpenAI

# Load API key from backend/.env
load_dotenv(".env", override=True)

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    print("ERROR: GROQ_API_KEY not found in .env")
    exit(1)

client = OpenAI(
    api_key=api_key,
    base_url="https://api.groq.com/openai/v1"
)

try:
    print("\nChecking available Groq models...\n")

    models = client.models.list()

    if not models.data:
        print("No models found.")
    else:
        print(f"Found {len(models.data)} available models:\n")

        for index, model in enumerate(models.data, start=1):
            print(f"{index}. {model.id}")

    print("\nModel check completed!")

except Exception as error:
    print("\nUnable to fetch models.")
    print("Error:", type(error).__name__)
    print("Details:", error)
