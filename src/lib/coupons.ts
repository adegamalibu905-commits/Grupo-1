export type Coupon = { code: string; percent: number; on?: boolean };
// Parte pública (vai para o navegador): sem códigos de cupom.
export type AutoPricing = { limitCents: number; autoPercent: number };

type CouponsCfg = { limitReais: number; autoPercent: number; list: Coupon[] };

const clamp = (n: number) => Math.min(100, Math.max(0, Number(n) || 0));

export const autoPricing = (c: CouponsCfg): AutoPricing => ({
  limitCents: Math.round((Number(c.limitReais) || 500) * 100),
  autoPercent: clamp(c.autoPercent),
});
export const activeCoupons = (c: CouponsCfg): Coupon[] =>
  c.list.filter((x) => x.on !== false && normalizeCoupon(x.code) && clamp(x.percent) > 0).map((x) => ({ code: normalizeCoupon(x.code), percent: clamp(x.percent) }));

export const normalizeCoupon = (s: string) => String(s ?? "").trim().toUpperCase().replace(/\s+/g, "");

export function findCoupon(code: string | undefined | null, list: Coupon[]): Coupon | null {
  if (!code) return null;
  const c = normalizeCoupon(code);
  return list.find((x) => x.code === c) ?? null;
}

export const applyDiscount = (cents: number, percent: number) => Math.round((cents * (100 - percent)) / 100);

// Preço final: desconto automático (se o plano passa do limite do Pix) ou cupom. O maior desconto vale; não soma.
export function computePrice(originalCents: number, coupon: Coupon | null | undefined, a: AutoPricing) {
  const auto = originalCents > a.limitCents ? a.autoPercent : 0;
  const percent = Math.max(auto, coupon?.percent ?? 0);
  const totalCents = percent ? applyDiscount(originalCents, percent) : originalCents;
  return { originalCents, totalCents, percent, auto: percent > 0 && !(coupon && coupon.percent >= auto) };
} 