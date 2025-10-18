// src/libs/url/get-safe-next.ts
export function getSafeNext(
  input: string | string[] | null | undefined,
  fallback = "/"
) {
  const raw = Array.isArray(input) ? input[0] : input;
  if (!raw) return fallback;

  // Chỉ cho phép đường dẫn nội bộ bắt đầu bằng "/"
  if (!raw.startsWith("/")) return fallback;

  // Ngăn open-redirect và path kỳ quặc
  try {
    // URL tuyệt đối sẽ ném hoặc tạo origin khác => không chấp nhận
    // Cho phép query/hash đi kèm
    new URL(raw, "http://local.test"); // base giả
  } catch {
    return fallback;
  }
  return raw;
}
