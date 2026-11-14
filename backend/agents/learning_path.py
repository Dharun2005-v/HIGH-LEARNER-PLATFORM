import logging
from typing import List

from backend.models import LearnerProfile, LearningPathResult, LearningModule
from backend.services.gemini_client import _call_gemini

SYSTEM_INSTRUCTION = """
You are a Learning Path Agent. Based on the learner's profile, career goal, and skill gaps, create a personalized roadmap.
Organize modules in prerequisite order.
Return a JSON object with:
- modules: list of objects each with:
    - title (string)
    - description (string)
    - duration_weeks (int)
    - difficulty (string: "Easy", "Medium", or "Hard")
    - resources (list of verified URLs, only from https://developer.mozilla.org/, https://www.freecodecamp.org/, https://react.dev/, https://nodejs.org/en/learn)
    - exercise (string describing practical task)
- total_duration_weeks (int)
"""

FALLBACK_MODULES = [
    {
        "title": "JavaScript Fundamentals",
        "description": "Core JavaScript syntax, DOM manipulation, ES6+ features.",
        "duration_weeks": 2,
        "difficulty": "Easy",
        "resources": ["https://developer.mozilla.org/en-US/docs/Web/JavaScript", "https://www.freecodecamp.org/"],
        "exercise": "Build a responsive interactive todo list with local storage persistence.",
    },
    {
        "title": "React Architecture & Components",
        "description": "Components, state management, hooks, and clean modern architecture.",
        "duration_weeks": 3,
        "difficulty": "Medium",
        "resources": ["https://react.dev/"],
        "exercise": "Build a dynamic career portfolio viewer with live filtering.",
    },
    {
        "title": "Node.js & Express REST APIs",
        "description": "Server-side JavaScript, routing, middleware, and database connectivity.",
        "duration_weeks": 3,
        "difficulty": "Medium",
        "resources": ["https://nodejs.org/en/learn"],
        "exercise": "Implement a CRUD REST API with JWT authentication and validation.",
    },
    {
        "title": "Full-Stack Integration & Deployment",
        "description": "Connecting React client to Express backend, CORS, and deployment.",
        "duration_weeks": 2,
        "difficulty": "Hard",
        "resources": ["https://developer.mozilla.org/en-US/docs/Learn", "https://www.freecodecamp.org/"],
        "exercise": "Deploy an integrated end-to-end full-stack web application with CI/CD.",
    },
]


def generate_learning_path(profile: LearnerProfile, missing_skills: List[str]) -> LearningPathResult:
    profile_str = profile.model_dump_json() if hasattr(profile, "model_dump_json") else profile.json()
    prompt = (
        f"Learner profile: {profile_str}\n"
        f"Missing / Target skills: {missing_skills}\n"
        f"Create a step-by-step personalized learning roadmap JSON."
    )
    try:
        result_dict = _call_gemini(prompt, SYSTEM_INSTRUCTION)
        return LearningPathResult(**result_dict)
    except Exception as e:
        logging.info(f"Learning Path using deterministic fallback: {e}")
        selected = []
        for module in FALLBACK_MODULES:
            lower_title = module["title"].lower()
            if any(skill.lower() in lower_title for skill in missing_skills):
                selected.append(module)
        if not selected:
            selected = FALLBACK_MODULES
        total_weeks = sum(m["duration_weeks"] for m in selected)
        return LearningPathResult(
            modules=[LearningModule(**m) for m in selected],
            total_duration_weeks=total_weeks,
            fallback=True,
        )
