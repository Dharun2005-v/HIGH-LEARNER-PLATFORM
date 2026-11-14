from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Any, Optional

class LearnerProfile(BaseModel):
    fullName: str
    education: str
    skills: List[str]
    proficiency: Dict[str, int] = Field(default_factory=dict)  # skill -> level 0-3
    certifications: List[str] = []
    projects: List[str] = []
    careerGoal: str
    availability: str

    @field_validator('proficiency')
    @classmethod
    def level_range(cls, v):
        for skill, lvl in v.items():
            if lvl < 0 or lvl > 3:
                raise ValueError(f'proficiency level for {skill} must be 0-3')
        return v

class SkillAnalysisResult(BaseModel):
    strengths: List[str] = []
    weaknesses: List[str] = []
    certifications: List[Dict[str, Any]] = []
    projects: List[Dict[str, Any]] = []
    overall_skill_score: int = Field(0, ge=0, le=100)
    fallback: Optional[bool] = False

class CareerMatcherResult(BaseModel):
    required_skills: List[Dict[str, Any]] = []
    missing_skills: List[str] = []
    readiness_score: int = Field(0, ge=0, le=100)
    insights: List[str] = []
    fallback: Optional[bool] = False

class LearningModule(BaseModel):
    title: str
    description: str
    duration_weeks: int
    difficulty: str
    resources: List[str]
    exercise: str

class LearningPathResult(BaseModel):
    modules: List[LearningModule] = []
    total_duration_weeks: int = 0
    fallback: Optional[bool] = False

class MentorResponse(BaseModel):
    message: str
    next_action: str
    fallback: Optional[bool] = False

class AssessmentResult(BaseModel):
    performance_analysis: str
    revision_recommendations: List[str] = []
    updated_learning_priority: List[str] = []
    fallback: Optional[bool] = False

class UpdateGoalResult(BaseModel):
    updated_requirements: List[Dict[str, Any]] = []
    updated_gaps: List[str] = []
    new_roadmap: Optional[LearningPathResult] = None
    fallback: Optional[bool] = False
