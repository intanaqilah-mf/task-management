from pydantic import BaseModel, Field
from typing import Optional


class SubTaskBase(BaseModel):
    """Base SubTask schema."""
    title: str
    completed: bool = False


class SubTaskCreate(SubTaskBase):
    """Schema for creating a subtask."""
    pass


class SubTask(SubTaskBase):
    """SubTask schema for responses."""
    id: int
    task_id: int = Field(..., alias="taskId")

    class Config:
        from_attributes = True
        populate_by_name = True
