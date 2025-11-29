import json
import os
import sys

# Add backend to sys.path to allow imports if needed, though here we just need standard libs + langchain
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import List

load_dotenv()

# Define the structure for the output
class Concept(BaseModel):
    name: str = Field(description="The name of the concept, mental model, or law.")
    domain: str = Field(description="The field of study (e.g., Economics, Biology, Physics).")
    explanation: str = Field(description="A brief 1-2 sentence explanation of the concept.")
    utility: int = Field(description="A score from 1-10 of how useful this is for general problem solving.")

class ConceptList(BaseModel):
    concepts: List[Concept]

def get_llm():
    if os.getenv("GOOGLE_API_KEY"):
        print("Using Google Gemini...")
        return ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.7)
    elif os.getenv("OPENAI_API_KEY"):
        print("Using OpenAI GPT...")
        return ChatOpenAI(model="gpt-4o", temperature=0.7)
    else:
        raise ValueError("No API key found")

def generate_seed_data():
    llm = get_llm()
    parser = JsonOutputParser(pydantic_object=ConceptList)

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a curator of high-value mental models and interdisciplinary concepts. Your goal is to create a database of 'Unknown Unknowns' - concepts that are highly useful but often unknown to the general public."),
        ("user", "Generate a list of 20 distinct, high-utility concepts from diverse fields (Physics, Biology, Economics, History, Philosophy, Systems Thinking). \n\n"
                 "Examples: Pareto Principle, Lindy Effect, Hormesis, Comparative Advantage, Map-Territory Relation.\n\n"
                 "{format_instructions}")
    ])

    chain = prompt | llm | parser

    print("Generating concepts... This may take a moment.")
    try:
        result = chain.invoke({"format_instructions": parser.get_format_instructions()})

        output_path = os.path.join(os.path.dirname(__file__), '../data/concepts.json')
        with open(output_path, 'w') as f:
            json.dump(result['concepts'], f, indent=2)

        print(f"Successfully generated {len(result['concepts'])} concepts and saved to {output_path}")

    except Exception as e:
        print(f"Error generating data: {e}")

if __name__ == "__main__":
    generate_seed_data()
