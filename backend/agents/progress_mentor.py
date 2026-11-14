import logging
from typing import Dict, Any, List, Optional

from backend.models import LearnerProfile, MentorResponse
from backend.services.gemini_client import _call_gemini

SYSTEM_INSTRUCTION = """
You are the AI Progress Mentor for HIGH LEARNER, a premier AI career & skill acceleration platform.
You have access to the learner's full live state:
- Profile & background
- Target career goal
- Current skills & proficiencies
- Completed roadmap modules
- Assessment history (recent scores, dates, and weak concepts)
- Current weak concepts

Answer the learner's question with actionable, empathetic, and personalized guidance.
If the learner asks about why they are weak in a skill, explain their actual weak concepts from their assessment history.
If they ask what to learn next, reference their completed modules and next pending roadmap step.
Return a valid JSON object matching:
{
  "message": "personalized, context-aware mentoring advice (150-250 words)",
  "next_action": "concrete immediate step (e.g., Practice Array.prototype.reduce on MDN)"
}
Return only valid JSON.
"""


def mentor(
    profile: LearnerProfile,
    user_message: str,
    assessment_info: Optional[Dict[str, Any]] = None,
    completed_modules: Optional[List[str]] = None,
    assessment_history: Optional[List[Dict[str, Any]]] = None,
    current_weak_concepts: Optional[List[str]] = None,
) -> MentorResponse:
    """
    Delivers context-aware AI Progress Mentoring based on:
    - Profile & Target Career Goal
    - Completed modules list
    - Assessment history & scores
    - Current identified weak concepts
    """
    completed_modules = completed_modules or []
    assessment_history = assessment_history or []
    current_weak_concepts = current_weak_concepts or []
    assessment_info = assessment_info or {}

    # Extract latest assessment context if available
    latest_assessment = assessment_history[-1] if assessment_history else assessment_info
    latest_score = latest_assessment.get("score") if isinstance(latest_assessment, dict) else None
    latest_weaks = latest_assessment.get("weak_concepts", current_weak_concepts) if isinstance(latest_assessment, dict) else current_weak_concepts

    profile_str = profile.model_dump_json() if hasattr(profile, "model_dump_json") else profile.json()

    context_prompt = (
        f"Learner Profile: {profile_str}\n"
        f"Target Career: {profile.careerGoal}\n"
        f"Completed Roadmap Modules: {completed_modules}\n"
        f"Recent Assessment History: {assessment_history}\n"
        f"Current Weak Concepts: {latest_weaks}\n"
        f"User Message: {user_message}\n"
        f"Provide personalized mentor guidance based on their actual learning state."
    )

    try:
        result_dict = _call_gemini(context_prompt, SYSTEM_INSTRUCTION)
        return MentorResponse(**result_dict)
    except Exception as e:
        logging.info(f"Progress Mentor using deterministic context fallback: {e}")

        # Intelligent context-aware deterministic fallback
        msg_lower = user_message.lower()
        name = profile.fullName or "Learner"
        career = profile.careerGoal or "Full Stack Developer"

        if "why am i weak" in msg_lower or "weak" in msg_lower or "assessment" in msg_lower or "explain" in msg_lower:
            if latest_weaks:
                weak_list_str = ", ".join(latest_weaks)
                advice = (
                    f"Hi {name}, looking at your assessment records, your main area for improvement in JavaScript "
                    f"is focused around: **{weak_list_str}**"
                    + (f" (recent test score: {latest_score}%)." if latest_score is not None else ".")
                    + " These concepts require hands-on code execution rather than passive reading. "
                    "I recommend dedicating 30 minutes to writing small code experiments isolating each topic before advancing."
                )
                action = f"Complete practice exercises targeting {latest_weaks[0]}"
            else:
                advice = (
                    f"Hi {name}, you have a solid track record in foundational skills! "
                    "To pinpoint any latent gaps, take our JavaScript Fundamentals assessment on the Progress tab."
                )
                action = "Take the 5-question JavaScript Fundamentals assessment"

        elif "what should i learn next" in msg_lower or "next" in msg_lower:
            if "React Architecture & State Management" in completed_modules:
                advice = (
                    f"Great job finishing React Architecture, {name}! Your next logical milestone toward becoming a {career} "
                    "is building secure backend services with **Node.js & Express REST APIs**."
                )
                action = "Start Node.js & Express RESTful APIs module"
            else:
                advice = (
                    f"Based on your goal of becoming a {career}, your highest priority next milestone is **React Architecture & Component Lifecycles**. "
                    "Mastering state management, hooks, and component composability is crucial for modern applications."
                )
                action = "Open Roadmap and begin React Architecture module"

        elif "project" in msg_lower or "react project" in msg_lower:
            advice = (
                f"For a standout portfolio project as a {career}, build an **Interactive Developer Task Management Dashboard**. "
                "Incorporate custom React hooks, localStorage synchronization, drag-and-drop state, and REST API integration. "
                "This demonstrates both frontend flair and state architecture."
            )
            action = "Build an Interactive Task Manager in React with LocalStorage"

        elif "how can i become" in msg_lower or "full stack" in msg_lower:
            advice = (
                f"Becoming a production-ready {career} requires 3 core pillars: "
                "1) Modern JavaScript & React frontend proficiency, "
                "2) Express/Node.js or Python backend API development, and "
                "3) Database querying with SQL and deployment. "
                f"You currently have {len(completed_modules)} roadmap modules finished. Follow the Sequenced Roadmap step-by-step!"
            )
            action = "Review your Roadmap and complete pending module exercises"

        else:
            advice = (
                f"Hello {name}, you are making steady progress toward becoming a {career}. "
                + (f"You've completed {len(completed_modules)} roadmap modules so far. " if completed_modules else "")
                + "Review any challenging concepts, practice with hands-on coding challenges, and stay consistent with your weekly study schedule!"
            )
            action = "Review weak concepts and complete the next roadmap module exercise"

        return MentorResponse(
            message=advice,
            next_action=action,
            fallback=True,
        )
