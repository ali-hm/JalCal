/*!
 * JalCal - Gregorian ⇄ Jalali date conversion without Julian Day
 * 
 * Copyright (C) 2025 Ali Hamidi
 * https://github.com/ali-hm
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

// ================== Jalaali & Gregorian Utils (No Date/JDN) ==================

// ---------- Jalaali leap rule (Behrooz–Birashk, remainder mod 128) ----------
const J_REMAINDERS = new Set([
  0, 4, 8, 12, 16, 20, 24, 29, 33, 37, 41, 45, 49, 53, 57,
  62, 66, 70, 74, 78, 82, 86, 90, 95, 99, 103, 107, 111, 115, 119, 124
]);
// پرانتزی‌ها فقط برای سال‌های <= 473 اعمال می‌شوند و به «عدد قبل» نگاشت می‌شوند:
const J_PAREN_REPLACEMENTS = { 25:24, 51:50, 98:97, 120:119 };

// افست 124 برای سالِ حسابی (کلید مهم اصلاح!)
function isJalaaliLeap(jy) {
  let r = (jy + 124) % 128;
  if (jy <= 473 && J_PAREN_REPLACEMENTS[r] !== undefined) r = J_PAREN_REPLACEMENTS[r];
  return J_REMAINDERS.has(r);
}

function daysInJalaaliMonth(jy, jm) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isJalaaliLeap(jy) ? 30 : 29;
}

function jalaaliDayOfYear(jy, jm, jd) {
  return (jm <= 6) ? (jm - 1) * 31 + jd : 6 * 31 + (jm - 7) * 30 + jd;
}

// ---------- Gregorian basics ----------
const G_DAYS_IN_MONTH = [31,28,31,30,31,30,31,31,30,31,30,31];

// کمک‌تابع: روزهای ماه‌های میلادی برای سال مشخص
function gregorianMonthDaysOf(year) {
  const a = G_DAYS_IN_MONTH.slice();
  if (isGregorianLeap(year)) a[1] = 29;
  return a;
}

function isGregorianLeap(gy) {
  return (gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0);
}

function gregorianDayOfYear(gy, gm, gd) {
  const dim = G_DAYS_IN_MONTH.slice();
  if (isGregorianLeap(gy)) dim[1] = 29;
  let d = gd;
  for (let i = 0; i < gm - 1; i++) d += dim[i];
  return d; // 1..365/366
}


// ---------- Conversions ----------
// Jalaali -> Gregorian
function jResidue128(jy) {
  let r = (jy + 124) % 128;
  if (r < 0) r += 128;
  if (jy <= 473) {
    const P = { 25:24, 51:50, 98:97, 120:119 };
    if (P[r] !== undefined) r = P[r];
  }
  return r;
}

// نوروزِ سالِ jy در مارسِ سالِ میلادی (jy+621): فقط 20 یا 21
// لنگر: 1399-01-01 = 2020-03-20 ⇒ M(1399)=20
function marchDayOfNowruz(jy) {
  let y = 1399;
  let M = 20;

  if (jy === y) return M;

  if (jy > y) {
    for (let k = y; k < jy; k++) {
      const L = isJalaaliLeap(k) ? 366 : 365;
      const gNext = k + 622; // سال گریگوریِ بعدی
      const delta = L - 365 - (isGregorianLeap(gNext) ? 1 : 0);
      M += delta; // ❗️بدون هیچ clamp
    }
    return M;
  } else {
    for (let k = y - 1; k >= jy; k--) {
      const L = isJalaaliLeap(k) ? 366 : 365;
      const gNext = k + 622;
      const delta = L - 365 - (isGregorianLeap(gNext) ? 1 : 0);
      M -= delta; // M(k) = M(k+1) - delta، ❗️بدون clamp
    }
    return M;
  }
}





// روزِ سال گریگوری که نوروزِ سالِ jy در آن می‌افتد
function gregorianNewYearDayOfYear(jy, gyRef) {
  const feb = isGregorianLeap(gyRef) ? 29 : 28;
  return 31 + feb + marchDayOfNowruz(jy);
}

// Jalaali -> Gregorian (اصلاحِ کاملِ عبور از دسامبر به ژانویه)
function jalaaliToGregorian(jy, jm, jd) {
  // سال میلادی‌ای که نوروزِ این سال جلالی در آن قرار می‌گیرد
  let gy = jy + 621;

  // روزِ سالِ جلالی (۱..۳۶۵/۳۶۶)
  const jDOY = jalaaliDayOfYear(jy, jm, jd);

  // از روز مارس (۲۰/۲۱) شروع می‌کنیم
  let d = marchDayOfNowruz(jy) + jDOY - 1; // شمارنده‌ی «روز از مارس»
  let m = 2;                                // ایندکس ماه: 0=Jan ... 2=Mar

  // آرایه‌ی روزهای ماه‌ها برای همین سال میلادی
  let dim = gregorianMonthDaysOf(gy);

  // از مارس تا دسامبر می‌رویم؛ اگر تمام شد، سال +1 و از ژانویه ادامه می‌دهیم
  while (true) {
    if (d <= dim[m]) {
      // در همین ماه جا می‌گیرد
      const gm = m + 1;
      const gd = d;
      return [gy, gm, gd];
    }
    // از این ماه عبور می‌کنیم
    d -= dim[m];
    m++;

    // عبور از دسامبر -> ژانویه سال بعد
    if (m >= 12) {
      m = 0;
      gy += 1;
      dim = gregorianMonthDaysOf(gy);
    }
  }
}



// Gregorian -> Jalaali
function gregorianToJalaali(gy, gm, gd) {
  const gDOY = gregorianDayOfYear(gy, gm, gd);
  const jyCandidate = gy - 621;

  // نوروز سال jyCandidate در همین سال گریگوری gy
  const nwdCurr = gregorianNewYearDayOfYear(jyCandidate, gy);

  let jy, jDOY;
  if (gDOY >= nwdCurr) {
    // از نوروز همین سال جلالی (در همین gy) به بعد
    jy = jyCandidate;
    jDOY = gDOY - nwdCurr + 1;
  } else {
    // قبل از نوروز همین سال جلالی: جزو سال جلالی قبل است
    jy = jyCandidate - 1;
    const prevTotal = isGregorianLeap(gy - 1) ? 366 : 365;
    const nwdPrev = gregorianNewYearDayOfYear(jy, gy - 1);
    // فاصله از نوروزِ سال قبل (در gy-1) تا انتهای آن سال + روزسال جاری
    jDOY = (prevTotal - nwdPrev + 1) + gDOY;
  }

  let jm, jd;
  if (jDOY <= 186) {
    jm = Math.ceil(jDOY / 31);
    jd = jDOY - (jm - 1) * 31;
  } else {
    const t = jDOY - 186;
    jm = Math.ceil(t / 30) + 6;
    jd = t - (jm - 7) * 30;
  }
  return [jy, jm, jd];
}

// ---------- Weekday (0=شنبه ... 6=جمعه) ----------
function gregorianWeekday(gy, gm, gd) {
  // Zeller's congruence (returns 0=Saturday)
  if (gm < 3) { gm += 12; gy -= 1; }
  const K = gy % 100;
  const J = Math.floor(gy / 100);
  return (gd + Math.floor(13 * (gm + 1) / 5) + K + Math.floor(K / 4) + Math.floor(J / 4) + 5 * J) % 7;
}

function jalaaliWeekday(jy, jm, jd) {
  const [gy, gm, gd] = jalaaliToGregorian(jy, jm, jd);
  return gregorianWeekday(gy, gm, gd); // 0=شنبه ... 6=جمعه
}

// ---------- Day-of-year & Week-of-year ----------
function getWeekOfYear(dayOfYear, weekday, weekStart = 6 /* 0=شنبه ... 6=جمعه; پیش‌فرض=شنبه */) {
  // weekday هم با همان نگاشت 0=شنبه ... 6=جمعه
  const offset = (weekday - weekStart + 7) % 7;
  return Math.floor((dayOfYear + offset - 1) / 7) + 1;
}

function jalaaliDateInfo(jy, jm, jd, weekStart = 6) {
  const weekday = jalaaliWeekday(jy, jm, jd);
  const dayOfYear = jalaaliDayOfYear(jy, jm, jd);
  const weekOfYear = getWeekOfYear(dayOfYear, weekday, weekStart);
  return { weekday, dayOfYear, weekOfYear };
}

function gregorianDateInfo(gy, gm, gd, weekStart = 6) {
  const weekday = gregorianWeekday(gy, gm, gd);
  const dayOfYear = gregorianDayOfYear(gy, gm, gd);
  const weekOfYear = getWeekOfYear(dayOfYear, weekday, weekStart);
  return { weekday, dayOfYear, weekOfYear };
}

// ---------- Add/Subtract: Jalaali ----------
function addJalaaliDays(jy, jm, jd, days) {
  jd += days;
  while (jd > daysInJalaaliMonth(jy, jm)) {
    jd -= daysInJalaaliMonth(jy, jm);
    jm++; if (jm > 12) { jm = 1; jy++; }
  }
  while (jd <= 0) {
    jm--; if (jm < 1) { jm = 12; jy--; }
    jd += daysInJalaaliMonth(jy, jm);
  }
  return [jy, jm, jd];
}

function addJalaaliMonths(jy, jm, jd, months) {
  let total = jm - 1 + months;
  jy += Math.floor(total / 12);
  jm = (total % 12) + 1;
  if (jm <= 0) { jm += 12; jy--; }
  const dim = daysInJalaaliMonth(jy, jm);
  if (jd > dim) jd = dim;
  return [jy, jm, jd];
}

function addJalaaliYears(jy, jm, jd, years) {
  jy += years;
  const dim = daysInJalaaliMonth(jy, jm);
  if (jd > dim) jd = dim;
  return [jy, jm, jd];
}

// ---------- Add/Subtract: Gregorian ----------
function addGregorianDays(gy, gm, gd, days) {
  const dim = G_DAYS_IN_MONTH.slice();
  gd += days;
  if (isGregorianLeap(gy)) dim[1] = 29;

  while (gd > dim[gm - 1]) {
    gd -= dim[gm - 1];
    gm++; if (gm > 12) { gm = 1; gy++; dim[1] = isGregorianLeap(gy) ? 29 : 28; }
  }
  while (gd <= 0) {
    gm--; if (gm < 1) { gm = 12; gy--; dim[1] = isGregorianLeap(gy) ? 29 : 28; }
    gd += G_DAYS_IN_MONTH[gm - 1] + (gm === 2 && isGregorianLeap(gy) ? 1 : 0);
  }
  return [gy, gm, gd];
}

function addGregorianMonths(gy, gm, gd, months) {
  let total = gm - 1 + months;
  gy += Math.floor(total / 12);
  gm = (total % 12) + 1;
  if (gm <= 0) { gm += 12; gy--; }
  const dim = G_DAYS_IN_MONTH.slice();
  if (isGregorianLeap(gy)) dim[1] = 29;
  if (gd > dim[gm - 1]) gd = dim[gm - 1];
  return [gy, gm, gd];
}

function addGregorianYears(gy, gm, gd, years) {
  gy += years;
  const dim = G_DAYS_IN_MONTH.slice();
  if (isGregorianLeap(gy)) dim[1] = 29;
  if (gd > dim[gm - 1]) gd = dim[gm - 1];
  return [gy, gm, gd];
}

// ---------- Differences in days ----------
function diffJalaaliDays(jy1, jm1, jd1, jy2, jm2, jd2) {
  // تبدیل به "روز مطلق" از سال 1
  function yearDaysToStart(jy) {
    let s = 0;
    for (let y = 1; y < jy; y++) s += isJalaaliLeap(y) ? 366 : 365;
    return s;
  }
  const d1 = yearDaysToStart(jy1) + jalaaliDayOfYear(jy1, jm1, jd1);
  const d2 = yearDaysToStart(jy2) + jalaaliDayOfYear(jy2, jm2, jd2);
  return d1 - d2;
}

function diffGregorianDays(gy1, gm1, gd1, gy2, gm2, gd2) {
  function toDays(gy, gm, gd) {
    let s = 0;
    for (let y = 1; y < gy; y++) s += isGregorianLeap(y) ? 366 : 365;
    const dim = G_DAYS_IN_MONTH.slice();
    if (isGregorianLeap(gy)) dim[1] = 29;
    for (let m = 0; m < gm - 1; m++) s += dim[m];
    return s + gd;
  }
  return toDays(gy1, gm1, gd1) - toDays(gy2, gm2, gd2);
}


