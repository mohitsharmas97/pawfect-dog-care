
from pathlib import Path
from collections import Counter
import os
import re

from dotenv import load_dotenv

BASE = Path(__file__).resolve().parents[1]
load_dotenv(BASE / ".env", override=True)

KNOWLEDGE_DIR = BASE / "knowledge"

# Words that add little value to document matching.
STOP_WORDS = {
    "the", "and", "for", "with", "that", "this", "what",
    "when", "where", "which", "how", "why", "can", "could",
    "would", "should", "does", "do", "is", "are", "was",
    "were", "my", "me", "my", "dog", "pet", "please",
    "tell", "about", "have", "has", "had", "its", "their",
    "from", "into", "your", "you", "it", "on", "in", "to",
    "of", "a", "an", "or", "be", "been", "being"
}

# Expand common dog-health terms to improve retrieval.
SYNONYMS = {
    "itch": ["itchy", "itching", "scratch", "scratching", "pruritus"],
    "redness": ["red", "inflamed", "inflammation", "irritation"],
    "skin": ["coat", "fur", "dermatitis", "dermal"],
    "wound": ["sore", "lesion", "cut", "ulcer"],
    "vomit": ["vomiting", "throwing", "retching"],
    "diarrhea": ["loose", "stool", "diarrhoea"],
    "ear": ["ears", "earwax", "otitis"],
    "paw": ["paws", "foot", "feet", "pads"],
    "hair": ["fur", "coat", "hairloss", "alopecia"],
    "swelling": ["swollen", "lump", "bump"],
    "flea": ["fleas", "parasite", "parasites"],
    "allergy": ["allergic", "hypersensitivity"],
    "infection": ["infected", "bacterial", "fungal"],
}


def tokenize(text: str):
    words = re.findall(r"[a-z]{3,}", text.lower())
    return [
        word for word in words
        if word not in STOP_WORDS
    ]


def expand_terms(words):
    expanded = set(words)

    for word in words:
        for key, synonyms in SYNONYMS.items():
            if word == key or word in synonyms:
                expanded.add(key)
                expanded.update(synonyms)

    return expanded


def load_knowledge():
    documents = []

    if not KNOWLEDGE_DIR.exists():
        return documents

    for path in KNOWLEDGE_DIR.glob("*.md"):
        try:
            content = path.read_text(encoding="utf-8")
        except OSError:
            continue

        # Split Markdown into heading-based sections.
        sections = re.split(
            r"\n(?=#{1,3}\s)",
            content
        )

        for section in sections:
            section = section.strip()

            if len(section) < 40:
                continue

            first_line = section.splitlines()[0]
            title = re.sub(r"^#+\s*", "", first_line).strip()

            documents.append({
                "source": path.name,
                "title": title,
                "text": section,
                "tokens": tokenize(section)
            })

    return documents


def retrieve(query: str, k: int = 4):
    query_words = tokenize(query)

    if not query_words:
        return []

    query_terms = expand_terms(query_words)
    documents = load_knowledge()

    scored_documents = []

    for document in documents:
        document_words = document["tokens"]

        if not document_words:
            continue

        word_counts = Counter(document_words)
        document_terms = set(document_words)

        # Score direct and synonym matches.
        matched_terms = query_terms & document_terms

        if not matched_terms:
            continue

        coverage = len(matched_terms) / max(len(query_terms), 1)

        # Give more importance to terms repeated in the section.
        frequency_score = sum(
            min(word_counts[term], 3)
            for term in matched_terms
        )

        # A matching heading is a useful relevance signal.
        title_terms = set(tokenize(document["title"]))
        title_matches = len(query_terms & title_terms)

        score = (
            coverage * 5
            + frequency_score * 0.25
            + title_matches * 1.5
        )

        scored_documents.append((score, document))

    scored_documents.sort(
        key=lambda item: item[0],
        reverse=True
    )

    return [
        document
        for score, document in scored_documents[:k]
    ]


def build_context(documents):
    if not documents:
        return ""

    parts = []

    for index, document in enumerate(documents, start=1):
        parts.append(
            f"[Knowledge {index}]\n"
            f"Source: {document['source']}\n"
            f"Section: {document['title']}\n"
            f"{document['text']}"
        )

    return "\n\n".join(parts)[:12000]


def answer(query: str, history=None):
    history = history or []

    documents = retrieve(query, k=4)

    sources = list(dict.fromkeys(
        document["source"]
        for document in documents
    ))

    context = build_context(documents)

    api_key = os.getenv("GROQ_API_KEY")
    model = os.getenv(
        "GROQ_MODEL",
        "openai/gpt-oss-120b"
    )

    if not api_key:
        return {
            "answer": (
                "PawPal AI is not configured yet. "
                "Please check the GROQ_API_KEY in your backend .env file."
            ),
            "sources": sources,
            "mode": "retrieval_only"
        }

    system_prompt = """
You are PawPal, a friendly and responsible dog-care assistant.

Your job is to help dog owners understand symptoms and decide
what sensible next step to take.

IMPORTANT RULES:

1. You are NOT a veterinarian. Never claim to diagnose a dog.
2. Never prescribe medicines, dosages, or home remedies that
   could harm an animal.
3. Use the supplied knowledge context when it is relevant.
4. Do not pretend that the knowledge base contains information
   that is not actually present.
5. If the context does not answer the question, say so clearly.
   You may provide conservative general guidance, but distinguish
   it from information found in the knowledge base.
6. Never confidently identify a disease from symptoms alone.
7. Never recommend delaying emergency veterinary care.
8. Do not recommend human medicines or human skin creams.
9. Do not invent statistics, success rates, or medical facts.
10. Ask only the most useful follow-up questions, not a long
    questionnaire.

SAFETY TRIAGE:

- Recommend immediate veterinary care for breathing difficulty,
  collapse, seizures, suspected poisoning, severe bleeding,
  severe pain, or rapidly worsening symptoms.
- Recommend prompt veterinary assessment for spreading redness,
  pus, open sores, significant swelling, bad odor, or persistent
  scratching and discomfort.
- For mild symptoms without warning signs, explain safe
  observation steps and when to contact a veterinarian.

RESPONSE STYLE:

For a dog-health symptom question, use this structure:

1. What the symptoms might mean:
   Give possible explanations, not a diagnosis.

2. What to do now:
   Give a few safe, practical steps.

3. When to contact a vet:
   Explain the warning signs and urgency.

4. A few questions:
   Ask up to 3 relevant questions if more information is needed.

For general dog-care questions, answer directly without forcing
the medical structure.

Keep answers clear, warm, practical, and easy to understand.
Avoid unnecessary repetition and overly long tables.
Use simple language for first-time dog owners.
"""


    user_prompt = f"""
RELEVANT KNOWLEDGE BASE INFORMATION:

{context if context else
"No directly relevant section was found in the local knowledge base."}

DOG OWNER'S CURRENT QUESTION:

{query}

Instructions:
- Answer the actual question, not a different question.
- Use relevant knowledge above where available.
- If knowledge is missing, be transparent.
- Prioritize the dog's safety.
"""

    messages = [
        {
            "role": "system",
            "content": system_prompt
        }
    ]

    # Include recent conversation for continuity.
    for item in history[-8:]:
        if not isinstance(item, dict):
            continue

        role = item.get("role")
        content = item.get("content", "")

        if (
            role in {"user", "assistant"}
            and isinstance(content, str)
            and content.strip()
        ):
            messages.append({
                "role": role,
                "content": content[:1500]
            })

    messages.append({
        "role": "user",
        "content": user_prompt
    })

    try:
        from openai import OpenAI

        client = OpenAI(
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1",
            timeout=45.0,
            max_retries=2
        )

        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.25,
            max_tokens=800
        )

        generated_answer = (
            response.choices[0].message.content or ""
        ).strip()

        if not generated_answer:
            raise ValueError("The model returned an empty response.")

        return {
            "answer": generated_answer,
            "sources": sources,
            "mode": "groq_rag" if documents else "groq_general"
        }

    except Exception as exc:
        print("========== PAWPAL GROQ ERROR ==========")
        print("Error type:", type(exc).__name__)
        print("Error:", str(exc))
        print("=======================================")

        fallback = (
            "PawPal AI is temporarily unavailable. "
            "Please try again shortly."
        )

        if context:
            fallback += (
                "\n\nI found some potentially relevant information "
                "in the local knowledge base:\n\n"
                + context[:4000]
            )

        fallback += (
            "\n\nFor medical concerns, please contact a veterinarian."
        )

        return {
            "answer": fallback,
            "sources": sources,
            "mode": "retrieval_fallback"
        }
