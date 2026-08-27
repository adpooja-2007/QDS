export * from '../types';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  request_id?: string;
  details?: unknown;
}
