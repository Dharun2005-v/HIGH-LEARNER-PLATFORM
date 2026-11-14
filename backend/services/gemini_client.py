import os
import json
import logging
from typing import Dict, Any

def _call_gemini(prompt: str, system_instruction: str) -> Dict[str, Any]:
    """Call Gemini with a given prompt and system instruction.
    Reads API key fresh from environment each call so .env changes are picked up.
    Returns the parsed JSON response or raises an exception (triggering deterministic fallback).
    """
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash").strip()

    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not set — using fallback mode")

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)

        model = genai.GenerativeModel(
            model_name,
            system_instruction=system_instruction,
        )

        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.2,
                max_output_tokens=2048,
            ),
            request_options={"timeout": 5.0},
        )

        if response.candidates and response.candidates[0].content.parts:
            json_text = response.text
            return json.loads(json_text)
        else:
            raise ValueError("Empty response from Gemini")

    except Exception as e:
        logging.error(f"Gemini call failed (falling back): {e}")
        raise
