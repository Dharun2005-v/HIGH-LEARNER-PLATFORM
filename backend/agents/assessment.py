import logging
from typing import List, Dict, Any, Optional
from backend.models import LearnerProfile, AssessmentResult
from backend.services.gemini_client import _call_gemini

# Private server-side Question Bank & Answer Key
# Correct answers and explanations are NEVER sent to the client before submission
JS_FUNDAMENTALS_QUESTIONS = [
    {
        "id": "q1",
        "topic": "JavaScript variables",
        "question": "What is the primary scoping difference between 'let' and 'var' in modern JavaScript?",
        "options": [
            "var is block-scoped while let is function-scoped.",
            "let is block-scoped, while var is function-scoped and hoisted with an initial value of undefined.",
            "let declarations cannot be reassigned under any circumstances, but var can.",
            "var is strictly prohibited in browser environments.",
        ],
        "correct_index": 1,
        "explanation": "'let' and 'const' are block-scoped (confined to {}) and exist in a Temporal Dead Zone until initialized, whereas 'var' is function-scoped and hoisted.",
    },
    {
        "id": "q2",
        "topic": "Data types",
        "question": "What is the return value of typeof null in JavaScript, and why?",
        "options": [
            "\"null\", because null is an independent primitive type.",
            "\"undefined\", because null denotes an unassigned value.",
            "\"object\", due to an intentional legacy quirk dating back to JavaScript's first implementation.",
            "\"boolean\", because null coerces to false in conditional checks.",
        ],
        "correct_index": 2,
        "explanation": "In early JS implementations, values were stored with a type tag. The object tag was 0, and null was represented as a NULL pointer (0x00), resulting in typeof null returning 'object'.",
    },
    {
        "id": "q3",
        "topic": "Functions",
        "question": "How do arrow functions handle the 'this' keyword compared to regular function declarations?",
        "options": [
            "Arrow functions automatically rebind 'this' to the global window/globalThis object.",
            "Arrow functions do not have their own 'this'; they inherit 'this' lexically from their enclosing execution context.",
            "Arrow functions require explicit .bind(this) syntax before they can be invoked.",
            "Arrow functions bind 'this' to the DOM element that triggered the call.",
        ],
        "correct_index": 1,
        "explanation": "Arrow functions do not create their own 'this' binding. They capture the 'this' value of the enclosing lexical scope at creation time.",
    },
    {
        "id": "q4",
        "topic": "Arrays",
        "question": "Which array method transforms every element in an array and returns a new array without mutating the original?",
        "options": [
            "forEach()",
            "splice()",
            "map()",
            "sort()",
        ],
        "correct_index": 2,
        "explanation": "Array.prototype.map() returns a brand-new array containing the results of calling the provided function on each element without mutating the source array.",
    },
    {
        "id": "q5",
        "topic": "Basic DOM concepts",
        "question": "Which DOM method is the modern standard to select the first element matching a CSS selector?",
        "options": [
            "document.getElementsByClassName()",
            "document.querySelector()",
            "document.selectElement()",
            "document.getElementByIdAll()",
        ],
        "correct_index": 1,
        "explanation": "document.querySelector() takes any valid CSS selector string and returns the first matching Element node, or null if no match is found.",
    },
]

# Curated practical adaptive exercises by concept
CONCEPT_EXERCISES = {
    "JavaScript variables": {
        "beginner": "Exercise: Refactor legacy code containing 'var' to 'const' and 'let', documenting variable scope boundaries.",
        "intermediate": "Exercise: Implement a function demonstrating block-scoping inside loops and explain the Temporal Dead Zone.",
        "advanced": "Challenge: Build a mini lexical environment visualizer explaining variable hoisting."
    },
    "Data types": {
        "beginner": "Exercise: Write a type-checker utility function distinguishing between null, arrays, objects, and primitives.",
        "intermediate": "Exercise: Implement a deep-clone function handling complex nested objects and primitive type immutability.",
        "advanced": "Challenge: Implement custom Symbol primitives and evaluate JS type coercion edge cases."
    },
    "Functions": {
        "beginner": "Exercise: Convert standard function declarations into arrow functions and verify parameter defaults.",
        "intermediate": "Exercise: Build a debounce and throttle utility utilizing function closures and lexical 'this'.",
        "advanced": "Challenge: Architect a functional currying pipeline with partial application and memoization."
    },
    "Arrays": {
        "beginner": "Exercise: Use .map(), .filter(), and .includes() to transform a list of student records without mutating arrays.",
        "intermediate": "Exercise: Use Array.prototype.reduce() to group, tally, and flatten a complex e-commerce cart array.",
        "advanced": "Challenge: Implement custom versions of .map, .filter, and .reduce on Array.prototype from scratch."
    },
    "Basic DOM concepts": {
        "beginner": "Exercise: Use querySelector and addEventListener to create an interactive click counter with dynamic styling.",
        "intermediate": "Exercise: Build a live searchable table that dynamically filters and renders DOM nodes on input events.",
        "advanced": "Challenge: Implement a lightweight virtual-DOM diffing algorithm that updates minimal DOM nodes."
    },
}


def get_public_questions(skill_name: str = "JavaScript Fundamentals") -> List[Dict[str, Any]]:
    """Returns questions sanitized of correct answers for safe client delivery."""
    public_q = []
    for q in JS_FUNDAMENTALS_QUESTIONS:
        public_q.append({
            "id": q["id"],
            "topic": q["topic"],
            "question": q["question"],
            "options": q["options"],
        })
    return public_q


def grade_assessment(user_answers: Dict[str, int]) -> Dict[str, Any]:
    """
    Validates user answers strictly against the server answer key.
    Calculates correct/incorrect tally, score percentage, and weak concepts.
    """
    total = len(JS_FUNDAMENTALS_QUESTIONS)
    correct_count = 0
    weak_concepts = []
    question_review = []

    for q in JS_FUNDAMENTALS_QUESTIONS:
        q_id = q["id"]
        correct_idx = q["correct_index"]
        user_idx = user_answers.get(q_id)

        is_correct = (user_idx is not None and int(user_idx) == correct_idx)
        if is_correct:
            correct_count += 1
        else:
            if q["topic"] not in weak_concepts:
                weak_concepts.append(q["topic"])

        question_review.append({
            "id": q["id"],
            "topic": q["topic"],
            "question": q["question"],
            "options": q["options"],
            "user_answer": user_idx,
            "correct_answer": correct_idx,
            "is_correct": is_correct,
            "explanation": q["explanation"],
        })

    score_pct = int(round((correct_count / total) * 100)) if total > 0 else 0

    return {
        "total_questions": total,
        "correct_count": correct_count,
        "incorrect_count": total - correct_count,
        "score": score_pct,
        "weak_concepts": weak_concepts,
        "question_review": question_review,
    }


def apply_adaptive_learning_rules(score: int, weak_concepts: List[str]) -> Dict[str, Any]:
    """
    Applies deterministic adaptive learning logic:
    - Below 60%: Beginner revision, extra exercises, keep on current skill, prioritize weak concepts
    - 60% - 80%: Intermediate exercises, continue current roadmap with reinforcement practice
    - Above 80%: Recommend next learning module, suggest practical challenge
    """
    if score < 60:
        tier = "below_60"
        tier_label = "Beginner Revision Required (<60%)"
        adaptive_action = "keep_on_current_skill"
        performance_summary = (
            f"Assessment score of {score}% indicates foundational gaps in core JavaScript. "
            "Adaptive logic recommends pausing roadmap advancement to reinforce beginner concepts first."
        )
        exercises = [
            CONCEPT_EXERCISES.get(concept, {}).get("beginner", f"Review beginner fundamentals for {concept}.")
            for concept in weak_concepts
        ]
        if not exercises:
            exercises = ["Complete interactive MDN JavaScript tutorials on variables, types, and functions."]
        next_step = "Review beginner fundamentals for identified weak concepts before attempting advanced topics."
        priority_skills = ["JavaScript Fundamentals"] + weak_concepts[:2]

    elif 60 <= score <= 80:
        tier = "between_60_and_80"
        tier_label = "Intermediate Reinforcement (60% - 80%)"
        adaptive_action = "continue_with_reinforcement"
        performance_summary = (
            f"Assessment score of {score}% demonstrates good foundational comprehension. "
            "Adaptive logic recommends proceeding along the roadmap while completing targeted intermediate practice exercises."
        )
        exercises = [
            CONCEPT_EXERCISES.get(concept, {}).get("intermediate", f"Practice intermediate coding challenges for {concept}.")
            for concept in weak_concepts
        ]
        if not exercises:
            exercises = ["Build a mini JavaScript application integrating Array methods and DOM event listeners."]
        next_step = "Continue with current roadmap modules while completing intermediate practice challenges."
        priority_skills = ["React Architecture"] + weak_concepts[:1]

    else: # score > 80
        tier = "above_80"
        tier_label = "Mastery Demonstrated (>80%)"
        adaptive_action = "advance_to_next_module"
        performance_summary = (
            f"Outstanding score of {score}%! You have demonstrated strong mastery of JavaScript Fundamentals. "
            "Adaptive logic clears you to advance directly to the next roadmap module."
        )
        exercises = [
            "Practical Challenge: Build a reactive client-side state store from scratch using ES6 Classes and Proxies.",
            "Advance to Module 2: React Architecture, Component Lifecycles & Custom Hooks."
        ]
        next_step = "Advance to Module 2 (React Architecture) and tackle practical full-stack projects."
        priority_skills = ["React Architecture & Custom Hooks", "Node.js REST APIs"]

    return {
        "adaptive_tier": tier,
        "adaptive_tier_label": tier_label,
        "adaptive_action": adaptive_action,
        "performance_summary": performance_summary,
        "recommended_exercises": exercises,
        "next_step": next_step,
        "priority_skills": priority_skills,
    }


SYSTEM_INSTRUCTION = """
You are an Assessment & Adaptive Learning AI. Analyze the learner profile, test score, weak concepts, and adaptive tier.
Generate a concise, encouraging performance analysis and 2-3 personalized revision tips.
Return valid JSON matching:
{
  "performance_analysis": "string summary",
  "revision_recommendations": ["Tip 1", "Tip 2"]
}
Only return valid JSON.
"""


def evaluate_submission(
    profile: LearnerProfile,
    skill_name: str,
    user_answers: Dict[str, int]
) -> Dict[str, Any]:
    """
    Main evaluation pipeline:
    1. Server grades the test against private answer key.
    2. Deterministic adaptive rules assign tier and exercises.
    3. Gemini enriches analysis with personalized context (or falls back cleanly).
    """
    grading = grade_assessment(user_answers)
    score = grading["score"]
    weak_concepts = grading["weak_concepts"]

    # Deterministic adaptive rules
    rules = apply_adaptive_learning_rules(score, weak_concepts)

    # Gemini contextual explanation
    analysis_text = rules["performance_summary"]
    revisions = rules["recommended_exercises"]
    is_fallback = False

    profile_str = profile.model_dump_json() if hasattr(profile, "model_dump_json") else profile.json()
    prompt = (
        f"Learner: {profile_str}\n"
        f"Skill: {skill_name}\n"
        f"Score: {score}%\n"
        f"Weak Concepts: {weak_concepts}\n"
        f"Adaptive Tier: {rules['adaptive_tier_label']}\n"
        f"Provide personalized feedback."
    )

    try:
        gemini_result = _call_gemini(prompt, SYSTEM_INSTRUCTION)
        if gemini_result.get("performance_analysis"):
            analysis_text = f"{rules['performance_summary']} {gemini_result['performance_analysis']}"
        if gemini_result.get("revision_recommendations"):
            revisions = gemini_result["revision_recommendations"] + rules["recommended_exercises"][:1]
    except Exception as e:
        logging.info(f"Assessment Gemini explanation fallback: {e}")
        is_fallback = True

    return {
        "skill_name": skill_name,
        "score": score,
        "total_questions": grading["total_questions"],
        "correct_count": grading["correct_count"],
        "incorrect_count": grading["incorrect_count"],
        "weak_concepts": weak_concepts,
        "adaptive_tier": rules["adaptive_tier"],
        "adaptive_tier_label": rules["adaptive_tier_label"],
        "adaptive_action": rules["adaptive_action"],
        "performance_analysis": analysis_text,
        "revision_recommendations": revisions,
        "recommended_exercises": rules["recommended_exercises"],
        "updated_learning_priority": rules["priority_skills"],
        "next_step": rules["next_step"],
        "question_review": grading["question_review"],
        "fallback": is_fallback,
    }


def evaluate_assessment(profile: LearnerProfile, skill_name: str, score: int, weak_concepts: List[str]) -> AssessmentResult:
    """Legacy manual assessment endpoint compatibility."""
    rules = apply_adaptive_learning_rules(score, weak_concepts)
    return AssessmentResult(
        performance_analysis=rules["performance_summary"],
        revision_recommendations=rules["recommended_exercises"],
        updated_learning_priority=rules["priority_skills"],
        fallback=True,
    )
