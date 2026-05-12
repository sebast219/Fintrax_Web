export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  links?: {
    first?: string;
    last?: string;
    prev?: string;
    next?: string;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  details?: {
    field?: string;
    code?: string;
    description?: string;
  };
  timestamp: string;
}

export interface ValidationError {
  success: false;
  message: string;
  error: string;
  details: {
    field: string;
    code: string;
    description: string;
  }[];
  timestamp: string;
}

export interface SuccessResponse<T = any> extends ApiResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    filename: string;
    size: number;
    type: string;
  };
}

export interface ExportResponse {
  success: boolean;
  message: string;
  data: {
    downloadUrl: string;
    filename: string;
    format: string;
    size: number;
    expiresAt: string;
  };
}
