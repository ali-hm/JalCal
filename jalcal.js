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

// روز سال گریگوری که نوروزِ سالِ jy در آن می‌افتد (با توجه به leap بودن همان gyRef)
function gregorianNewYearDayOfYear(jy, gyRef) {
  const feb = isGregorianLeap(gyRef) ? 29 : 28;
  // نوروز: اگر سال جلالی کبیسه باشد 20 مارس، در غیر اینصورت 21 مارس
  // عدد روزسال: 31(ژانویه) + feb + 20/21
  return (isJalaaliLeap(jy) ? (31 + feb + 20) : (31 + feb + 21));
}

// ---------- Conversions ----------
// Jalaali -> Gregorian
function jalaaliToGregorian(jy, jm, jd) {
  const gy = jy + 621;
  const jDOY = jalaaliDayOfYear(jy, jm, jd);             // 1..365/366
  let gDayOfYear = gregorianNewYearDayOfYear(jy, gy) + jDOY - 1; // 1-based

  const dim = G_DAYS_IN_MONTH.slice();
  if (isGregorianLeap(gy)) dim[1] = 29;

  let gm = 1;
  for (let i = 0; i < 12; i++) {
    if (gDayOfYear <= dim[i]) { gm = i + 1; break; }
    gDayOfYear -= dim[i];
  }
  const gd = gDayOfYear;
  return [gy, gm, gd];
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

// ================== Quick self-tests ==================
console.log("Leap Jalaali (should be true): 1399, 1403, 1408");
console.log(isJalaaliLeap(1399), isJalaaliLeap(1403), isJalaaliLeap(1408));
console.log("Not leap (should be false): 1404, 1405");
console.log(isJalaaliLeap(1404), isJalaaliLeap(1405));

console.log("G→J 2025-08-23 → should be 1404-06-01");
console.log(gregorianToJalaali(2025,8,23)); // [1404,6,1]

console.log("G→J 2025-03-21 → 1404-01-01");
console.log(gregorianToJalaali(2025,3,21)); // [1404,1,1]

console.log("G→J 2025-03-20 → 1403-12-30");
console.log(gregorianToJalaali(2025,3,20)); // [1403,12,30]

console.log("J→G 1404-06-01 → 2025-08-23");
console.log(jalaaliToGregorian(1404,6,1));  // [2025,8,23]

console.log("J→G 1403-01-01 → 2024-03-20");
console.log(jalaaliToGregorian(1403,1,1));  // [2024,3,20]

console.log("Week/day-of-year examples (weekStart=6=شنبه)");
console.log(jalaaliDateInfo(1404,6,1,6), gregorianDateInfo(2025,8,23,6));

console.log("Add/Sub Jalaali days around Nowruz:");
console.log(addJalaaliDays(1403,12,30, +1)); // 1404/01/01
console.log(addJalaaliDays(1404,1,1, -1)); // 1403/12/30

console.log("Diff days:");
console.log(diffJalaaliDays(1404,1,1, 1403,12,30)); // 1
console.log(diffGregorianDays(2025,8,23, 2025,8,22)); // 1
