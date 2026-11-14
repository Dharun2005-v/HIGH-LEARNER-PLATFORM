import os
import sys

# Ensure .env is loaded from the backend directory before anything else
from dotenv import load_dotenv
_env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=_env_path, override=True)

from fastapi import FastAPI, Query, Depends, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from backend.services.firebase_auth import (
    get_current_user,
    require_authenticated_user,
    is_firebase_admin_enabled,
)

app = FastAPI(
    title="HIGH LEARNER API",
    description="Backend API for HIGH LEARNER AI-powered career and learning platform",
    version="1.0.0",
)

# CORS configuration
frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
origins = [
    frontend_origin,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]
if frontend_origin == "*" or os.getenv("ENVIRONMENT") == "production":
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True if origins != ["*"] else False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _dump(model):
    if hasattr(model, "model_dump"):
        return model.model_dump()
    return model.dict()


@app.get("/")
def read_root():
    return {
        "service": "HIGH LEARNER API",
        "status": "online",
        "gemini_model": os.getenv("GEMINI_MODEL", "gemini-3.8-flash"),
        "docs": "/docs",
    }


@app.get("/api/health")
def health_check():
    api_key = os.getenv("GEMINI_API_KEY", "")
    return {
        "status": "ok",
        "message": "HIGH LEARNER API is healthy",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "gemini_model": os.getenv("GEMINI_MODEL", "gemini-3.8-flash"),
        "gemini_configured": bool(api_key),
        "firebase_admin_configured": is_firebase_admin_enabled,
    }


@app.get("/api/auth/status")
def auth_status(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Returns authentication and token verification status.
    Derives UID strictly from verified token or demo user fallback.
    """
    return {
        "authenticated": not current_user.get("is_demo", False),
        "firebase_admin_enabled": is_firebase_admin_enabled,
        "verified_uid": current_user.get("uid"),
        "user_email": current_user.get("email"),
        "mode": "demo" if current_user.get("is_demo", True) else "authenticated",
    }


# ---- Import agents & orchestrator (after env is loaded) ----
from backend.services.orchestrator import orchestrate_analysis
from backend.agents.progress_mentor import mentor as mentor_agent
from backend.agents.assessment import (
    evaluate_assessment, 
    get_public_questions, 
    evaluate_submission
)
from backend.agents.career_matcher import match_career
from backend.agents.learning_path import generate_learning_path
from backend.models import LearnerProfile


# ---- Request Models ----
class AnalyzeRequest(BaseModel):
    fullName: str
    education: str
    skills: List[str]
    proficiency: Dict[str, int]
    certifications: List[str] = []
    projects: List[str] = []
    careerGoal: str
    availability: str


class MentorRequest(BaseModel):
    profile: AnalyzeRequest
    user_message: str
    assessment_info: Dict[str, Any] = {}
    completed_modules: List[str] = []
    assessment_history: List[Dict[str, Any]] = []
    current_weak_concepts: List[str] = []


class AssessmentSubmissionRequest(BaseModel):
    profile: AnalyzeRequest
    skill_name: str = "JavaScript Fundamentals"
    answers: Dict[str, int] = {}  # { "q1": 1, "q2": 2, ... }


class AssessmentRequest(BaseModel):
    profile: AnalyzeRequest
    skill_name: str
    score: int
    weak_concepts: List[str] = []


class UpdateGoalRequest(BaseModel):
    profile: AnalyzeRequest
    new_career_goal: str


# ---- Endpoints ----
@app.post("/api/analyze")
def analyze(req: AnalyzeRequest, current_user: Dict[str, Any] = Depends(get_current_user)):
    result = orchestrate_analysis(_dump(req))
    if isinstance(result, dict):
        result["verified_uid"] = current_user.get("uid")
    return result


@app.get("/api/assessment/questions")
def get_assessment_questions(skill: str = Query("JavaScript Fundamentals")):
    """Returns assessment questions without answers so client cannot cheat."""
    questions = get_public_questions(skill)
    return {
        "skill_name": skill,
        "total_questions": len(questions),
        "questions": questions,
    }


@app.post("/api/assessment/submit")
def submit_assessment_endpoint(
    req: AssessmentSubmissionRequest, 
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Evaluates assessment submission:
    - Calculates score on backend using private answer key (never trusts client score)
    - Applies deterministic adaptive rules (<60%, 60-80%, >80%)
    - Enhances with Gemini context
    - Binds result strictly to verified token UID
    """
    profile = LearnerProfile(**_dump(req.profile))
    result = evaluate_submission(profile, req.skill_name, req.answers)
    result["verified_uid"] = current_user.get("uid")
    return result


@app.post("/api/mentor")
def mentor_endpoint(
    req: MentorRequest, 
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    profile = LearnerProfile(**_dump(req.profile))
    response = mentor_agent(
        profile=profile,
        user_message=req.user_message,
        assessment_info=req.assessment_info,
        completed_modules=req.completed_modules,
        assessment_history=req.assessment_history,
        current_weak_concepts=req.current_weak_concepts,
    )
    dumped = _dump(response)
    dumped["verified_uid"] = current_user.get("uid")
    return dumped


@app.post("/api/assessment")
def assessment_endpoint(
    req: AssessmentRequest, 
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    profile = LearnerProfile(**_dump(req.profile))
    result = evaluate_assessment(profile, req.skill_name, req.score, req.weak_concepts)
    dumped = _dump(result)
    dumped["verified_uid"] = current_user.get("uid")
    return dumped


@app.post("/api/update-goal")
def update_goal(
    req: UpdateGoalRequest, 
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    profile_data = _dump(req.profile)
    profile_data["careerGoal"] = req.new_career_goal
    profile = LearnerProfile(**profile_data)
    career_res = match_career(profile)
    missing = career_res.missing_skills if hasattr(career_res, "missing_skills") else []
    path_res = generate_learning_path(profile, missing)
    return {
        "updated_requirements": career_res.required_skills,
        "updated_gaps": career_res.missing_skills,
        "new_roadmap": _dump(path_res),
        "verified_uid": current_user.get("uid"),
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)
