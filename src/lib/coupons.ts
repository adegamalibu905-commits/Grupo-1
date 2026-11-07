export type Coupon = { code: string; percent: number };

// Para criar outro cupom, basta adicionar uma linha aqui.
const COUPONS: Coupon[] = [{ code: "OBA2027", percent: 20 }];

export const normalizeCoupon = (s: string) => s.trim().toUpperCase().replace(/\s+/g, "");

export function findCoupon(code: string | undefined | null): Coupon | null {
  if (!code) return null;
  const c = normalizeCoupon(code);
  return COUPONS.find((x) => x.code === c) ?? null;
}

export const applyDiscount = (cents: number, percent: number) => Math.round((cents * (100 - percent)) / 100);