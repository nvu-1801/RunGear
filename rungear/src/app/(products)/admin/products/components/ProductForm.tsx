"use client";

import type { ChangeEvent, FocusEvent } from "react";
import { useEffect, useState } from "react";
import {
  Formik,
  Form,
  Field,
  ErrorMessage,
  FormikHelpers,
  FormikProps,
} from "formik";
import * as Yup from "yup";
import AdminImageUploader from "@/components/uploader/AdminImageUploader";
import type { ProductInput } from "@/modules/products/model/product-public";

// type ProductInput = {
//   name: string;
//   price: number;
//   stock: number;
//   images?: string | null;
//   status: "draft" | "active" | "hidden";
//   categories_id:
//     | "1d4478e7-c9d2-445e-8520-14dae73aac68"
//     | "3c0144cf-7a2e-4c59-8ad7-351a27d2fc1d"
//     | "e9819e30-a5dc-4cd1-835d-206bb882fc09";
// };

type Product = ProductInput & { id: string };

type Props = {
  initial?: ProductInput;
  productId?: string;
  onClose: () => void;
  onSaved: (values: ProductInput) => void | Promise<void>;
};

const validationSchema = Yup.object({
  name: Yup.string().trim().required("Tên sản phẩm bắt buộc"),
  price: Yup.number().min(0, "Giá phải >= 0").required("Giá bắt buộc"),
  stock: Yup.number().min(0, "Số lượng phải >= 0").required("Stock bắt buộc"),
  categories_id: Yup.string().required("Chọn danh mục"),
  status: Yup.mixed().oneOf(["draft", "active", "hidden"]).required(),
  images: Yup.string()
    .nullable()
    .test("is-url-or-empty", "Phải là URL hợp lệ hoặc để trống", (v) => {
      if (!v || v.trim() === "") return true;
      return /^https?:\/\/.+/i.test(v);
    }),
});

export default function ProductForm({
  initial,
  productId,
  onClose,
  onSaved,
}: Props) {
  // const isEdit = !!initial;
  const isEdit = !!productId;
  const initialValues: ProductInput = {
    name: initial?.name ?? "",
    price: initial?.price ?? 0,
    stock: initial?.stock ?? 0,
    images: initial?.images ?? "",
    status: (initial?.status as ProductInput["status"]) ?? "active",
    categories_id:
      (initial?.categories_id as ProductInput["categories_id"]) ??
      "1d4478e7-c9d2-445e-8520-14dae73aac68",
  };

  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(
    initialValues.images ?? null
  );
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // null = checking

  // Check quyền admin khi mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/check", { credentials: "include" });
        if (!res.ok) {
          setIsAdmin(false);
          return;
        }
        const data = (await res.json()) as {
          user?: {
            id?: string;
            email?: string;
            role?: string | null;
          } | null;
        };

        // Check role === "admin"
        const userRole = data?.user?.role;
        setIsAdmin(userRole === "admin");

        console.log("ProductForm - user role:", userRole);
        console.log("ProductForm - isAdmin:", userRole === "admin");
      } catch (err) {
        console.error("Failed to check auth:", err);
        setIsAdmin(false);
      }
    })();
  }, []);

  useEffect(() => {
    setPreviewSrc(initialValues.images ?? null);
  }, [initialValues.images]);

  const handleSubmit = async (
    values: ProductInput,
    helpers: FormikHelpers<ProductInput>
  ) => {
    setSaving(true);
    setSubmitError(null);
    try {
      const payload: ProductInput = {
        ...values,
        price: Number(values.price || 0),
        stock: Number(values.stock || 0),
        images:
          values.images && values.images.length > 0 ? values.images : undefined,
      };

      // ✅ nếu có productId => PUT, ngược lại POST
      const endpoint = isEdit ? `/api/products/${productId}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";

      if (isEdit && !productId) {
        throw new Error("Missing product id"); // guard an toàn
      }

      const r = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        throw new Error(j?.error ?? j?.message ?? "Save failed");
      }

      const saved = await r.json();
      await onSaved(saved); 
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSubmitError(msg);
      helpers.setSubmitting(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl border max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-semibold">
              {isEdit ? "Sửa sản phẩm" : "Tạo sản phẩm mới"}
            </h2>
            <div className="text-xs text-gray-500">
              Điền thông tin cơ bản và upload ảnh
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <Formik<ProductInput>
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {(formik: FormikProps<ProductInput>) => (
            <Form>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Tên sản phẩm
                  </label>
                  <Field
                    name="name"
                    className="border px-3 py-2 rounded-md w-full"
                  />
                  <div className="text-xs text-red-600">
                    <ErrorMessage name="name" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Danh mục
                  </label>
                  <Field
                    as="select"
                    name="categories_id"
                    className="border px-3 py-2 rounded-md w-full"
                  >
                    <option value="1d4478e7-c9d2-445e-8520-14dae73aac68">
                      Áo
                    </option>
                    <option value="3c0144cf-7a2e-4c59-8ad7-351a27d2fc1d">
                      Quần
                    </option>
                    <option value="e9819e30-a5dc-4cd1-835d-206bb882fc09">
                      Giày
                    </option>
                  </Field>
                  <div className="text-xs text-red-600">
                    <ErrorMessage name="categories_id" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Giá (VND)
                  </label>
                  <Field
                    name="price"
                    type="number"
                    className="border px-3 py-2 rounded-md w-full"
                  />
                  <div className="text-xs text-red-600">
                    <ErrorMessage name="price" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Số lượng
                  </label>
                  <Field
                    name="stock"
                    type="number"
                    className="border px-3 py-2 rounded-md w-full"
                  />
                  <div className="text-xs text-red-600">
                    <ErrorMessage name="stock" />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Ảnh chính
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2 flex flex-col gap-2">
                      {/* URL input */}
                      <input
                        name="images"
                        placeholder="URL ảnh (tự động điền sau khi upload)"
                        className="border px-3 py-2 rounded-md w-full"
                        value={formik.values.images ?? ""}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const v = e.target.value;
                          formik.setFieldValue("images", v);
                          setPreviewSrc(v || null);
                        }}
                        onBlur={(e: FocusEvent<HTMLInputElement>) => {
                          const v = (e.target.value ?? "").toString().trim();
                          formik.setFieldValue("images", v || "");
                          setPreviewSrc(v || null);
                        }}
                      />

                      {/* Upload component with permission check */}
                      {isAdmin === null && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border">
                          <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Đang kiểm tra quyền admin...</span>
                        </div>
                      )}

                      {isAdmin === false && (
                        <div className="flex items-start gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                          <svg
                            className="w-4 h-4 mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <div className="flex-1">
                            <p className="font-semibold">
                              Không có quyền upload
                            </p>
                            <p className="text-xs">
                              Bạn cần role <strong>"admin"</strong> trong bảng
                              profiles để upload ảnh. Vui lòng liên hệ quản trị
                              viên.
                            </p>
                          </div>
                        </div>
                      )}

                      {isAdmin === true && (
                        <AdminImageUploader
                          folder={`products/${
                            productId ?? `draft/${crypto.randomUUID()}`
                          }`}
                          onPreview={(previewUrl) => setPreviewSrc(previewUrl)}
                          onUploaded={(file) => {
                            formik.setFieldValue("images", file.publicUrl);
                            setPreviewSrc(file.publicUrl);
                          }}
                        />
                      )}

                      <button
                        type="button"
                        className="px-3 py-2 rounded-md border text-sm self-start hover:bg-gray-50 transition"
                        onClick={() => {
                          formik.setFieldValue("images", "");
                          setPreviewSrc(null);
                        }}
                      >
                        Xóa ảnh
                      </button>

                      <div className="text-xs text-gray-500">
                        {isAdmin === true
                          ? "✓ Upload ảnh lên storage hoặc dán URL thủ công."
                          : isAdmin === false
                          ? "⚠️ Chỉ có thể dán URL ảnh thủ công."
                          : "⏳ Đang kiểm tra quyền..."}
                      </div>
                    </div>

                    <div className="h-28 md:h-32 bg-gray-50 border rounded-lg flex items-center justify-center overflow-hidden">
                      {previewSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previewSrc}
                          alt="preview"
                          className="max-h-full object-contain"
                        />
                      ) : (
                        <div className="text-xs text-gray-400">Chưa có ảnh</div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-red-600">
                    <ErrorMessage name="images" />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Trạng thái
                  </label>
                  <Field
                    as="select"
                    name="status"
                    className="border px-3 py-2 rounded-md w-40"
                  >
                    <option value="draft">draft</option>
                    <option value="active">active</option>
                    <option value="hidden">hidden</option>
                  </Field>
                </div>
              </div>

              {submitError && (
                <div className="px-4 py-2 mb-2">
                  <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                    <svg
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="flex-1">{submitError}</span>
                  </div>
                </div>
              )}

              <div className="p-4 border-t flex items-center justify-end gap-2 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving || formik.isSubmitting}
                  className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50 hover:bg-gray-800 transition"
                >
                  {saving ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
