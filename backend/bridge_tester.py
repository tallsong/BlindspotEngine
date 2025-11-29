import os
import sys
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Load environment variables
load_dotenv()

def get_llm():
    if os.getenv("GOOGLE_API_KEY"):
        print("Using Google Gemini...")
        return ChatGoogleGenerativeAI(model="gemini-2.0-flash")
    elif os.getenv("OPENAI_API_KEY"):
        print("Using OpenAI GPT...")
        return ChatOpenAI(model="gpt-4o")
    else:
        print("Error: No API key found. Please set GOOGLE_API_KEY or OPENAI_API_KEY in .env file.")
        return None

def bridge_algorithm(known_domain, target_domain, specific_focus=None):
    llm = get_llm()
    if not llm:
        return

    # Construct the prompt
    system_message = "You are a polymath tutor specializing in finding cross-disciplinary connections."

    user_message = f"""
    I am an expert in {known_domain}.
    I want you to find a concept from {target_domain} that is highly relevant to my field.

    """

    if specific_focus:
        user_message += f"Specifically, find something that relates to {specific_focus}.\n"
    else:
        user_message += "Find a concept that provides a powerful metaphor or mental model for my work.\n"

    user_message += f"""
    Please provide:
    1. The Concept Name (from {target_domain}).
    2. A brief explanation of the concept.
    3. The "Bridge": How this concept explains or illuminates a problem in {known_domain}.
    """

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_message),
        ("user", user_message),
    ])

    chain = prompt | llm | StrOutputParser()

    try:
        result = chain.invoke({})
        return result
    except Exception as e:
        return f"An error occurred: {e}"

if __name__ == "__main__":
    if len(sys.argv) > 2:
        known = sys.argv[1]
        target = sys.argv[2]
        focus = sys.argv[3] if len(sys.argv) > 3 else None
    else:
        # Default example from the plan
        known = "Software Engineering"
        target = "Agricultural History"
        focus = "software scaling"

    print(f"--- The Blindspot Engine ---")
    print(f"Known Domain: {known}")
    print(f"Target Domain: {target}")
    if focus:
        print(f"Focus: {focus}")
    print("-" * 30)

    result = bridge_algorithm(known, target, focus)
    print(result)
