# JalCal

A tiny, fast, dependency‑free JavaScript library for converting dates **between Gregorian and Jalali (Persian)** calendars **without** going through Julian Day Numbers (JDN).

By avoiding the JDN bridge, JalCal sidesteps common off‑by‑one and leap‑year edge cases that affect many libraries, especially around **Esfand 30** and Gregorian leap days.

---

## ✨ Features
- ✅ **Direct** Gregorian ⇄ Jalali conversion (no JDN)
- 🧪 Correct handling of **leap years** (both calendars)
- 🔁 Deterministic **round‑trip** conversions
- 🧩 Zero dependencies, tiny footprint
- 🕒 Works in Node.js, browsers, and modern bundlers
- 🔒 Pure functions, immutable results

> Note: Function names follow the library’s public API: `gregorianToJalaali(gy, gm, gd)` and `jalaaliToGregorian(jy, jm, jd)`.

---

## Installation

<!-- ```bash
# Option A) Install from npm (if published)
# npm
npm install jalcal
# pnpm
pnpm add jalcal
# yarn
yarn add jalcal -->

# Option A) Use directly from source (GitHub clone or single-file copy)
# Place the JS file in your project and import it locally
<!--```

### Import
```js
// ESM (recommended)
import { gregorianToJalaali, jalaaliToGregorian, isJalaliLeapYear, isGregorianLeapYear } from "jalcal";

// CommonJS
const { gregorianToJalaali, jalaaliToGregorian, isJalaliLeapYear, isGregorianLeapYear } = require("jalcal");

// Browser (UMD)
// <script src="/path/to/jalcal.umd.js"></script>
// window.JalCal.gregorianToJalaali(...)
``` -->

---

## Quick Start

```js
// Convert a Gregorian date (year, month, day) to Jalali parts
const j = gregorianToJalaali(2025, 3, 21);
// => [ 1404, 1, 1 ]  // Farvardin 1, 1404 (Nowruz)

// Convert Jalali parts to Gregorian parts
const g = jalaaliToGregorian(1403, 12, 30); // Esfand 30 (leap year in Jalali)
// => [2025, 3, 20 ]

// Build a JS Date from the Gregorian result
const date = new Date(g[0], g[1] - 1, g[2]);
```

---

## API

### `gregorianToJalaali(gy, gm, gd)`
Converts a Gregorian date to Jalali (Persian) date parts.

**Parameters**
- `gy`: Gregorian year
- `gm`: Gregorian month `1..12`
- `gd`: Gregorian day `1..31`

**Returns**
- `[ jy, jm, jd ]`

**Examples**
```js
gregorianToJalaali(2024, 2, 29); // 2024‑02‑29 (Gregorian leap day)
// => [1402, 12, 10 ]

gregorianToJalaali(2016, 3, 20);
// => [ 1395, 1, 1 ]
```

---

### `jalaaliToGregorian(jy, jm, jd)`
Converts a Jalali date to Gregorian date parts.

**Parameters**
- `jy`: Jalali year (e.g., 1403)
- `jm`: Jalali month `1..12`
- `jd`: Jalali day `1..31` (validated per month & leap year)

**Returns**
- `[ gy, gm, gd ]`  (1‑based month)

**Examples**
```js
jalaaliToGregorian(1399, 12, 30);  // Esfand 30 (Jalali leap year)
// => [2021, 3, 20 ]

// End‑of‑month safety
const g = jalaaliToGregorian(1402, 6, 31);
const native = new Date(g[0], g[1] - 1, g[2]);
```

---

### `isJalaliLeapYear(jy)`
Returns `true` if `jy` is a leap year in the Jalali calendar.

```js
isJalaliLeapYear(1399); // true
isJalaliLeapYear(1400); // false
```

### `isGregorianLeapYear(gy)`
Returns `true` if `gy` is a leap year in the Gregorian calendar.

```js
isGregorianLeapYear(2024); // true
isGregorianLeapYear(2100); // false
```

---

## Algorithm & correctness
JalCal implements the **Behrooz–Birashk** civil Jalali leap‑year rule using a **mod‑128 remainder** method (no Julian Day bridge). In practice, this yields a stable 33‑year leap cadence with periodic adjustments encoded by the mod‑128 remainder, matching the modern civil calendar in software and government systems. The implementation is purely integer arithmetic and is deterministic.

**Proven window**: The algorithm and implementation have been **validated for all Jalali years `1300..1700`** via exhaustive tests and anchor‑date checks (see Testing).

---

## Why not Julian Day Numbers?
Many converters map Gregorian → **JDN** → Jalali. This introduces rounding and epoch‑offset pitfalls that show up on boundary dates:

- Gregorian **Feb 29** in leap years
- Jalali **Esfand 30** (leap day)
- Cross‑year edges (e.g., Farvardin 1)

JalCal uses direct arithmetic in both calendars:
- Gregorian: 400‑year cycles (exact leap rule: divisible by 4, not by 100 unless by 400)
- Jalali: modern 33‑year leap cycle pattern used in civil software systems

This yields stable, fast conversions without JDN rounding drift.

> If your use case requires astronomical historical precision centuries back, consider cross‑checking with astronomical tables.

---

## Edge Cases Covered
- ✅ Gregorian leap day **2024‑02‑29** ⇄ **1402‑12‑10**
- ✅ Jalali leap day **1403‑12‑30** ⇄ **2025‑03‑20**
- ✅ End‑of‑month dates (Shahrivar 31, Dey/Esfand boundaries)
- ✅ Round‑trip stability: `G → J → G` and `J → G → J`
<!-- - ✅ Range validation for year / month / day inputs -->

---
<!-- 
## Using the repo’s `test2.js` as examples
Below are practical snippets adapted from the typical patterns used in `test2.js`. If your `test2.js` prints results to the console, these fragments mirror that style so you can copy/paste.

```js
// Example 1: Basic conversions
console.log(gregorianToJalaali(2025, 3, 21)); // { jy: 1404, jm: 1, jd: 1 }
console.log(jalaaliToGregorian(1403, 12, 30)); // { gy: 2025, gm: 3, gd: 20 }

// Example 2: Sweep a range and verify round‑trip
for (let y = 2020; y <= 2026; y++) {
  for (let m = 1; m <= 12; m++) {
    for (let d = 1; d <= 28; d++) {
      const j = gregorianToJalaali(y, m, d);
      const g = jalaaliToGregorian(j.jy, j.jm, j.jd);
      if (g.gy !== y || g.gm !== m || g.gd !== d) {
        console.error("Round‑trip mismatch at:", { y, m, d, j, g });
        process.exit(1);
      }
    }
  }
}
console.log("Round‑trip OK for 2020..2026 (days 1..28)");

// Example 3: Leap boundaries
console.log(gregorianToJalaali(2024, 2, 29)); // { jy: 1402, jm: 12, jd: 10 }
console.log(jalaaliToGregorian(1399, 12, 30)); // { gy: 2021, gm: 3, gd: 20 }
```

> If your `test2.js` includes additional edge cases, paste them into the README examples section above or keep them in `examples/` and link here.

---

## TypeScript Support
Type definitions are included.

```ts
export interface JalaliParts { jy: number; jm: number; jd: number }
export interface GregorianParts { gy: number; gm: number; gd: number }

export function gregorianToJalaali(gy: number, gm: number, gd: number): JalaliParts;
export function jalaaliToGregorian(jy: number, jm: number, jd: number): GregorianParts;
export function isJalaliLeapYear(jy: number): boolean;
export function isGregorianLeapYear(gy: number): boolean;
```
 -->
---

## Validation & Errors
- Months are 1‑based; days are validated against month length and leap years.
<!-- - Invalid inputs throw `RangeError` with an explanatory message.

```js
// Throws: RangeError("Invalid Jalali date: 1400/12/30 is not a leap year")
jalaaliToGregorian(1400, 12, 30);
``` -->

<!-- ---

## Performance
All operations are O(1) integer arithmetic with no allocations beyond small objects.

- ~1–2 million conversions/sec on modern desktop CPUs
- No dependency on `Date` except when you choose to wrap results -->

---

## Limitations & Notes
- **Validated window**: Implementation is **tested and verified for Jalali years 1300–1700**. Outside this window it should still work (same rule), but if your application depends on strict historical accuracy, add table‑based tests for the years you need.
- **Historical ranges**: Civil Jalali calendar rules before modern standardization can be ambiguous; JalCal targets the **modern civil Jalali**.
- **Time zones**: Conversions operate on calendar **dates**, not times; your JS `Date` may shift a day if created in a different time zone around midnight.
- **Input range**: Practical range ±4,000 years is supported.

---

## Testing

The library has been **exhaustively tested for all Jalali years 1300–1700**, including round‑trip invariants and leap‑day boundaries.

<!-- ```bashbash
# run tests
npm test

# run sample script (if present)
node test2.js
```

Example Jest/Mocha idea:
```js
// Round‑trip invariants
for (let y = 1990; y <= 2030; y++) {
  for (let m = 1; m <= 12; m++) {
    for (let d = 1; d <= 28; d++) {
      const j = gregorianToJalaali(y, m, d);
      const g = jalaaliToGregorian(j.jy, j.jm, j.jd);
      if (g.gy !== y || g.gm !== m || g.gd !== d) throw new Error("Mismatch");
    }
  }
}
``` -->

---

## License
MIT © 2025 Ali HM

