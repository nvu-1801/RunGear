import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { Tool, FunctionDeclarationSchema, Schema } from "@google/generative-ai";
import * as z from "zod";
import {
  searchProductsSchema,
  getProductDetailsSchema,
} from "@/lib/tools/schemas";

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) throw new Error("GOOGLE_API_KEY environment variable is not set");

export const genAI = new GoogleGenerativeAI(apiKey);
export const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp";

/** Zod v4: convert to JSON Schema */
const searchProductsJSON = z.toJSONSchema(searchProductsSchema, {
  // io: "input",
  // target: "openapi-3.0",
  // reused: "inline",
});

const getProductDetailsJSON = z.toJSONSchema(getProductDetailsSchema, {
  // io: "input",
  // target: "openapi-3.0",
});

/** Convert Zod JSON Schema to Gemini FunctionDeclarationSchema */
function convertToGeminiSchema(
  jsonSchema: Record<string, unknown>
): FunctionDeclarationSchema {
  const properties: Record<string, Schema> = {};

  // Extract properties from Zod schema
  if (jsonSchema.properties && typeof jsonSchema.properties === "object") {
    for (const [key, value] of Object.entries(jsonSchema.properties)) {
      if (value && typeof value === "object") {
        const propSchema = value as Record<string, unknown>;
        properties[key] = convertPropertyToGemini(propSchema);
      }
    }
  }

  return {
    type: SchemaType.OBJECT,
    properties,
    required: Array.isArray(jsonSchema.required) ? jsonSchema.required : [],
  };
}

/** Convert individual property to Gemini schema format */
function convertPropertyToGemini(
  prop: Record<string, unknown>
): Schema {
  const propType = prop.type as string;

  // Map JSON Schema types to Gemini SchemaType
  let schemaType: SchemaType;
  switch (propType) {
    case "string":
      schemaType = SchemaType.STRING;
      break;
    case "number":
    case "integer":
      schemaType = SchemaType.NUMBER;
      break;
    case "boolean":
      schemaType = SchemaType.BOOLEAN;
      break;
    case "array":
      schemaType = SchemaType.ARRAY;
      break;
    case "object":
      schemaType = SchemaType.OBJECT;
      break;
    default:
      schemaType = SchemaType.STRING;
  }

  const result: Partial<Schema> = {
    type: schemaType,
    description:
      typeof prop.description === "string" ? prop.description : undefined,
  };

  // Handle enum
  if (Array.isArray(prop.enum)) {
    (result as any).enum = prop.enum as string[];
  }

  // Handle array items
  if (schemaType === SchemaType.ARRAY && prop.items) {
    (result as any).items = convertPropertyToGemini(
      prop.items as Record<string, unknown>
    );
  }

  // Handle object properties
  if (schemaType === SchemaType.OBJECT && prop.properties) {
    (result as any).properties = {};
    for (const [key, value] of Object.entries(
      prop.properties as Record<string, unknown>
    )) {
      (result as any).properties[key] = convertPropertyToGemini(
        value as Record<string, unknown>
      );
    }
  }

  return result as Schema;
}

/** Toolset cho Gemini */
export const toolset: Tool = {
  functionDeclarations: [
    {
      name: "searchProducts",
      description:
        "Tìm kiếm sản phẩm thể thao theo từ khóa, danh mục (shoes/shirts/pants), và khoảng giá. Trả về tối đa 10 sản phẩm phù hợp.",
      parameters: convertToGeminiSchema(searchProductsJSON),
    },
    {
      name: "getProductDetails",
      description:
        "Lấy thông tin chi tiết của một sản phẩm cụ thể theo ID. Bao gồm mô tả đầy đủ, thông số kỹ thuật, tồn kho, hình ảnh.",
      parameters: convertToGeminiSchema(getProductDetailsJSON),
    },
  ],
};
