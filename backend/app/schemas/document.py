from datetime import datetime
from typing import List, Optional, Literal

from pydantic import BaseModel, EmailStr, ConfigDict


class DocumentBase(BaseModel):
    title: str
    description: Optional[str] = None
    subject: Optional[str] = None
    is_public: bool = True


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    subject: Optional[str] = None
    is_public: Optional[bool] = None


class DocumentOut(DocumentBase):
    id: int
    file_url: str
    file_type: str
    uploader_id: int
    uploader_name: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class DocumentConceptOut(BaseModel):
    id: int
    label: str
    category: str
    score: float

    model_config = ConfigDict(from_attributes=True)


class DocumentIngestionOut(BaseModel):
    document_id: int
    status: str
    progress: float
    last_event: Optional[str] = None
    error_message: Optional[str] = None
    chunks_count: int
    concepts_count: int
    summary_content: Optional[str] = None
    quiz_test_id: Optional[int] = None
    quiz_questions_count: int = 0
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    concepts: List[DocumentConceptOut] = []

    model_config = ConfigDict(from_attributes=True)


class DocumentListResponse(BaseModel):
    items: List[DocumentOut]
    total: int
    page: int
    page_size: int


class DocumentShareCreate(BaseModel):
    shared_to_id: Optional[int] = None
    permission: Literal["view", "edit", "comment"] = "view"
    message: Optional[str] = None


class DocumentShareOut(BaseModel):
    id: int
    document_id: int
    shared_by_id: int
    shared_to_id: Optional[int] = None
    shared_to_name: Optional[str] = None
    shared_to_email: Optional[EmailStr] = None
    permission: str
    status: str
    message: Optional[str] = None
    shared_at: datetime

    class Config:
        from_attributes = True


class AdminDocumentOverview(BaseModel):
    total_documents: int
    public_documents: int
    private_documents: int
    total_shares: int
    pending_shares: int
    approved_shares: int
    rejected_shares: int
    total_users: int = 0
    weekly_uploads: List[int] = [0] * 7
    recent_activities: List[dict] = []


class AdminDocumentItem(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    subject: Optional[str] = None
    is_public: bool
    file_url: str
    file_type: str
    uploader_id: int
    uploader_name: Optional[str] = None
    uploader_email: Optional[EmailStr] = None
    share_count: int = 0
    pending_share_count: int = 0
    approved_share_count: int = 0
    rejected_share_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None


class AdminDocumentListResponse(BaseModel):
    items: List[AdminDocumentItem]
    total: int
    page: int
    page_size: int


class AdminDocumentVisibilityUpdate(BaseModel):
    is_public: bool


class AdminShareModerationItem(BaseModel):
    id: int
    document_id: int
    document_title: str
    shared_with_user_id: int
    shared_with_name: Optional[str] = None
    shared_with_email: Optional[EmailStr] = None
    shared_by_user_id: int
    shared_by_name: Optional[str] = None
    shared_by_email: Optional[EmailStr] = None
    permission: str
    status: str
    shared_at: datetime


class AdminShareModerationListResponse(BaseModel):
    items: List[AdminShareModerationItem]
    total: int
    page: int
    page_size: int


class AdminShareModerationUpdate(BaseModel):
    status: Literal["pending", "approved", "rejected"]
    permission: Optional[Literal["view", "edit", "comment"]] = None
