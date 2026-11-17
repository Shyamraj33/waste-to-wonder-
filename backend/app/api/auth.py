"""Authentication API router for EcoCraft AI."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import User, ChildProfile
from app.schemas import UserRegister, UserLogin, UserResponse, Token
from app.security import hash_password, verify_password, create_access_token, require_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """Register a new parent or teacher account."""
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name or "Parent User",
        role=user_in.role or "parent",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Automatically create a default child profile for the parent
    default_child = ChildProfile(
        parent_id=user.id,
        nickname="EcoExplorer",
        age_group="8-10",
        avatar="fox",
        interests="[\"Art\", \"Animals\"]",
        eco_points=10,
    )
    db.add(default_child)
    db.commit()

    access_token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return Token(access_token=access_token, token_type="bearer", user=UserResponse.model_validate(user))


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Log into an existing account."""
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return Token(access_token=access_token, token_type="bearer", user=UserResponse.model_validate(user))


@router.post("/logout")
def logout():
    """Client-side token disposal."""
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(require_current_user)):
    """Return current authenticated user."""
    return UserResponse.model_validate(current_user)
