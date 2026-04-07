from datetime import datetime
from typing import List, Optional, Literal

from pydantic import BaseModel, EmailStr


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

    class Config:
        orm_mode = True


class DocumentListResponse(BaseModel):
    items: List[DocumentOut]
    total: int
    page: int
    page_size: int


class DocumentShareCreate(BaseModel):
    shared_with_user_id: Optional[int] = None
    shared_with_email: Optional[EmailStr] = None
    permission: Literal["view", "edit", "comment"] = "view"


class DocumentShareOut(BaseModel):
    id: int
    document_id: int
    shared_with_user_id: int
    shared_with_email: Optional[EmailStr] = None
    permission: str
    status: str
    shared_at: datetime

    class Config:
        orm_mode = True
