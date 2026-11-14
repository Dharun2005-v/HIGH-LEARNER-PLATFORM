import logging
from typing import Dict, Any

from backend.models import LearnerProfile, SkillAnalysisResult, CareerMatcherResult, LearningPathResult
from backend.agents.skill_analyst import analyze_skill
from backend.agents.career_matcher import match_career
from backend.agents.learning_path import generate_learning_path


def _dump(model):
    if hasattr(model, "model_dump"):
        return model.model_dump()
    return model.dict()


def orchestrate_analysis(profile_data: Dict[str, Any]) -> Dict[str, Any]:
    """Orchestrate the full analysis pipeline."""
    try:
        profile = LearnerProfile(**profile_data)
    except Exception as e:
        logging.error(f"Invalid learner profile: {e}")
        raise

    skill_res: SkillAnalysisResult = analyze_skill(profile)
    career_res: CareerMatcherResult = match_career(profile)
    missing = career_res.missing_skills if hasattr(career_res, "missing_skills") else []
    path_res: LearningPathResult = generate_learning_path(profile, missing)

    agent_statuses = {
        "skill_analyst_fallback": getattr(skill_res, "fallback", False),
        "career_matcher_fallback": getattr(career_res, "fallback", False),
        "learning_path_fallback": getattr(path_res, "fallback", False),
    }

    return {
        "career_readiness_score": career_res.readiness_score,
        "strengths": skill_res.strengths,
        "missing_skills": career_res.missing_skills,
        "improvement_skills": skill_res.weaknesses,
        "skill_analysis": _dump(skill_res),
        "career_match": _dump(career_res),
        "roadmap": _dump(path_res),
        "agent_insights": career_res.insights,
        "next_recommendation": f"Focus on {career_res.missing_skills[0]}" if career_res.missing_skills else "Continue advancing current skills",
        "agent_execution_statuses": agent_statuses,
    }
