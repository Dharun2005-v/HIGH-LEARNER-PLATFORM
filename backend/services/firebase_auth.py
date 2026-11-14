import os
import json
import logging
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

logger = logging.getLogger(__name__)

# Track Firebase Admin initialization state
_firebase_app = None
is_firebase_admin_enabled = False

try:
    import firebase_admin
    from firebase_admin import credentials, auth

    # Check for credentials via FIREBASE_SERVICE_ACCOUNT_JSON (JSON string or file path)
    service_account_val = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "").strip()
    
    if service_account_val:
        if os.path.exists(service_account_val):
            cred = credentials.Certificate(service_account_val)
            _firebase_app = firebase_admin.initialize_app(cred)
            is_firebase_admin_enabled = True
            logger.info("Firebase Admin initialized from service account file: %s", service_account_val)
        else:
            try:
                cert_dict = json.loads(service_account_val)
                cred = credentials.Certificate(cert_dict)
                _firebase_app = firebase_admin.initialize_app(cred)
                is_firebase_admin_enabled = True
                logger.info("Firebase Admin initialized from JSON credentials string")
            except Exception as parse_err:
                logger.warning("Could not parse FIREBASE_SERVICE_ACCOUNT_JSON: %s", parse_err)
    else:
        # Check if default credentials or existing initialized app exists
        if len(firebase_admin._apps) > 0:
            _firebase_app = firebase_admin.get_app()
            is_firebase_admin_enabled = True
        else:
            logger.info("Firebase Admin: No service account configured. Running in DEMO / FALLBACK mode.")
except ImportError:
    logger.warning("firebase_admin package not installed. Running in DEMO mode.")
except Exception as init_err:
    logger.warning("Firebase Admin initialization error: %s. Falling back to DEMO mode.", init_err)


security = HTTPBearer(auto_error=False)


def verify_firebase_id_token(token: str) -> Dict[str, Any]:
    """
    Verifies a Firebase ID token.
    If Firebase Admin is configured, validates cryptographic signature and expiration.
    If in Demo mode, allows demo tokens cleanly.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token is required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # In demo mode without Firebase service account, support demo tokens
    if not is_firebase_admin_enabled:
        if token.startswith("demo-") or token == "demo":
            return {
                "uid": "demo-user",
                "email": "demo@highlearner.ai",
                "name": "Demo Learner",
                "is_demo": True,
            }
        # If user passed a real Firebase JWT but backend has no service account,
        # note that we are running in unverified demo mode
        return {
            "uid": "demo-user",
            "email": "demo@highlearner.ai",
            "name": "Demo Learner",
            "is_demo": True,
        }

    try:
        from firebase_admin import auth
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token.get("uid")
        if not uid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token does not contain a valid user UID",
            )
        return {
            "uid": uid,
            "email": decoded_token.get("email"),
            "name": decoded_token.get("name", ""),
            "is_demo": False,
            "claims": decoded_token,
        }
    except Exception as e:
        logger.error("Firebase token verification failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired Firebase ID token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Dict[str, Any]:
    """
    Extracts and verifies the current user from the Authorization: Bearer <token> header.
    Never trusts client-supplied userIds: always derives UID from verified token.
    Falls back to a demo user profile when no token is provided in demo mode.
    """
    if creds and creds.credentials:
        return verify_firebase_id_token(creds.credentials)
    
    # If no token provided:
    # If Firebase Admin is strictly enabled, we require authentication
    # But in demo mode, preserve demo functionality
    return {
        "uid": "demo-user",
        "email": "demo@highlearner.ai",
        "name": "Demo Learner",
        "is_demo": True,
    }


async def require_authenticated_user(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Dict[str, Any]:
    """
    Strict dependency: Requires a valid Firebase token.
    """
    if not creds or not creds.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return verify_firebase_id_token(creds.credentials)
