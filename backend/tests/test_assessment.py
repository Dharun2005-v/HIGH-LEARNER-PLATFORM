import unittest
from backend.models import LearnerProfile
from backend.agents.assessment import (
    grade_assessment,
    apply_adaptive_learning_rules,
    get_public_questions,
    evaluate_submission,
    JS_FUNDAMENTALS_QUESTIONS
)
from backend.agents.progress_mentor import mentor


class TestAssessmentAndAdaptiveLearning(unittest.TestCase):
    def setUp(self):
        self.sample_profile = LearnerProfile(
            fullName="Alex Developer",
            education="B.S. Computer Science",
            skills=["JavaScript", "HTML/CSS", "Python"],
            proficiency={"JavaScript": 2, "HTML/CSS": 3, "Python": 1},
            certifications=["AWS Cloud Practitioner"],
            projects=["Personal Portfolio Web App"],
            careerGoal="Full Stack Developer",
            availability="15 hrs/week",
        )

    def test_public_questions_withhold_answers(self):
        """Verify that public questions do NOT contain correct answers or explanations."""
        public_q = get_public_questions("JavaScript Fundamentals")
        self.assertEqual(len(public_q), 5)
        for q in public_q:
            self.assertNotIn("correct_index", q)
            self.assertNotIn("correct_answer", q)
            self.assertNotIn("explanation", q)
            self.assertIn("id", q)
            self.assertIn("question", q)
            self.assertEqual(len(q["options"]), 4)

    def test_correct_scoring_100_percent(self):
        """Test 100% correct scoring against server answer key."""
        perfect_answers = {q["id"]: q["correct_index"] for q in JS_FUNDAMENTALS_QUESTIONS}
        result = grade_assessment(perfect_answers)
        self.assertEqual(result["score"], 100)
        self.assertEqual(result["correct_count"], 5)
        self.assertEqual(result["incorrect_count"], 0)
        self.assertEqual(len(result["weak_concepts"]), 0)

    def test_incorrect_scoring_0_percent(self):
        """Test 0% incorrect scoring against server answer key."""
        # Answer with wrong indexes
        wrong_answers = {q["id"]: (q["correct_index"] + 1) % 4 for q in JS_FUNDAMENTALS_QUESTIONS}
        result = grade_assessment(wrong_answers)
        self.assertEqual(result["score"], 0)
        self.assertEqual(result["correct_count"], 0)
        self.assertEqual(result["incorrect_count"], 5)
        self.assertEqual(len(result["weak_concepts"]), 5)

    def test_below_60_percent_behavior(self):
        """Test adaptive rules when score is below 60%."""
        # 1 correct out of 5 = 20%
        answers = {"q1": 1, "q2": 0, "q3": 0, "q4": 0, "q5": 0}
        grading = grade_assessment(answers)
        self.assertEqual(grading["score"], 20)
        
        rules = apply_adaptive_learning_rules(grading["score"], grading["weak_concepts"])
        self.assertEqual(rules["adaptive_tier"], "below_60")
        self.assertEqual(rules["adaptive_action"], "keep_on_current_skill")
        self.assertIn("Beginner Revision", rules["adaptive_tier_label"])
        self.assertTrue(len(rules["recommended_exercises"]) > 0)

    def test_between_60_and_80_behavior(self):
        """Test adaptive rules when score is between 60% and 80%."""
        # 3 correct out of 5 = 60%
        answers = {"q1": 1, "q2": 2, "q3": 1, "q4": 0, "q5": 0}
        grading = grade_assessment(answers)
        self.assertEqual(grading["score"], 60)

        rules = apply_adaptive_learning_rules(grading["score"], grading["weak_concepts"])
        self.assertEqual(rules["adaptive_tier"], "between_60_and_80")
        self.assertEqual(rules["adaptive_action"], "continue_with_reinforcement")
        self.assertIn("Intermediate Reinforcement", rules["adaptive_tier_label"])

        # 4 correct out of 5 = 80%
        answers_80 = {"q1": 1, "q2": 2, "q3": 1, "q4": 2, "q5": 0}
        grading_80 = grade_assessment(answers_80)
        self.assertEqual(grading_80["score"], 80)
        rules_80 = apply_adaptive_learning_rules(grading_80["score"], grading_80["weak_concepts"])
        self.assertEqual(rules_80["adaptive_tier"], "between_60_and_80")

    def test_above_80_percent_behavior(self):
        """Test adaptive rules when score is above 80%."""
        # 5 correct out of 5 = 100%
        perfect_answers = {q["id"]: q["correct_index"] for q in JS_FUNDAMENTALS_QUESTIONS}
        grading = grade_assessment(perfect_answers)
        self.assertEqual(grading["score"], 100)

        rules = apply_adaptive_learning_rules(grading["score"], grading["weak_concepts"])
        self.assertEqual(rules["adaptive_tier"], "above_80")
        self.assertEqual(rules["adaptive_action"], "advance_to_next_module")
        self.assertIn("Mastery Demonstrated", rules["adaptive_tier_label"])

    def test_empty_assessment_responses(self):
        """Test grading when no answers are submitted."""
        empty_answers = {}
        grading = grade_assessment(empty_answers)
        self.assertEqual(grading["score"], 0)
        self.assertEqual(grading["correct_count"], 0)
        self.assertEqual(grading["incorrect_count"], 5)
        self.assertEqual(len(grading["weak_concepts"]), 5)

        rules = apply_adaptive_learning_rules(grading["score"], grading["weak_concepts"])
        self.assertEqual(rules["adaptive_tier"], "below_60")

    def test_mentor_context_awareness(self):
        """Test mentor provides responses informed by assessment history and weak concepts."""
        history = [
            {
                "skill_name": "JavaScript Fundamentals",
                "score": 40,
                "weak_concepts": ["Basic DOM concepts", "Arrays"],
            }
        ]
        response = mentor(
            profile=self.sample_profile,
            user_message="Why am I weak in JavaScript?",
            assessment_history=history,
            current_weak_concepts=["Basic DOM concepts", "Arrays"],
        )
        self.assertTrue(len(response.message) > 0)
        self.assertTrue(len(response.next_action) > 0)
        # Should reference the weak concepts in deterministic mode
        self.assertIn("Basic DOM concepts", response.message)

    def test_mentor_next_recommendation(self):
        """Test mentor answers 'What should I learn next?' contextually."""
        response = mentor(
            profile=self.sample_profile,
            user_message="What should I learn next?",
            completed_modules=["JavaScript Fundamentals & DOM Mastery"],
        )
        self.assertTrue(len(response.message) > 0)
        self.assertIn("React", response.message)


if __name__ == "__main__":
    unittest.main()
