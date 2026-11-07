export type Coupon = { code: string; percent: number };

// Limite de depósito Pix da GladePay: R$ 500,00. Planos acima disso ganham desconto automático.
export const PIX_LIMIT_CENTS = 50000;
export const AUTO_PERCENT = 20;

// Para criar outro cupom, basta adicionar uma linha aqui.
const COUPONS: Coupon[] = [{ code: "OBA2027", percent: 20 }];

export const normalizeCoupon = (s: string) => s.trim().toUpperCase().replace(/\s+/g, "");

export function findCoupon(code: string | undefined | null): Coupon | null {
  if (!code) return null;
  const c = normalizeCoupon(code);
  return COUPONS.find((x) => x.code === c) ?? null;
}

export const applyDiscount = (cents: number, percent: number) => Math.round((cents * (100 - percent)) / 100);

// Preço final: desconto automático (se o plano passa do limite) ou cupom. O maior desconto vale; não soma.
export function computePrice(originalCents: number, coupon?: Coupon | null) {
  const auto = originalCents > PIX_LIMIT_CENTS ? AUTO_PERCENT : 0;
  const percent = Math.max(auto, coupon?.percent ?? 0);
  const totalCents = percent ? applyDiscount(originalCents, percent) : originalCents;
  return { originalCents, totalCents, percent, auto: percent > 0 && !(coupon && coupon.percent >= auto) };
}