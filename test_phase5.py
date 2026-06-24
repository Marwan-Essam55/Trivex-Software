import sys
from fastapi.testclient import TestClient
from main import app
from core.config import settings
from unittest.mock import patch
import logging
from database.session import SessionLocal
from models.user import User

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

client = TestClient(app)

def db_cleanup():
    db = SessionLocal()
    try:
        db.query(User).filter(User.email.in_(["standarduser@example.com", "testuser@example.com", "unknown@example.com"])).delete(synchronize_session=False)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.warning(f"Database cleanup warning: {e}")
    finally:
        db.close()

def run_tests():
    logger.info("0. Cleaning up database before tests...")
    db_cleanup()

    logger.info("1. Logging in as admin...")
    response = client.post(
        "/auth/login",
        data={"username": settings.ADMIN_EMAIL, "password": settings.ADMIN_PASSWORD}
    )
    assert response.status_code == 200, f"Failed to login as admin: {response.json()}"
    admin_token = response.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    logger.info("-> Admin login successful")

    logger.info("2. Creating a new user via admin route...")
    new_user_data = {
        "first_name": "Test",
        "last_name": "User",
        "email": "testuser@example.com",
        "password": "SecurePassword123",
        "company_name": "TestCompany"
    }
    response = client.post(
        "/admin/users/",
        json=new_user_data,
        headers=admin_headers
    )
    if response.status_code == 400 and response.json().get("detail") == "Email already registered":
        logger.info("User already exists, attempting to fetch and delete...")
        users_resp = client.get("/admin/users/", headers=admin_headers)
        for u in users_resp.json():
            if u["email"] == "testuser@example.com":
                client.delete(f"/admin/users/{u['id']}", headers=admin_headers)
        response = client.post("/admin/users/", json=new_user_data, headers=admin_headers)
        
    assert response.status_code == 201, f"Failed to create user: {response.json()}"
    user_id = response.json()["id"]
    logger.info(f"-> User created successfully: {user_id}")

    logger.info("3. Logging in as the new user...")
    response = client.post(
        "/auth/login",
        data={"username": "testuser@example.com", "password": "SecurePassword123"}
    )
    assert response.status_code == 200, f"Failed to login as new user: {response.json()}"
    user_token = response.json()["access_token"]
    user_headers = {"Authorization": f"Bearer {user_token}"}
    logger.info("-> User login successful")

    logger.info("3b. Creating a standard user via company admin...")
    standard_user_data = {
        "first_name": "Standard",
        "last_name": "User",
        "email": "standarduser@example.com",
        "password": "SecurePassword123"
    }
    response = client.post(
        "/admin/users/",
        json=standard_user_data,
        headers=user_headers
    )
    assert response.status_code == 201, f"Failed to create standard user: {response.json()}"
    standard_user_id = response.json()["id"]
    logger.info(f"-> Standard user created successfully: {standard_user_id}")

    logger.info("3c. Logging in as standard user...")
    response = client.post(
        "/auth/login",
        data={"username": "standarduser@example.com", "password": "SecurePassword123"}
    )
    assert response.status_code == 200, f"Failed to login as standard user: {response.json()}"
    standard_token = response.json()["access_token"]
    standard_headers = {"Authorization": f"Bearer {standard_token}"}
    logger.info("-> Standard user login successful")

    logger.info("4. Hitting admin route as standard user...")
    response = client.get("/admin/users/", headers=standard_headers)
    assert response.status_code == 403, f"Expected 403, got {response.status_code}"
    logger.info("-> Properly blocked with 403")

    logger.info("5. Testing Google login with known email...")
    with patch("services.auth_service.id_token.verify_oauth2_token") as mock_verify:
        mock_verify.return_value = {
            "email": "testuser@example.com",
            "sub": "google-id-12345"
        }
        response = client.post(
            "/auth/google",
            json={"token": "dummy-token-for-mock"}
        )
        assert response.status_code == 200, f"Google login failed: {response.json()}"
        logger.info("-> Google login with known email successful")

    logger.info("6. Testing Google login with unknown email...")
    with patch("services.auth_service.id_token.verify_oauth2_token") as mock_verify:
        mock_verify.return_value = {
            "email": "unknown@example.com",
            "sub": "google-id-unknown",
            "given_name": "Unknown",
            "family_name": "GoogleUser",
            "picture": "http://example.com/picture.jpg"
        }
        response = client.post(
            "/auth/google",
            json={"token": "dummy-token-for-mock"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        logger.info("-> Google login with unknown email successfully blocked with 403")
        
        # Verify the user was NOT created
        users_resp = client.get("/admin/users/", headers=admin_headers)
        for u in users_resp.json():
            assert u["email"] != "unknown@example.com", "Unknown user was created in the database!"
        logger.info("-> Confirmed unknown Google user was not created in the database")

    logger.info("7. Deactivating user and testing login...")
    response = client.post(f"/admin/users/{user_id}/toggle-status", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["is_active"] is False

    response = client.post(
        "/auth/login",
        data={"username": "testuser@example.com", "password": "SecurePassword123"}
    )
    assert response.status_code == 403, f"Expected 403, got {response.status_code}"
    assert "inactive" in response.json()["detail"].lower()
    logger.info("-> Deactivated user login blocked correctly (403)")
    
    logger.info("8. Testing input validation for short password...")
    response = client.post(
        "/admin/users/",
        json={
            "first_name": "Test",
            "last_name": "User",
            "email": "shortpass@example.com",
            "password": "short",
            "company_name": "TestCompany"
        },
        headers=admin_headers
    )
    assert response.status_code == 422, f"Expected 422 for validation error, got {response.status_code}"
    logger.info("-> Input validation working properly (422)")


    logger.info("9. Cleaning up...")
    client.delete(f"/admin/users/{standard_user_id}", headers=admin_headers)
    client.delete(f"/admin/users/{user_id}", headers=admin_headers)
    logger.info("-> Cleanup complete. All tests passed successfully!")

if __name__ == "__main__":
    run_tests()
