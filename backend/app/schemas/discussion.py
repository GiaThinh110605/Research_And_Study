from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


# ---------- Request schemas ----------

class DiscussionCreate(BaseModel):
    """Tạo comment hoặc reply trong Discussion."""
    document_id: int
    content: str
    parent_id: Optional[int] = None  # None = comment gốc, có giá trị = reply
    is_question: Optional[bool] = False


class DiscussionUpdate(BaseModel):
    """Cập nhật nội dung bình luận."""
    content: str


class DiscussionReactionCreate(BaseModel):
    """Tạo hoặc cập nhật reaction cho discussion."""
    emoji: str


# ---------- Nested helpers ----------

class DiscussionUserOut(BaseModel):
    id: int
    full_name: str
    username: str
    role: str
class DiscussionReactionSummary(BaseModel):
    emoji: str
    count: int


    model_config = ConfigDict(from_attributes=True)


# ---------- Response schemas ----------

class DiscussionOut(BaseModel):
    id: int
    document_id: int
    user_id: int
    parent_id: Optional[int] = None
    content: str
    is_question: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    # Nested
    user: Optional[DiscussionUserOut] = None
    replies: Optional[List["DiscussionOut"]] = []
    reaction_summary: List[DiscussionReactionSummary] = []
    my_reaction: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# Cho phép tự tham chiếu (Pydantic v2 style or v1)
DiscussionOut.model_rebuild()


class DiscussionReactionStatus(BaseModel):
    discussion_id: int
    reaction_summary: List[DiscussionReactionSummary] = []
    my_reaction: Optional[str] = None
