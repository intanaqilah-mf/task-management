from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from app.schemas.subtask import SubTask, SubTaskCreate


class TaskBase(BaseModel):
    """Base task schema."""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[str] = "TODO"
    priority: Optional[str] = "MEDIUM"
    category: Optional[str] = None
    due_date: Optional[datetime] = Field(None, alias="dueDate")
    start_time: Optional[str] = Field(None, alias="startTime")
    end_time: Optional[str] = Field(None, alias="endTime")

    class Config:
        populate_by_name = True


class TaskCreate(TaskBase):
    """Schema for creating a task."""
    subtasks: Optional[List[SubTaskCreate]] = []


class TaskUpdate(BaseModel):
    """Schema for updating a task."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    due_date: Optional[datetime] = Field(None, alias="dueDate")
    start_time: Optional[str] = Field(None, alias="startTime")
    end_time: Optional[str] = Field(None, alias="endTime")
    subtasks: Optional[List[SubTaskCreate]] = None

    class Config:
        populate_by_name = True


class Task(BaseModel):
    """Task schema for responses."""
    id: int
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    category: Optional[str] = None
    due_date: Optional[datetime] = Field(None, alias="dueDate")
    start_time: Optional[str] = Field(None, alias="startTime")
    end_time: Optional[str] = Field(None, alias="endTime")
    user_id: int = Field(..., alias="userId")
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")
    subtasks: List[SubTask] = []

    class Config:
        from_attributes = True
        populate_by_name = True


class TaskResponse(BaseModel):
    """Response schema for single task."""
    id: int
    title: str
    description: Optional[str]
    status: str
    priority: str
    category: Optional[str]
    due_date: Optional[str] = Field(None, alias="dueDate")
    start_time: Optional[str] = Field(None, alias="startTime")
    end_time: Optional[str] = Field(None, alias="endTime")
    user_id: int = Field(..., alias="userId")
    created_at: str = Field(..., alias="createdAt")
    updated_at: str = Field(..., alias="updatedAt")

    class Config:
        populate_by_name = True
        by_alias = True
