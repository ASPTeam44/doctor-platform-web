export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  [key: string]: any;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}
