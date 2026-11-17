"""Comprehensive pytest suite for EcoCraft AI backend."""
import io
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app
from app.database.init_db import init_database
from app.ai.material_mapping import map_prediction_to_material
from app.ai.classifier import classify_waste_image

client = TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Ensure database is seeded before running tests."""
    init_database()


def test_root_and_health():
    """Verify application root and health endpoints."""
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["app"] == "Eco World"

    res_health = client.get("/api/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "healthy"


def test_material_mapping_and_safety():
    """Verify ImageNet label mapping and hard safety filter for hazardous waste."""
    # Safe plastic bottle
    bottle_info = map_prediction_to_material("water bottle")
    assert bottle_info["material"] == "plastic"
    assert bottle_info["is_safe"] is True

    # Safe cardboard
    carton_info = map_prediction_to_material("carton")
    assert carton_info["material"] == "cardboard"
    assert carton_info["is_safe"] is True

    # Hazardous waste must be blocked
    hazard_info = map_prediction_to_material("syringe needle")
    assert hazard_info["material"] == "hazardous"
    assert hazard_info["is_safe"] is False
    assert "NOT safe" in hazard_info["safety_notice"]


def test_list_and_filter_crafts():
    """Verify craft catalog retrieval and filtering."""
    # List all
    res = client.get("/api/crafts")
    assert res.status_code == 200
    crafts = res.json()
    assert len(crafts) >= 30, f"Expected at least 30 crafts, found {len(crafts)}"

    # Filter by plastic
    res_plastic = client.get("/api/crafts?material=plastic")
    assert res_plastic.status_code == 200
    plastic_crafts = res_plastic.json()
    assert len(plastic_crafts) > 0
    assert all(c["primary_material"] == "plastic" for c in plastic_crafts)

    # Filter by age 6
    res_age = client.get("/api/crafts?age=6")
    assert res_age.status_code == 200
    assert len(res_age.json()) > 0


def test_craft_details_and_steps():
    """Verify single craft details and step sequence."""
    res_list = client.get("/api/crafts")
    first_craft_id = res_list.json()[0]["id"]

    res = client.get(f"/api/crafts/{first_craft_id}")
    assert res.status_code == 200
    craft_data = res.json()
    assert craft_data["id"] == first_craft_id
    assert len(craft_data["steps"]) >= 3
    assert craft_data["steps"][0]["step_number"] == 1


def test_recommendation_engine():
    """Verify recommendation scoring and ranking."""
    req_body = {
        "detected_object": "Plastic Bottle",
        "material": "plastic",
        "child_age": 7,
        "interests": ["Gardening", "Toys"],
        "difficulty": "Easy"
    }
    res = client.post("/api/recommendations", json=req_body)
    assert res.status_code == 200
    data = res.json()
    assert data["total_matches"] > 0
    assert len(data["recommended_crafts"]) > 0
    # Top recommended craft should have high compatibility score
    top_craft = data["recommended_crafts"][0]
    assert top_craft["score"] > 0.6
    assert len(top_craft["match_reasons"]) > 0


def test_smart_waste_scanner_upload():
    """Verify image scanning with generated test image."""
    # Create synthetic test image in memory
    img = Image.new("RGB", (200, 400), color=(100, 200, 255))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    files = {"file": ("test_bottle.jpg", buf, "image/jpeg")}
    res = client.post("/api/scan", files=files, data={"child_age": 8})
    assert res.status_code == 200
    scan_result = res.json()
    assert "detected_object" in scan_result
    assert "estimated_material" in scan_result
    assert scan_result["confidence"] > 0
    assert len(scan_result["recommended_crafts"]) > 0


def test_child_profiles_and_progress():
    """Verify child profile CRUD and craft completion flow."""
    # Create child
    new_child = {
        "nickname": "TestCrafter",
        "age_group": "5-7",
        "avatar": "turtle",
        "interests": ["Animals", "Art"]
    }
    res_create = client.post("/api/children", json=new_child)
    assert res_create.status_code == 200
    child_id = res_create.json()["id"]

    # Get child progress
    res_prog = client.get(f"/api/progress/{child_id}")
    assert res_prog.status_code == 200
    prog_data = res_prog.json()
    assert prog_data["nickname"] == "TestCrafter"

    # Complete a craft
    res_crafts = client.get("/api/crafts")
    test_craft_id = res_crafts.json()[0]["id"]

    res_comp = client.post("/api/progress/complete", json={
        "child_id": child_id,
        "craft_id": test_craft_id
    })
    assert res_comp.status_code == 200
    assert res_comp.json()["points_earned"] > 0

    # Verify updated points
    res_updated_prog = client.get(f"/api/progress/{child_id}")
    assert res_updated_prog.json()["eco_points"] >= res_comp.json()["points_earned"]


def test_eco_learning_and_quiz():
    """Verify eco lessons list and quiz submission."""
    res_lessons = client.get("/api/lessons")
    assert res_lessons.status_code == 200
    lessons = res_lessons.json()
    assert len(lessons) >= 4

    first_lesson_id = lessons[0]["id"]
    res_detail = client.get(f"/api/lessons/{first_lesson_id}")
    assert res_detail.status_code == 200
    assert len(res_detail.json()["sections"]) > 0

    # Submit quiz answers
    res_child = client.get("/api/children")
    test_child_id = res_child.json()[0]["id"]

    quiz_submission = {
        "child_id": test_child_id,
        "lesson_id": first_lesson_id,
        "answers": [1, 1, 2]  # answers for lesson 1
    }
    res_submit = client.post("/api/quizzes/submit", json=quiz_submission)
    assert res_submit.status_code == 200
    quiz_result = res_submit.json()
    assert quiz_result["score"] == 3
    assert quiz_result["perfect_score"] is True
    assert quiz_result["points_awarded"] > 0
