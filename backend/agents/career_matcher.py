import logging
from typing import List, Dict, Any, Tuple

from backend.models import LearnerProfile, CareerMatcherResult
from backend.services.gemini_client import _call_gemini

# Standard skills taxonomy for known career targets
CAREER_REQUIREMENTS: Dict[str, Dict[str, int]] = {
    "Full Stack Developer": {
        "JavaScript": 3,
        "React": 3,
        "Node.js": 2,
        "HTML/CSS": 3,
        "SQL": 2,
        "Git": 2,
    },
    "Frontend Developer": {
        "HTML/CSS": 3,
        "JavaScript": 3,
        "React": 3,
        "TypeScript": 2,
        "Git": 2,
    },
    "Backend Developer": {
        "Python": 3,
        "Node.js": 2,
        "SQL": 3,
        "API Design": 2,
        "Docker": 2,
    },
    "Data Scientist": {
        "Python": 3,
        "SQL": 2,
        "Machine Learning": 3,
        "Statistics": 2,
        "Data Visualization": 2,
    },
    "DevOps Engineer": {
        "Linux": 3,
        "Docker": 3,
        "Kubernetes": 2,
        "CI/CD": 3,
        "Cloud (AWS/GCP)": 2,
    },
}

DEFAULT_REQUIREMENTS: Dict[str, int] = {
    "Python": 2,
    "JavaScript": 2,
    "Problem Solving": 2,
    "Git": 1,
}


def calculate_readiness_score(
    required_skills: Dict[str, int],
    learner_proficiency: Dict[str, int],
) -> Tuple[int, List[str]]:
    """
    Transparent Weighted Career Readiness Calculation:
    
    Formula:
        Readiness Score (%) = (Sum of earned weighted points / Sum of maximum required points) * 100
        
    Proficiency Weight Mapping:
        - Missing skill / Level 0: 0 points
        - Beginner / Level 1: 1 point
        - Intermediate / Level 2: 2 points
        - Advanced / Level 3: 3 points
        
    Each skill's earned points = min(learner_level, required_level)
    Each skill's maximum points = required_level
    
    Returns:
        (readiness_score_pct, missing_or_gap_skills)
    """
    if not required_skills:
        return 0, []

    total_earned = 0
    total_max = 0
    missing_skills = []

    for skill, req_level in required_skills.items():
        # Case-insensitive lookup in learner proficiency
        learner_level = 0
        for l_skill, l_level in learner_proficiency.items():
            if l_skill.strip().lower() == skill.strip().lower():
                learner_level = min(3, max(0, l_level))
                break

        total_max += req_level
        total_earned += min(learner_level, req_level)

        if learner_level < req_level:
            missing_skills.append(skill)

    readiness_score = int(round((total_earned / total_max) * 100)) if total_max > 0 else 0
    return min(100, max(0, readiness_score)), missing_skills


SYSTEM_INSTRUCTION = """
You are a Career Matcher AI. Given a learner profile and target career:
1. Identify the required skills and required proficiency (1=Beginner, 2=Intermediate, 3=Advanced).
2. Compare them against learner skills.
3. List 2-3 specific actionable insights.
Return a valid JSON object matching:
{
  "required_skills": [{"skill": "Python", "required_level": 3}],
  "insights": ["Insight 1", "Insight 2"]
}
Only return valid JSON without extra text.
"""


def match_career(profile: LearnerProfile) -> CareerMatcherResult:
    """Matches learner to career goal and calculates transparent readiness score."""
    career = profile.careerGoal or "Full Stack Developer"
    
    # Base requirements from taxonomy
    base_req = CAREER_REQUIREMENTS.get(career, DEFAULT_REQUIREMENTS)

    # Prompt Gemini for dynamic insights & potential domain-specific required skills
    prompt = (
        f"Learner Target Career: {career}\n"
        f"Learner Current Skills: {profile.skills}\n"
        f"Learner Proficiency: {profile.proficiency}\n"
        f"Analyze required career skills and generate career insights."
    )

    req_skills_dict = dict(base_req)
    insights = []
    is_fallback = False

    try:
        result_dict = _call_gemini(prompt, SYSTEM_INSTRUCTION)
        raw_reqs = result_dict.get("required_skills", [])
        if raw_reqs and isinstance(raw_reqs, list):
            for item in raw_reqs:
                if isinstance(item, dict) and "skill" in item:
                    s_name = str(item["skill"])
                    s_lvl = int(item.get("required_level", 2))
                    req_skills_dict[s_name] = min(3, max(1, s_lvl))
        insights = result_dict.get("insights", [])
    except Exception as e:
        logging.info(f"Career Matcher using deterministic fallback: {e}")
        is_fallback = True
        insights = [
            f"Readiness calculated based on standard industry requirements for {career}.",
            "Prioritize closing gaps in high-weight required skills first.",
        ]

    # Calculate transparent, deterministic readiness score
    readiness, missing = calculate_readiness_score(req_skills_dict, profile.proficiency)

    required_skills_list = [
        {"skill": s, "required_level": l} for s, l in req_skills_dict.items()
    ]

    return CareerMatcherResult(
        required_skills=required_skills_list,
        missing_skills=missing,
        readiness_score=readiness,
        insights=insights,
        fallback=is_fallback,
    )
