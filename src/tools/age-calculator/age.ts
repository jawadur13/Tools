// Dates are "YYYY-MM-DD" strings handled in UTC so DST never shifts a day.

export type Ymd = { y: number; m: number; d: number };

export function parseYmd(value: string): Ymd | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return { y, m, d };
}

export function toYmdString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const utc = ({ y, m, d }: Ymd) => Date.UTC(y, m - 1, d);
const DAY = 86_400_000;

/** A Feb 29 birthday falls on Feb 28 in non-leap years. */
function birthdayIn(year: number, birth: Ymd): Ymd {
  return { y: year, m: birth.m, d: Math.min(birth.d, daysInMonth(year, birth.m)) };
}

export type Age = {
  years: number;
  months: number;
  days: number;
  totalMonths: number;
  totalWeeks: number;
  totalDays: number;
  totalHours: number;
  bornWeekday: string;
  isBirthday: boolean;
  nextBirthdayDays: number;
  nextBirthdayAge: number;
  nextBirthdayWeekday: string;
};

const weekday = (ymd: Ymd) => new Date(utc(ymd)).toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });

export function calculateAge(birth: Ymd, at: Ymd): Age | null {
  if (utc(birth) > utc(at)) return null;

  let years = at.y - birth.y;
  if (utc(birthdayIn(at.y, birth)) > utc(at)) years -= 1;

  // Whole months after the last birthday, anchored to the birth day-of-month.
  const anniversary = (totalMonths: number): Ymd => {
    const index = birth.m - 1 + totalMonths;
    const y = birth.y + Math.floor(index / 12);
    const m = (index % 12) + 1;
    return { y, m, d: Math.min(birth.d, daysInMonth(y, m)) };
  };
  let totalMonths = years * 12;
  while (utc(anniversary(totalMonths + 1)) <= utc(at)) totalMonths += 1;
  const months = totalMonths - years * 12;
  const days = Math.round((utc(at) - utc(anniversary(totalMonths))) / DAY);

  const totalDays = Math.round((utc(at) - utc(birth)) / DAY);

  let next = birthdayIn(at.y, birth);
  if (utc(next) <= utc(at)) next = birthdayIn(at.y + 1, birth);

  return {
    years,
    months,
    days,
    totalMonths,
    totalWeeks: Math.floor(totalDays / 7),
    totalDays,
    totalHours: totalDays * 24,
    bornWeekday: weekday(birth),
    isBirthday: utc(birthdayIn(at.y, birth)) === utc(at),
    nextBirthdayDays: Math.round((utc(next) - utc(at)) / DAY),
    nextBirthdayAge: next.y - birth.y,
    nextBirthdayWeekday: weekday(next),
  };
}
