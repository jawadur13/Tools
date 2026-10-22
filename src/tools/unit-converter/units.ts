export type Unit = { id: string; name: string; symbol: string; toBase: (v: number) => number; fromBase: (v: number) => number };
export type UnitCategory = { id: string; name: string; units: Unit[] };

/** A unit that is `factor` base units, e.g. km = linear(1000) metres. */
const linear = (id: string, name: string, symbol: string, factor: number): Unit => ({
  id,
  name,
  symbol,
  toBase: (v) => v * factor,
  fromBase: (v) => v / factor,
});

const FT = 0.3048;
const FT2 = FT * FT;

export const categories: UnitCategory[] = [
  {
    id: "length",
    name: "Length",
    units: [
      linear("mm", "Millimetre", "mm", 0.001),
      linear("cm", "Centimetre", "cm", 0.01),
      linear("m", "Metre", "m", 1),
      linear("km", "Kilometre", "km", 1000),
      linear("in", "Inch", "in", 0.0254),
      linear("ft", "Foot", "ft", FT),
      linear("yd", "Yard", "yd", 0.9144),
      linear("mi", "Mile", "mi", 1609.344),
      linear("nmi", "Nautical mile", "nmi", 1852),
      linear("um", "Micrometre", "µm", 1e-6),
    ],
  },
  {
    id: "weight",
    name: "Weight",
    units: [
      linear("mg", "Milligram", "mg", 1e-6),
      linear("g", "Gram", "g", 0.001),
      linear("kg", "Kilogram", "kg", 1),
      linear("t", "Tonne", "t", 1000),
      linear("oz", "Ounce", "oz", 0.028349523125),
      linear("lb", "Pound", "lb", 0.45359237),
      linear("st", "Stone", "st", 6.35029318),
      // Traditional South Asian units; 1 tola/bhori = 180 grains, 1 seer = 80 tola, 1 maund = 40 seer.
      linear("tola", "Tola / Bhori", "tola", 0.0116638038),
      linear("seer", "Seer", "seer", 0.0116638038 * 80),
      linear("maund", "Maund (mon)", "maund", 0.0116638038 * 80 * 40),
    ],
  },
  {
    id: "temperature",
    name: "Temperature",
    units: [
      { id: "c", name: "Celsius", symbol: "°C", toBase: (v) => v, fromBase: (v) => v },
      { id: "f", name: "Fahrenheit", symbol: "°F", toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
      { id: "k", name: "Kelvin", symbol: "K", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    ],
  },
  {
    id: "area",
    name: "Area",
    units: [
      linear("mm2", "Square millimetre", "mm²", 1e-6),
      linear("cm2", "Square centimetre", "cm²", 1e-4),
      linear("m2", "Square metre", "m²", 1),
      linear("ha", "Hectare", "ha", 1e4),
      linear("km2", "Square kilometre", "km²", 1e6),
      linear("in2", "Square inch", "in²", 0.00064516),
      linear("ft2", "Square foot", "ft²", FT2),
      linear("yd2", "Square yard", "yd²", 0.83612736),
      linear("acre", "Acre", "ac", 43560 * FT2),
      linear("mi2", "Square mile", "mi²", 2589988.110336),
      // Bangladeshi land units (standard values used in land offices).
      linear("decimal", "Decimal / Shotangsho", "decimal", 435.6 * FT2),
      linear("katha", "Katha", "katha", 720 * FT2),
      linear("bigha", "Bigha", "bigha", 14400 * FT2),
    ],
  },
  {
    id: "volume",
    name: "Volume",
    units: [
      linear("ml", "Millilitre", "mL", 0.001),
      linear("l", "Litre", "L", 1),
      linear("m3", "Cubic metre", "m³", 1000),
      linear("cm3", "Cubic centimetre", "cm³", 0.001),
      linear("tsp", "Teaspoon (US)", "tsp", 0.00492892159375),
      linear("tbsp", "Tablespoon (US)", "tbsp", 0.01478676478125),
      linear("floz", "Fluid ounce (US)", "fl oz", 0.0295735295625),
      linear("cup", "Cup (US)", "cup", 0.2365882365),
      linear("pt", "Pint (US)", "pt", 0.473176473),
      linear("qt", "Quart (US)", "qt", 0.946352946),
      linear("gal", "Gallon (US)", "gal", 3.785411784),
      linear("ukgal", "Gallon (UK)", "UK gal", 4.54609),
      linear("ft3", "Cubic foot", "ft³", 28.316846592),
      linear("in3", "Cubic inch", "in³", 0.016387064),
    ],
  },
  {
    id: "speed",
    name: "Speed",
    units: [
      linear("mps", "Metre per second", "m/s", 1),
      linear("kmh", "Kilometre per hour", "km/h", 1 / 3.6),
      linear("mph", "Mile per hour", "mph", 0.44704),
      linear("kn", "Knot", "kn", 1852 / 3600),
      linear("fps", "Foot per second", "ft/s", FT),
    ],
  },
  {
    id: "time",
    name: "Time",
    units: [
      linear("ms", "Millisecond", "ms", 0.001),
      linear("s", "Second", "s", 1),
      linear("min", "Minute", "min", 60),
      linear("h", "Hour", "h", 3600),
      linear("d", "Day", "d", 86400),
      linear("wk", "Week", "wk", 604800),
      // Average Gregorian month and year.
      linear("mo", "Month (avg.)", "mo", 2629746),
      linear("yr", "Year (avg.)", "yr", 31556952),
    ],
  },
  {
    id: "data",
    name: "Digital storage",
    units: [
      linear("bit", "Bit", "bit", 1 / 8),
      linear("B", "Byte", "B", 1),
      linear("KB", "Kilobyte (1000)", "KB", 1e3),
      linear("MB", "Megabyte (1000²)", "MB", 1e6),
      linear("GB", "Gigabyte (1000³)", "GB", 1e9),
      linear("TB", "Terabyte (1000⁴)", "TB", 1e12),
      linear("KiB", "Kibibyte (1024)", "KiB", 1024),
      linear("MiB", "Mebibyte (1024²)", "MiB", 1024 ** 2),
      linear("GiB", "Gibibyte (1024³)", "GiB", 1024 ** 3),
      linear("TiB", "Tebibyte (1024⁴)", "TiB", 1024 ** 4),
    ],
  },
];

export function convert(value: number, from: Unit, to: Unit): number {
  return to.fromBase(from.toBase(value));
}

/** Up to 10 significant digits; scientific notation for very large or tiny values. */
export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e15 || abs < 1e-6) return n.toExponential(6).replace(/\.?0+e/, "e");
  return n.toLocaleString("en-US", { maximumSignificantDigits: 10 });
}
