import api from './api';

export interface DocumentItem {
  id: number;
  title: string;
  description?: string | null;
  subject?: string | null;
  is_public: boolean;
  auto_summary?: boolean | null;
  auto_quiz?: boolean | null;
  ingestion_status?: 'processing' | 'ready' | null;
  file_url: string;
  file_type: string;
  uploader_id: number;
  uploader_name?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface DocumentListResponse {
  items: DocumentItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface DocumentQueryParams {
  q?: string;
  subject?: string;
  file_type?: string;
  page?: number;
  page_size?: number;
  sort?: 'newest' | 'oldest' | 'title_asc';
}

export interface UploadDocumentPayload {
  title: string;
  description?: string;
  subject?: string;
  is_public: boolean;
  file: File;
  auto_summary?: boolean;
  auto_quiz?: boolean;
}

export interface DocumentIngestionStatus {
  status: 'processing' | 'ready';
  summary_ready: boolean;
  quiz_ready: boolean;
}

export interface UpdateDocumentPayload {
  title?: string;
  description?: string;
  subject?: string;
  is_public?: boolean;
}

export interface UpdateIngestionOptionsPayload {
  auto_summary?: boolean;
  auto_quiz?: boolean;
}

export interface SharePayload {
  shared_to_id?: number | null;
  message?: string;
}

export interface ShareItem {
  id: number;
  document_id: number;
  shared_by_id: number;
  shared_to_id?: number | null;
  shared_to_name?: string | null;
  shared_to_email?: string | null;
  message?: string | null;
  shared_at: string;
}

export const documentService = {
  async list(params: DocumentQueryParams): Promise<DocumentListResponse> {
    const response = await api.get('/api/v1/documents', { params });
    return response.data;
  },

  async detail(documentId: number): Promise<DocumentItem> {
    const response = await api.get(`/api/v1/documents/${documentId}`);
    return response.data;
  },

  async getIngestionStatus(documentId: number): Promise<DocumentIngestionStatus> {
    const response = await api.get(`/api/v1/documents/${documentId}/ingestion-status`);
    return response.data;
  },

  async upload(payload: UploadDocumentPayload): Promise<DocumentItem> {
    const formData = new FormData();
    formData.append('title', payload.title);
    if (payload.description) formData.append('description', payload.description);
    if (payload.subject) formData.append('subject', payload.subject);
    formData.append('is_public', String(payload.is_public));
    formData.append('auto_summary', String(payload.auto_summary ?? true));
    formData.append('auto_quiz', String(payload.auto_quiz ?? true));
    formData.append('file', payload.file);

    const response = await api.post('/api/v1/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async share(documentId: number, payload: SharePayload): Promise<ShareItem> {
    const response = await api.post(`/api/v1/documents/${documentId}/share`, payload);
    return response.data;
  },

  async update(documentId: number, payload: UpdateDocumentPayload): Promise<DocumentItem> {
    const response = await api.put(`/api/v1/documents/${documentId}`, payload);
    return response.data;
  },

  async updateIngestionOptions(documentId: number, payload: UpdateIngestionOptionsPayload): Promise<DocumentItem> {
    const response = await api.patch(`/api/v1/documents/${documentId}/ingestion-options`, payload);
    return response.data;
  },

  async remove(documentId: number): Promise<{ message: string }> {
    const response = await api.delete(`/api/v1/documents/${documentId}`);
    return response.data;
  },

  async listShares(documentId: number): Promise<ShareItem[]> {
    const response = await api.get(`/api/v1/documents/${documentId}/shares`);
    return response.data;
  },
};
