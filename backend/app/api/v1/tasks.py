from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, Task as TaskSchema
from app.api.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=List[TaskSchema], response_model_by_alias=True)
def get_tasks(
    status_filter: Optional[List[str]] = Query(None, alias="status"),
    priority_filter: Optional[List[str]] = Query(None, alias="priority"),
    category_filter: Optional[List[str]] = Query(None, alias="category"),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all tasks for the current user with optional filtering.
    
    - **status**: Filter by task status (TODO, IN_PROGRESS, COMPLETED)
    - **priority**: Filter by priority (LOW, MEDIUM, HIGH, URGENT)
    - **category**: Filter by category
    - **search**: Search in title and description
    """
    query = db.query(Task).filter(Task.user_id == current_user.id)
    
    # Apply filters
    if status_filter:
        query = query.filter(Task.status.in_(status_filter))
    
    if priority_filter:
        query = query.filter(Task.priority.in_(priority_filter))
    
    if category_filter:
        query = query.filter(Task.category.in_(category_filter))
    
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Task.title.ilike(search_pattern)) | 
            (Task.description.ilike(search_pattern))
        )
    
    tasks = query.order_by(Task.created_at.desc()).all()
    return tasks


@router.post("/", response_model=TaskSchema, response_model_by_alias=True, status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new task.
    
    - **title**: Task title (required)
    - **description**: Task description (optional)
    - **status**: Task status (default: TODO)
    - **priority**: Task priority (default: MEDIUM)
    - **category**: Task category (optional)
    - **due_date**: Task due date (optional)
    """
    db_task = Task(
        **task_data.dict(),
        user_id=current_user.id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.get("/{task_id}", response_model=TaskSchema, response_model_by_alias=True)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific task by ID."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return task


@router.put("/{task_id}", response_model=TaskSchema, response_model_by_alias=True)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a task.
    
    Only updates fields that are provided in the request.
    """
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Update only provided fields
    update_data = task_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a task."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    db.delete(task)
    db.commit()
    return None
