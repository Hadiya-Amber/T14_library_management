/**
 * Pricing utilities for membership checkout
 *
 * Exports two pure functions used by the tests and the UI:
 * - isStudentId(value): boolean
 * - quote(price, { studentId, code }): { total, studentDiscount, codeDiscount }
 */

/** Match student IDs like STU-123456 (case-insensitive) */
export function isStudentId(value: string | undefined): boolean {
  if (!value) return false;
  return /^STU-\d{6}$/i.test(value.trim());
}

export interface QuoteResult {
  total: number;
  studentDiscount: number;
  codeDiscount: number;
}

export interface QuoteOpts {
  studentId?: string | undefined;
  code?: string | undefined;
}

/**
 * Compute the quoted total applying discounts in order:
 * 1) 20% off if studentId is valid
 * 2) 10% off if code equals READMORE (case-insensitive)
 * Returns absolute discount amounts and the final total (rounded to whole rupees)
 */
export function quote(price: number, opts: QuoteOpts = {}): QuoteResult {
  const base = Math.max(0, Math.round(price));
  let remaining = base;
  let studentDiscount = 0;
  let codeDiscount = 0;

  if (opts.studentId && isStudentId(opts.studentId)) {
    // 20% off
    studentDiscount = Math.round(base * 0.2);
    remaining = Math.max(0, base - studentDiscount);
  }

  if (opts.code && typeof opts.code === 'string' && opts.code.trim().toUpperCase() === 'READMORE') {
    // 10% off the remaining amount after student discount
    codeDiscount = Math.round(remaining * 0.1);
    remaining = Math.max(0, remaining - codeDiscount);
  }

  return {
    total: Math.round(remaining),
    studentDiscount,
    codeDiscount,
  };
}
