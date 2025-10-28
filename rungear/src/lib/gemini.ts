import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { searchProductsSchema, getProductDetailsSchema } from "@/lib/tools/schemas";

export const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
export const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// JSON Schema cho functionDeclarations
const searchProductsJSON = zodToJsonSchema(searchProductsSchema, "searchProducts");
const getProductDetailsJSON = zodToJsonSchema(getProductDetailsSchema, "getProductDetails");

export const toolset = {
  functionDeclarations: [
    {
      name: "searchProducts",
      description: "Tìm 3 sản phẩm phù hợp theo từ khóa, danh mục, khoảng giá.",
      parameters: searchProductsJSON.definitions?.searchProducts ?? searchProductsJSON
    },
    {
      name: "getProductDetails",
      description: "Lấy chi tiết 1 sản phẩm theo id.",
      parameters: getProductDetailsJSON.definitions?.getProductDetails ?? getProductDetailsJSON
    }
  ]
};
