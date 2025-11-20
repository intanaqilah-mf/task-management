from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.subtask import SubTask
from app.models.task import Task
from app.models.user import User
from app.schemas.subtask import SubTask as SubTaskSchema, SubTaskCreate
from app.api.dependencies import get_current_user

router = APIRouter()


@router.patch("/{subtask_id}", response_model=SubTaskSchema)
def update_subtask(
    subtask_id: int,
    completed: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a subtask's completed status.

    - **subtask_id**: ID of the subtask to update
    - **completed**: New completed status
    """
    # Get the subtask
    subtask = db.query(SubTask).filter(SubTask.id == subtask_id).first()

    if not subtask:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subtask not found"
        )

    # Verify the user owns the parent task
    task = db.query(Task).filter(Task.id == subtask.task_id).first()
    if not task or task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this subtask"
        )

    # Update the subtask
    subtask.completed = completed
    db.commit()
    db.refresh(subtask)

    return subtask
