import unittest
from backend.models import LearnerProfile
from backend.agents.career_matcher import calculate_readiness_score, match_career
from backend.agents.skill_analyst import analyze_skill
from backend.services.orchestrator import orchestrate_analysis


class TestBackendAgents(unittest.TestCase):
    def setUp(self):
        self.sample_profile = {
            "fullName": "Alex Developer",
            "education": "B.S. Computer Science",
            "skills": ["JavaScript", "HTML/CSS", "Python"],
            "proficiency": {
                "JavaScript": 3,
                "HTML/CSS": 3,
                "Python": 2,
            },
            "certifications": ["AWS Cloud Practitioner"],
            "projects": ["Personal Portfolio Web App"],
            "careerGoal": "Full Stack Developer",
            "availability": "15 hrs/week",
        }

    def test_readiness_calculation(self):
        """Test the transparent weighted readiness calculation formula."""
        reqs = {"JavaScript": 3, "React": 3, "Node.js": 2}
        # Max points: 3 + 3 + 2 = 8
        
        # User has: JavaScript=3, React=0 (missing), Node.js=1
        # Earned points: 3 + 0 + 1 = 4
        # Expected score: (4 / 8) * 100 = 50%
        user_prof = {"JavaScript": 3, "Node.js": 1}
        score, gaps = calculate_readiness_score(reqs, user_prof)
        
        self.assertEqual(score, 50)
        self.assertIn("React", gaps)
        self.assertIn("Node.js", gaps)
        self.assertNotIn("JavaScript", gaps)

    def test_full_readiness_score(self):
        """Test 100% readiness when all required skills meet required levels."""
        reqs = {"Python": 3, "SQL": 2}
        user_prof = {"Python": 3, "SQL": 2}
        score, gaps = calculate_readiness_score(reqs, user_prof)
        self.assertEqual(score, 100)
        self.assertEqual(len(gaps), 0)

    def test_zero_readiness_score(self):
        """Test 0% readiness when no required skills are present."""
        reqs = {"Rust": 3, "Go": 3}
        user_prof = {"Python": 2}
        score, gaps = calculate_readiness_score(reqs, user_prof)
        self.assertEqual(score, 0)
        self.assertEqual(len(gaps), 2)

    def test_skill_gap_detection(self):
        """Test career matcher identifies missing skills."""
        profile = LearnerProfile(**self.sample_profile)
        res = match_career(profile)
        self.assertTrue(hasattr(res, "missing_skills"))
        self.assertTrue(len(res.required_skills) > 0)

    def test_skill_analyst_fallback(self):
        """Test skill analyst analyzes strengths and weaknesses."""
        profile = LearnerProfile(**self.sample_profile)
        res = analyze_skill(profile)
        self.assertIn("JavaScript", res.strengths)
        self.assertTrue(res.overall_skill_score >= 0)

    def test_orchestrator_pipeline(self):
        """Test the multi-agent orchestrator combines results properly."""
        result = orchestrate_analysis(self.sample_profile)
        self.assertIn("career_readiness_score", result)
        self.assertIn("strengths", result)
        self.assertIn("missing_skills", result)
        self.assertIn("roadmap", result)
        self.assertIn("agent_execution_statuses", result)
        self.assertTrue(0 <= result["career_readiness_score"] <= 100)


if __name__ == "__main__":
    unittest.main()
