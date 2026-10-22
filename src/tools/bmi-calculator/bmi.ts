export type BmiCategory = { label: string; min: number; max: number; tone: "info" | "success" | "warning" | "danger" };

/** WHO adult BMI classification. `max` is exclusive. */
export const CATEGORIES: BmiCategory[] = [
  { label: "Underweight", min: 0, max: 18.5, tone: "info" },
  { label: "Normal weight", min: 18.5, max: 25, tone: "success" },
  { label: "Overweight", min: 25, max: 30, tone: "warning" },
  { label: "Obesity class I", min: 30, max: 35, tone: "danger" },
  { label: "Obesity class II", min: 35, max: 40, tone: "danger" },
  { label: "Obesity class III", min: 40, max: Infinity, tone: "danger" },
];

export const CM_PER_INCH = 2.54;
export const KG_PER_LB = 0.45359237;

/** BMI = weight (kg) / height (m)². Returns null for non-positive input. */
export function bmi(weightKg: number, heightCm: number): number | null {
  if (!(weightKg > 0) || !(heightCm > 0)) return null;
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export function category(value: number): BmiCategory {
  return CATEGORIES.find((c) => value >= c.min && value < c.max) ?? CATEGORIES[CATEGORIES.length - 1];
}

/** Weight range (kg) that gives a normal BMI (18.5–24.9) for this height. */
export function healthyRange(heightCm: number): [number, number] {
  const m2 = (heightCm / 100) ** 2;
  return [18.5 * m2, 24.9 * m2];
}

export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * CM_PER_INCH;
}

/** Position (0–100%) of a BMI on a 15–40 display scale, clamped. */
export function scalePosition(value: number, min = 15, max = 40): number {
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}
