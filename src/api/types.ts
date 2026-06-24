export type ApiSuccess<T> = { ok: true; data: T; status: 200 | 201 };
export type ApiError = { ok: false; error: string; status: 400 | 404 | 409 | 500 };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export const ok = <T>(data: T, status: 200 | 201 = 200): ApiSuccess<T> => ({
  ok: true,
  data,
  status,
});

export const err = (error: string, status: ApiError['status'] = 500): ApiError => ({
  ok: false,
  error,
  status,
});
