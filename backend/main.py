from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
import os
from dotenv import load_dotenv

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser

# Import Vector Engine
try:
    from vector_engine import VectorEngine
except ImportError:
    from .vector_engine import VectorEngine

load_dotenv()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Vector Engine
base_dir = os.path.dirname(os.path.abspath(__file__))
engine = VectorEngine(persist_path=os.path.join(base_dir, "chroma_db"))
json_path = os.path.join(base_dir, "data/concepts.json")
if os.path.exists(json_path):
    print("Ingesting/Updating concepts...")
    engine.ingest_concepts(json_path)

# Models
class BridgeRequest(BaseModel):
    known_domain: str
    target_domain: str
    focus: Optional[str] = None

class EpiphanyRequest(BaseModel):
    expert_topics: List[str]

class QuestionRequest(BaseModel):
    known_domain: str
    target_domain: str
    focus: Optional[str] = None

class QuestionResponse(BaseModel):
    questions: List[str]

class QA(BaseModel):
    question: str
    answer: str

class PlanRequest(BaseModel):
    known_domain: str
    target_domain: str
    focus: Optional[str] = None
    qa_list: List[QA]

class ScheduleItem(BaseModel):
    time: str = Field(description="The time of the activity, e.g., '09:00 AM'")
    activity: str = Field(description="The name of the activity")
    description: str = Field(description="A brief description of what to do")
    resource_type: str = Field(description="Type of resource, e.g., 'Article', 'Video', 'Exercise', 'Reflection'")

class PlanResponse(BaseModel):
    schedule: List[ScheduleItem]

def get_llm():
    if os.getenv("GOOGLE_API_KEY"):
        return ChatGoogleGenerativeAI(model="gemini-2.0-flash")
    elif os.getenv("OPENAI_API_KEY"):
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

@app.post("/generate_questions", response_model=QuestionResponse)
async def generate_questions(request: QuestionRequest):
    llm = get_llm()
    if not llm:
        raise HTTPException(status_code=500, detail="LLM API key not configured.")

    parser = JsonOutputParser(pydantic_object=QuestionResponse)

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert tutor who assesses knowledge gaps."),
        ("user", """I am familiar with {known_domain} but I want to learn about {target_domain}, specifically focusing on {focus}.
        Generate 3-5 diagnostic questions to assess my current understanding or identify "unknown unknowns" (blindspots) regarding {target_domain}.
        Return the output as a JSON object with a key 'questions' containing the list of strings.
        {format_instructions}
        """)
    ])

    chain = prompt | llm | parser

    try:
        result = chain.invoke({
            "known_domain": request.known_domain,
            "target_domain": request.target_domain,
            "focus": request.focus or "general concepts",
            "format_instructions": parser.get_format_instructions()
        })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate_plan", response_model=PlanResponse)
async def generate_plan(request: PlanRequest):
    llm = get_llm()
    if not llm:
        raise HTTPException(status_code=500, detail="LLM API key not configured.")

    parser = JsonOutputParser(pydantic_object=PlanResponse)

    qa_text = "\n".join([f"Q: {qa.question}\nA: {qa.answer}" for qa in request.qa_list])

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert curriculum designer."),
        ("user", """I am an expert in {known_domain} wanting to learn {target_domain} (Focus: {focus}).
        Here are my answers to your diagnostic questions:
        {qa_text}

        Based on this, generate a 1-day learning plan (approx 6-8 hours) broken down by hour.
        The plan should help me bridge the gap and understand the target domain.
        Return the output as a JSON object with a key 'schedule' containing a list of objects with keys: 'time', 'activity', 'description', 'resource_type'.
        {format_instructions}
        """)
    ])

    chain = prompt | llm | parser

    try:
        result = chain.invoke({
            "known_domain": request.known_domain,
            "target_domain": request.target_domain,
            "focus": request.focus or "general concepts",
            "qa_text": qa_text,
            "format_instructions": parser.get_format_instructions()
        })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

app.mount("/", StaticFiles(directory="static", html=True), name="static")
