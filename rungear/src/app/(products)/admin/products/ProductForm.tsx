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

type ProductInput = {
  name: string;
  price: number;
  stock: number;
  images?: string | null; // single image url
  status: "draft" | "active" | "hidden";
  categories_id:
    | "1d4478e7-c9d2-445e-8520-14dae73aac68"
    | "3c0144cf-7a2e-4c59-8ad7-351a27d2fc1d"
    | "e9819e30-a5dc-4cd1-835d-206bb882fc09";
};

type Product = ProductInput & { id: string };

type Props = {
  initial?: Product;
  onClose: () => void;
  onSaved: () => void;
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
      if (!v || v.trim() === "") return true; // cho phép rỗng
      return /^https?:\/\/.+/i.test(v); // check có http/https
    }),
});

export default function ProductForm({ initial, onClose, onSaved }: Props) {
  const isEdit = !!initial;
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

      const endpoint = isEdit
        ? `/api/products/${(initial as Product).id}`
        : "/api/products";
      const method = isEdit ? "PUT" : "POST";

      const r = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error ?? j?.message ?? "Save failed");
      }

      onSaved();
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
                      {/* URL input (controlled) */}
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

                      {/* Upload component */}
                      <AdminImageUploader
                        folder={`products/${
                          initial?.id || crypto.randomUUID()
                        }`}
                        onUploaded={(file) => {
                          formik.setFieldValue("images", file.publicUrl);
                          setPreviewSrc(file.publicUrl);
                        }}
                      />

                      <button
                        type="button"
                        className="px-3 py-2 rounded-md border text-sm self-start"
                        onClick={() => {
                          formik.setFieldValue("images", "");
                          setPreviewSrc(null);
                        }}
                      >
                        Clear
                      </button>

                      <div className="text-xs text-gray-500">
                        Upload ảnh lên bucket hoặc dán URL thủ công. Ảnh sẽ hiển
                        thị preview.
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
                        <div className="text-xs text-gray-400">Preview</div>
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
                <div className="px-4 text-sm text-red-600">{submitError}</div>
              )}

              <div className="p-4 border-t flex items-center justify-end gap-2 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
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
