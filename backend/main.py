from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

# Re-use logic from bridge_tester.py, but likely import it or copy it.
# Since bridge_tester.py was a script, I'll refactor it slightly to be importable or just copy the logic.
# For simplicity and speed, I will copy the logic and adapt it.

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from typing import List, Dict

# Import Vector Engine
# Ensure backend directory is in path if needed, though running via uvicorn typically handles it
try:
    from vector_engine import VectorEngine
except ImportError:
    # Try relative import if running as module
    from .vector_engine import VectorEngine

load_dotenv()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all. In production, restrict.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Vector Engine
# In production, we should handle persistence path more robustly
base_dir = os.path.dirname(os.path.abspath(__file__))
engine = VectorEngine(persist_path=os.path.join(base_dir, "chroma_db"))
json_path = os.path.join(base_dir, "data/concepts.json")
if os.path.exists(json_path):
    print("Ingesting/Updating concepts...")
    engine.ingest_concepts(json_path)

class BridgeRequest(BaseModel):
    known_domain: str
    target_domain: str
    focus: Optional[str] = None

class EpiphanyRequest(BaseModel):
    expert_topics: List[str]

class EpiphanyResponse(BaseModel):
    concept_name: str
    concept_domain: str
    explanation: str
    bridge: str

def get_llm():
    if os.getenv("GOOGLE_API_KEY"):
        # print("Using Google Gemini...")
        return ChatGoogleGenerativeAI(model="gemini-2.0-flash")
    elif os.getenv("OPENAI_API_KEY"):
        # print("Using OpenAI GPT...")
        return ChatOpenAI(model="gpt-4o")
    else:
        return None

@app.post("/bridge")
async def generate_bridge(request: BridgeRequest):
    llm = get_llm()
    if not llm:
        raise HTTPException(status_code=500, detail="LLM API key not configured.")

    system_message = "You are a polymath tutor specializing in finding cross-disciplinary connections."

    user_message = f"""
    I am an expert in {request.known_domain}.
    I want you to find a concept from {request.target_domain} that is highly relevant to my field.
    """

    if request.focus:
        user_message += f"Specifically, find something that relates to {request.focus}.\n"
    else:
        user_message += "Find a concept that provides a powerful metaphor or mental model for my work.\n"

    user_message += f"""
    Please provide:
    1. The Concept Name (from {request.target_domain}).
    2. A brief explanation of the concept.
    3. The "Bridge": How this concept explains or illuminates a problem in {request.known_domain}.
    """

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_message),
        ("user", user_message),
    ])

    chain = prompt | llm | StrOutputParser()

    try:
        result = chain.invoke({})
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/epiphany")
async def generate_epiphany(request: EpiphanyRequest):
    llm = get_llm()
    if not llm:
         # Fallback for testing/demo without keys if needed, but per specs we should error
         raise HTTPException(status_code=500, detail="LLM API key not configured.")

    # 1. Find Unknown Unknown
    concept_metadata = engine.find_unknown_unknown(request.expert_topics)
    if not concept_metadata:
        raise HTTPException(status_code=404, detail="No concepts found in database.")

    concept_name = concept_metadata['name']
    concept_domain = concept_metadata['domain']
    concept_explanation = concept_metadata['explanation']

    # 2. Generate Bridge
    system_message = "You are a polymath tutor. Your goal is to explain a new concept to a user by bridging it to their existing expertise."

    user_topics_str = ", ".join(request.expert_topics)

    user_message = f"""
    The user is an expert in: {user_topics_str}.

    The concept they need to learn is: "{concept_name}" (from {concept_domain}).
    Definition: {concept_explanation}

    Task:
    1. Explain "{concept_name}" clearly.
    2. Create a powerful metaphor or analogy that explains this concept using their expertise in {user_topics_str}.
    3. Explain why this concept is a "Blindspot" they should be aware of.

    Return the response as a JSON object with keys: "concept_name", "concept_domain", "explanation", "bridge".
    """

    parser = JsonOutputParser(pydantic_object=EpiphanyResponse)

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_message),
        ("user", user_message + "\n\n{format_instructions}"),
    ])

    chain = prompt | llm | parser

    try:
        result = chain.invoke({"format_instructions": parser.get_format_instructions()})
        return result
    except Exception as e:
        # Fallback if JSON parsing fails
        print(f"LLM Error: {e}")
        # Try to return raw text wrapped if parsing fails, but better to just error for now or retry
        raise HTTPException(status_code=500, detail=f"Failed to generate bridge: {str(e)}")

# @app.get("/")
# def read_root():
#     return {"message": "Blindspot Engine API is running"}

app.mount("/", StaticFiles(directory="static", html=True), name="static")
