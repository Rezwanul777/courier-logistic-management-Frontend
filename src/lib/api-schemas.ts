import { z } from "zod";

export const paginationMetaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export function apiResponseSchema<T>(dataSchema: z.ZodType<T>) {
  return z.object({
    success: z.literal(true),
    statusCode: z.number().int().min(200).max(299).optional(),
    message: z.string(),
    data: dataSchema,
    meta: paginationMetaSchema.optional(),
  });
}

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;
export interface ApiResponse<T> {
  success: true;
  statusCode?: number;
  message: string;
  data: T;
  meta?: PaginationMeta;
}
