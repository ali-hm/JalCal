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
            console.log(diffJalaaliDays(1404,6,23, 1404,5,23)); // 31
            // -----------------------------
            // تست‌ها
            // -----------------------------
            function runTests() {
            console.log("=== تست‌های مرزی جلالی ↔ میلادی ===");

            const tests = [
                { g:[2020,3,20], j:[1399,1,1] }, // نوروز کبیسه
                { g:[2020,3,19], j:[1398,12,29] },
                { g:[2021,3,21], j:[1400,1,1] },
                { g:[2023,3,21], j:[1402,1,1] },
                { g:[2024,3,20], j:[1403,1,1] }, // نوروز کبیسه
                { g:[2025,3,21], j:[1404,1,1] },
                { g:[2025,8,23], j:[1404,6,1] }, // مرز خطا
                { g:[2026,3,20], j:[1404,12,29] },
                { g:[2028,3,20], j:[1407,1,1] },
                { g:[2028,3,19], j:[1406,12,29] },
                { g:[2029,3,20], j:[1408,1,1] }, // کبیسه
            ];

            tests.forEach((t,i)=>{
                const j = gregorianToJalaali.apply(null,t.g);
                const g = jalaaliToGregorian.apply(null,t.j);
                console.log(`\n[Test ${i+1}]`);
                console.log(`Gregorian ${t.g.join("-")} → Jalaali ${j}  (expected ${t.j.join("-")})`);
                console.log(`Jalaali   ${t.j.join("-")} → Gregorian ${g}  (expected ${t.g.join("-")})`);
            });

            console.log("\n=== تست کبیسه ===");
            [1399,1400,1403,1404,1408].forEach(y=>{
                console.log(`Year ${y} is leap? ${isJalaaliLeap(y)}`);
            });
            }

            runTests();