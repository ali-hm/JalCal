// ... فرض بر اینه که توابع اصلی شما در همین اسکوپ هستند (یا import شده‌اند) ...

let FAIL = 0, PASS = 0;
function fmtG(g){ return `${g[0]}-${String(g[1]).padStart(2,'0')}-${String(g[2]).padStart(2,'0')}`; }
function fmtJ(j){ return `${j[0]}-${String(j[1]).padStart(2,'0')}-${String(j[2]).padStart(2,'0')}`; }
function eqArr(a, b) {
  return Array.isArray(a) && Array.isArray(b) &&
         a.length === b.length &&
         a.every((v, i) => Object.is(v, b[i]));
}

function assertEq(actual, expected, msg) {
  const t = typeof expected;
  let ok;

  if (t === 'number' || t === 'string' || t === 'boolean' || expected == null) {
    ok = Object.is(actual, expected);
  } else if (Array.isArray(expected)) {
    ok = eqArr(actual, expected);
  } else {
    // اگر روزی خواستی برای object هم مقایسه‌ی عمیق کنی، اینجا اضافه کن
    ok = false;
  }

  if (!ok) {
    console.error('❌', msg, '\n   expected:', expected, '\n   actual  :', actual);
    FAIL++;
  } else {
    PASS++;
  }
}

function header(title){ console.log('\n=== ' + title + ' ==='); }

// ---------- موارد ثابتِ گزارش‌شده ----------
header('Fixed cases (one-way correctness)');

const fixedJG = [
  { j:[1398,12,29], g:[2020,3,19] },
  { j:[1399,12,30], g:[2021,3,20] },
  { j:[1400,1,1],   g:[2021,3,21] },
  { j:[1403,1,1],   g:[2024,3,20] },
  { j:[1403,12,30], g:[2025,3,20] },
  { j:[1404,1,1],   g:[2025,3,21] },
  { j:[1404,6,1],   g:[2025,8,23] },
  { j:[1404,12,29], g:[2026,3,20] },
  { j:[1407,1,1],   g:[2028,3,20] }, // r=123 → نوروز ۲۰ مارس
  { j:[1408,1,1],   g:[2029,3,20] }, 
  { j:[1408,12,30], g:[2030,3,20] },
  { j:[1409,1,1],   g:[2030,3,21] }, // r=124 → نوروز ۲۱ مارس
  { j:[1581,12,30], g:[2203,3,21] },
  { j:[1680,12,30], g:[2302,3,21] },

  // --- Esfand 29 → March 20 historical cases ---
  { j:[1353,12,29], g:[1975,3,20] },
  { j:[1357,12,29], g:[1979,3,20] },
  { j:[1361,12,29], g:[1983,3,20] },
  { j:[1365,12,29], g:[1987,3,20] },
  { j:[1369,12,29], g:[1991,3,20] },
  { j:[1373,12,29], g:[1995,3,20] },
  { j:[1411,12,29], g:[2033,3,19] },
  { j:[1415,12,29], g:[2037,3,19] },
  { j:[1419,12,29], g:[2041,3,19] },
  { j:[1423,12,29], g:[2045,3,19] },
  { j:[1427,12,29], g:[2049,3,19] },
  { j:[1431,12,29], g:[2053,3,19] },
  { j:[1435,12,29], g:[2057,3,19] },
  { j:[1440,12,29], g:[2062,3,19] },
  { j:[1444,12,29], g:[2066,3,19] },
  { j:[1448,12,29], g:[2070,3,19] },
  { j:[1452,12,29], g:[2074,3,19] },
  { j:[1456,12,29], g:[2078,3,19] },
  { j:[1460,12,29], g:[2082,3,19] },
  { j:[1464,12,29], g:[2086,3,19] },
  { j:[1468,12,29], g:[2090,3,19] },
  { j:[1473,12,29], g:[2095,3,19] },
  { j:[1477,12,29], g:[2099,3,19] },
  { j:[1481,12,29], g:[2103,3,20] },
  { j:[1485,12,29], g:[2107,3,20] },
  { j:[1489,12,29], g:[2111,3,20] },
  { j:[1493,12,29], g:[2115,3,20] },
  { j:[1497,12,29], g:[2119,3,20] },
];

for (const {j,g} of fixedJG) {
  assertEq(jalaaliToGregorian(...j), g, `J→G  ${fmtJ(j)} -> ${fmtG(g)}`);
  assertEq(gregorianToJalaali(...g), j, `G→J  ${fmtG(g)} -> ${fmtJ(j)}`);
}

// ---------- لبه‌های نوروز (با اصلاح jPrev برای ۱۴۰۷) ----------
header('Edges around Nowruz');

const edges = [
  { j:[1399,1,1], g:[2020,3,20], jPrev:[1398,12,29], gPrev:[2020,3,19] },
  { j:[1400,1,1], g:[2021,3,21], jPrev:[1399,12,30], gPrev:[2021,3,20] },
  { j:[1407,1,1], g:[2028,3,20], jPrev:[1406,12,29], gPrev:[2028,3,19] }, // ← اصلاح شد
  { j:[1408,1,1], g:[2029,3,20], jPrev:[1407,12,29], gPrev:[2029,3,19] },
];

for (const e of edges) {
  assertEq(jalaaliToGregorian(...e.j), e.g, `Nowruz J→G ${fmtJ(e.j)} -> ${fmtG(e.g)}`);
  assertEq(gregorianToJalaali(...e.g), e.j, `Nowruz G→J ${fmtG(e.g)} -> ${fmtJ(e.j)}`);
  assertEq(addJalaaliDays(...e.j, -1), e.jPrev, `Prev day J (day -1): ${fmtJ(e.j)} -> ${fmtJ(e.jPrev)}`);
  assertEq(addGregorianDays(...e.g, -1), e.gPrev, `Prev day G (day -1): ${fmtG(e.g)} -> ${fmtG(e.gPrev)}`);
}

// ---------- چک صریح کبیسه‌بودن جلالی ----------
header('Leap-year sanity (Jalaali)');

const leapExpect = {
  1398:false, 1399:true, 1400:false, 1401:false, 1402:false, 1403:true,
  1404:false, 1405:false, 1406:false, 1407:false, 1408:true, 1409:false
};
for (const [ys, exp] of Object.entries(leapExpect)) {
  const y = +ys;
  assertEq(isJalaaliLeap(y), exp, `isJalaaliLeap(${y})`);
  assertEq(daysInJalaaliMonth(y,12), exp ? 30 : 29, `Esfand days in ${y}`);
}

// «روز قبل از ۱ فروردین» باید آخر اسفند سال قبل باشد با طول درست
for (let jy = 1390; jy <= 1410; jy++) {
  const prev = addJalaaliDays(jy,1,1,-1);
  const expected = [jy-1, 12, isJalaaliLeap(jy-1) ? 30 : 29];
  assertEq(prev, expected, `Prev of ${jy}-01-01 is Esfand-end of ${jy-1}`);
}

// ---------- استثناءهای روز دقیق نوروز ----------
header('Nowruz day-of-March exceptions');

assertEq(marchDayOfNowruz(1407), 20, 'marchDayOfNowruz(1407) = 20 (r=123)');
assertEq(marchDayOfNowruz(1408), 20, 'marchDayOfNowruz(1408) = 20 (r=123)');
assertEq(marchDayOfNowruz(1409), 21, 'marchDayOfNowruz(1409) = 21 (r=124)');

// ---------- Round-trip روی بازه‌ها ----------
header('Round-trip (bijectivity) over ranges (quick)');

// بازه‌ی میلادی جمع‌وجور برای سرعت (می‌تونی بزرگ‌تر هم بکنی)
(function testGregorianRange() {
  for (let gy = 1900; gy <= 2500; gy++) {
    const dim = [31, (isGregorianLeap(gy)?29:28),31,30,31,30,31,31,30,31,30,31];
    for (let gm = 1; gm <= 12; gm++) {
      for (let gd = 1; gd <= dim[gm-1]; gd++) {
        const j = gregorianToJalaali(gy,gm,gd);
        const g = jalaaliToGregorian(...j);
        if (!eqArr(g, [gy,gm,gd])) {
          assertEq(g, [gy,gm,gd], `Round-trip G→J→G failed at ${fmtG([gy,gm,gd])} (via ${fmtJ(j)})`);
        } else { PASS++; }
      }
    }
  }
})();

// بازه‌ی جلالی
(function testJalaaliRange() {
  for (let jy = 1300; jy <= 1700; jy++) {
    for (let jm = 1; jm <= 12; jm++) {
      const dimJ = daysInJalaaliMonth(jy, jm);
      for (let jd = 1; jd <= dimJ; jd++) {
        const g = jalaaliToGregorian(jy, jm, jd);
        const j = gregorianToJalaali(...g);
        if (!eqArr(j, [jy,jm,jd])) {
          assertEq(j, [jy,jm,jd], `Round-trip J>G>J failed at ${fmtJ([jy,jm,jd])} (via ${fmtG(g)})`);
        } else { PASS++; }
      }
    }
  }
})();

// ---------- پایان سال‌های کبیسه (Esfand-30) ----------
header('End-of-year leap Esfand-30 cases');

// سال 1399 (leap) → باید 1399-12-30 وجود داشته باشه و 1400-01-01 بعدش
(function() {
  const jEnd = [1399,12,30];
  assertEq(isJalaaliLeap(1399), true, '1399 is leap');
  const gEnd = jalaaliToGregorian(...jEnd);
  const jNext = addJalaaliDays(...jEnd, +1);
  const gNext = jalaaliToGregorian(...jNext);
  assertEq(jNext, [1400,1,1], 'After 1399-12-30 → 1400-01-01');
  assertEq(gregorianToJalaali(...gNext), jNext, 'Round-trip after 1399-12-30');
})();

// سال 1403 (leap) → باید 1403-12-30 وجود داشته باشه و 1404-01-01 بعدش
(function() {
  const jEnd = [1403,12,30];
  assertEq(isJalaaliLeap(1403), true, '1403 is leap');
  const gEnd = jalaaliToGregorian(...jEnd);
  const jNext = addJalaaliDays(...jEnd, +1);
  const gNext = jalaaliToGregorian(...jNext);
  assertEq(jNext, [1404,1,1], 'After 1403-12-30 → 1404-01-01');
  assertEq(gregorianToJalaali(...gNext), jNext, 'Round-trip after 1403-12-30');
})();

// سال 1408 (leap, استثناء نوروز) → باید 1408-12-30 وجود داشته باشه و 1409-01-01 بعدش
(function() {
  const jEnd = [1408,12,30];
  assertEq(isJalaaliLeap(1408), true, '1408 is leap');
  const gEnd = jalaaliToGregorian(...jEnd);
  const jNext = addJalaaliDays(...jEnd, +1);
  const gNext = jalaaliToGregorian(...jNext);
  assertEq(jNext, [1409,1,1], 'After 1408-12-30 → 1409-01-01');
  assertEq(gregorianToJalaali(...gNext), jNext, 'Round-trip after 1408-12-30');
})();

assertEq(jalaaliToGregorian(1408,12,30), [2030,3,20], '1408-12-30 → 2030-03-20');
assertEq(addJalaaliDays(1408,12,30, +1), [1409,1,1], 'next day after 1408-12-30 is 1409-01-01');

// ---------- summary ----------
console.log(`\n✅ Passed: ${PASS}  ❌ Failed: ${FAIL}`);
//if (FAIL > 0) { process.exitCode = 1; }
