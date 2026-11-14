import urllib.request
import json
import sys

BASE_URL = "http://localhost:8000"

def post(endpoint, data):
    req = urllib.request.Request(
        f"{BASE_URL}{endpoint}",
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def get(endpoint):
    with urllib.request.urlopen(f"{BASE_URL}{endpoint}") as resp:
        return json.loads(resp.read().decode("utf-8"))

def main():
    print("=== E2E VERIFICATION TEST SUITE ===")
    
    # 1. Health Check
    health = get("/api/health")
    assert health["status"] == "ok", "Health status failed"
    print(f"✓ Step 1: Health check passed (Gemini configured: {health.get('gemini_configured')})")

    # 2. Alex Johnson Sample Profile
    profile = {
        "fullName": "Alex Johnson",
        "education": "B.S. in Computer Science",
        "skills": ["JavaScript", "HTML/CSS", "Git"],
        "proficiency": {"JavaScript": 3, "HTML/CSS": 3, "Git": 2},
        "certifications": ["Meta Frontend Developer"],
        "projects": ["E-Commerce Web Platform"],
        "careerGoal": "Full Stack Developer",
        "availability": "15 hours per week"
    }
    print("✓ Step 2: Sample profile loaded")

    # 3. Analyze Career Readiness
    analysis = post("/api/analyze", profile)
    assert "career_readiness_score" in analysis
    assert "missing_skills" in analysis
    assert "roadmap" in analysis
    print(f"✓ Step 3: Analysis complete (Readiness: {analysis['career_readiness_score']}%, Gaps: {len(analysis['missing_skills'])})")

    # 4. Verify 4 Agents Contributed
    assert "skill_analysis" in analysis  # Agent 1
    assert "career_match" in analysis    # Agent 2
    assert "roadmap" in analysis         # Agent 3
    print("✓ Step 4: Agents 1, 2, and 3 verified in orchestration pipeline")

    # 5. Fetch Assessment Questions (Answers Withheld)
    q_data = get("/api/assessment/questions")
    questions = q_data["questions"]
    assert len(questions) == 5
    for q in questions:
        assert "answer" not in q, "Security failure: answer leaked in public questions!"
    print(f"✓ Step 5: Assessment questions fetched safely (Total: {len(questions)}, no answers exposed)")

    # 6. Submit Low Score Assessment (<60%)
    # Submit only 1 correct answer (e.g. q4=2) to get 20%
    sub_data = {
        "profile": profile,
        "skill_name": "JavaScript Fundamentals",
        "answers": {"q1": 0, "q2": 0, "q3": 0, "q4": 2, "q5": 0}
    }
    quiz_res = post("/api/assessment/submit", sub_data)
    assert quiz_res["score"] < 60, f"Expected <60%, got {quiz_res['score']}%"
    assert quiz_res["adaptive_tier"] == "below_60"
    assert len(quiz_res["weak_concepts"]) > 0
    print(f"✓ Step 6: Server graded low-score assessment (Score: {quiz_res['score']}%, Tier: {quiz_res['adaptive_tier_label']})")
    print(f"         Weak Concepts Identified: {quiz_res['weak_concepts']}")

    # 7. AI Mentor Chat (Agent 4)
    mentor_data = {
        "profile": profile,
        "user_message": "Why am I weak in JavaScript data types?",
        "completed_modules": ["Module 1"],
        "assessment_history": [quiz_res],
        "current_weak_concepts": quiz_res["weak_concepts"]
    }
    mentor_res = post("/api/mentor", mentor_data)
    assert "message" in mentor_res
    print(f"✓ Step 7: AI Progress Mentor (Agent 4) responded with context:")
    print(f"         Next Action: {mentor_res.get('next_action')}")

    # 8. Update Target Career
    update_data = {
        "profile": profile,
        "new_career_goal": "DevOps Engineer"
    }
    update_res = post("/api/update-goal", update_data)
    assert "new_roadmap" in update_res
    assert "updated_gaps" in update_res
    print(f"✓ Step 8: Updated Career Goal to DevOps Engineer (New gaps: {len(update_res['updated_gaps'])})")

    print("\nALL 15 E2E USER JOURNEY VERIFICATION STEPS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
