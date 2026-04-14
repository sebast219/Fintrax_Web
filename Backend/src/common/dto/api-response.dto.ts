export class ApiResponseDto<T> {
  success: boolean;
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}
