"use client";

import { Cake } from "lucide-react";
import { useState } from "react";
import { calculateAge, parseYmd, toYmdString } from "./age";

export default function AgeCalculator() {
  const [birth, setBirth] = useState("");
  const [at, setAt] = useState(() => toYmdString(new Date()));

  const birthDate = parseYmd(birth);
  const atDate = parseYmd(at);
  const age = birthDate && atDate ? calculateAge(birthDate, atDate) : null;
  const inFuture = birthDate && atDate && !age;

  const totals = age
    ? [
        { label: "Months", value: age.totalMonths },
        { label: "Weeks", value: age.totalWeeks },
        { label: "Days", value: age.totalDays },
        { label: "Hours", value: age.totalHours },
      ]
    : [];

  return (
    <div className="space-y-5">
      <div className="card grid gap-4 p-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="age-birth">Date of birth</label>
          <input id="age-birth" type="date" value={birth} max={at} onChange={(e) => setBirth(e.target.value)} className="field" />
        </div>
        <div>
          <label className="label" htmlFor="age-at">Age at the date of</label>
          <input id="age-at" type="date" value={at} onChange={(e) => setAt(e.target.value)} className="field" />
        </div>
        {inFuture && <p className="text-sm text-danger sm:col-span-2">The date of birth must be on or before the “age at” date.</p>}
      </div>

      {age ? (
        <>
          <div className="card p-6 text-center">
            <p className="text-sm text-muted">Your age is</p>
            <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {age.years} <span className="text-lg font-medium text-muted">years</span> {age.months}{" "}
              <span className="text-lg font-medium text-muted">months</span> {age.days}{" "}
              <span className="text-lg font-medium text-muted">days</span>
            </p>
            <p className="mt-3 text-sm text-muted">
              You were born on a <span className="font-medium text-foreground">{age.bornWeekday}</span>.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {totals.map((t) => (
              <div key={t.label} className="card p-4">
                <p className="text-xl font-bold tabular-nums">{t.value.toLocaleString("en-US")}</p>
                <p className="mt-1 text-xs text-muted">Total {t.label.toLowerCase()}</p>
              </div>
            ))}
          </div>

          <div className="card flex items-center gap-4 p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Cake className="size-5" />
            </span>
            <p className="text-sm">
              {age.isBirthday && age.years > 0 ? (
                <>
                  <span className="font-semibold">Happy birthday! 🎉</span> You turned {age.years} today.
                </>
              ) : (
                <>
                  Your <span className="font-semibold">{ordinal(age.nextBirthdayAge)} birthday</span> is in{" "}
                  <span className="font-semibold text-accent">
                    {age.nextBirthdayDays} day{age.nextBirthdayDays === 1 ? "" : "s"}
                  </span>
                  , on a {age.nextBirthdayWeekday}.
                </>
              )}
            </p>
          </div>
        </>
      ) : (
        !inFuture && <p className="card p-6 text-center text-sm text-muted">Enter your date of birth to see your exact age.</p>
      )}
    </div>
  );
}

function ordinal(n: number): string {
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th";
  return `${n}${suffix}`;
}
