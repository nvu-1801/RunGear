import { z } from "zod";

// Tìm sản phẩm theo tiêu chí
export const searchProductsSchema = z.object({
  q: z.string().trim().optional().describe("Từ khóa người dùng gõ (tên/mô tả)."),
  categoryId: z.string().trim().optional(),
  priceMin: z.number().int().nonnegative().optional(),
  priceMax: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(10).default(3)
});

// Lấy chi tiết 1 sản phẩm
export const getProductDetailsSchema = z.object({
  id: z.string().min(1)
});
