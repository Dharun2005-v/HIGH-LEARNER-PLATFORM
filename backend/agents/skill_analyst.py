import logging

from backend.models import LearnerProfile, SkillAnalysisResult
from backend.services.gemini_client import _call_gemini

SYSTEM_INSTRUCTION = """
You are a Skill Analyst AI. Analyze the learner's profile, certifications, and skills.
Return a valid JSON object matching:
{
  "strengths": ["list of skills with proficiency >= 3"],
  "weaknesses": ["list of skills with proficiency <= 1"],
  "certifications": [{"name": "Cert Name", "relevance": 0.9}],
  "projects": [{"name": "Project Name", "relevance": 0.85}],
  "overall_skill_score": 75
}
All numeric scores must be between 0 and 100. Return valid JSON only without markdown or commentary.
"""


def analyze_skill(profile: LearnerProfile) -> SkillAnalysisResult:
    profile_str = profile.model_dump_json() if hasattr(profile, "model_dump_json") else profile.json()
    prompt = f"Analyze the following learner profile and produce JSON output.\nProfile: {profile_str}"
    try:
        result_dict = _call_gemini(prompt, SYSTEM_INSTRUCTION)
        return SkillAnalysisResult(**result_dict)
    except Exception as e:
        logging.info(f"Skill Analyst using deterministic fallback: {e}")
        skill_levels = profile.proficiency or {}
        strengths = [s for s, lvl in skill_levels.items() if lvl >= 3]
        weaknesses = [s for s, lvl in skill_levels.items() if lvl <= 1]
        overall = int(len(strengths) / max(1, len(profile.skills)) * 100) if profile.skills else 50
        
        certs = [{"name": c, "relevance": 0.85} for c in (profile.certifications or [])]
        projs = [{"name": p, "relevance": 0.80} for p in (profile.projects or [])]
        
        return SkillAnalysisResult(
            strengths=strengths,
            weaknesses=weaknesses,
            certifications=certs,
            projects=projs,
            overall_skill_score=overall,
            fallback=True,
        )
