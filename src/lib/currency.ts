/**
 * Format số tiền sang định dạng VND
 * @param amount - Số tiền (có thể là number hoặc string)
 * @returns Chuỗi định dạng VND (vd: "100.000 ₫")
 */
export function formatVND(amount: number | string | undefined): string {
  if (amount === undefined || amount === null) return "0 ₫";
  
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (isNaN(num)) return "0 ₫";
  
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format số tiền sang định dạng VND không có ký hiệu tiền tệ
 * @param amount - Số tiền
 * @returns Chuỗi định dạng (vd: "100.000")
 */
export function formatVNDShort(amount: number | string | undefined): string {
  if (amount === undefined || amount === null) return "0";
  
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (isNaN(num)) return "0";
  
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}