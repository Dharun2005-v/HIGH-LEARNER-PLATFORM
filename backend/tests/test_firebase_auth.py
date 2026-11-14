import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.firebase_auth import (
    verify_firebase_id_token,
    get_current_user,
    is_firebase_admin_enabled,
)


class TestFirebaseAuth(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_includes_firebase_status(self):
        """Verifies health check reports firebase_admin_configured."""
        resp = self.client.get("/api/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("firebase_admin_configured", data)

    def test_auth_status_demo_mode_when_no_token(self):
        """When no Authorization header is provided, falls back cleanly to Demo Mode."""
        resp = self.client.get("/api/auth/status")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["mode"], "demo")
        self.assertEqual(data["verified_uid"], "demo-user")

    def test_verify_id_token_demo_mode(self):
        """In Demo Mode, returns safe demo user claims."""
        with patch("backend.services.firebase_auth.is_firebase_admin_enabled", False):
            user = verify_firebase_id_token("demo-token-123")
            self.assertEqual(user["uid"], "demo-user")
            self.assertTrue(user["is_demo"])

    def test_verify_id_token_empty_fails(self):
        """Empty token should raise 401."""
        from fastapi import HTTPException
        with self.assertRaises(HTTPException) as ctx:
            verify_firebase_id_token("")
        self.assertEqual(ctx.exception.status_code, 401)

    @patch("backend.services.firebase_auth.is_firebase_admin_enabled", True)
    @patch("firebase_admin.auth.verify_id_token")
    def test_verified_token_derives_uid(self, mock_verify):
        """When Firebase Admin is enabled, UID must be derived from verified cryptographic token."""
        mock_verify.return_value = {
            "uid": "verified_firebase_uid_999",
            "email": "student@highlearner.ai",
            "name": "Jane Developer",
        }
        claims = verify_firebase_id_token("valid-jwt-token")
        self.assertEqual(claims["uid"], "verified_firebase_uid_999")
        self.assertEqual(claims["email"], "student@highlearner.ai")
        self.assertFalse(claims["is_demo"])

    @patch("backend.services.firebase_auth.is_firebase_admin_enabled", True)
    @patch("firebase_admin.auth.verify_id_token")
    def test_invalid_firebase_token_raises_401(self, mock_verify):
        """Invalid cryptographic signature or expired token raises 401."""
        mock_verify.side_effect = Exception("Firebase ID token has expired")
        from fastapi import HTTPException
        with self.assertRaises(HTTPException) as ctx:
            verify_firebase_id_token("expired-jwt")
        self.assertEqual(ctx.exception.status_code, 401)

    def test_analyze_attaches_verified_uid(self):
        """Verify POST /api/analyze attaches the verified UID derived from credentials."""
        payload = {
            "fullName": "Test Learner",
            "education": "CS",
            "skills": ["JavaScript"],
            "proficiency": {"JavaScript": 2},
            "certifications": [],
            "projects": [],
            "careerGoal": "Frontend Developer",
            "availability": "10 hours per week",
        }
        resp = self.client.post("/api/analyze", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("verified_uid", data)
        self.assertEqual(data["verified_uid"], "demo-user")


if __name__ == "__main__":
    unittest.main()
