from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    username: Optional[str] = None


class UserCreate(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    name: Optional[str] = None


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class User(UserBase):
    """User schema for responses."""
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    """Response schema for user operations."""
    user: User
    token: str
