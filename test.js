// ============================================================
// اختبارات صارمة للدوال الأساسية
// ============================================================

// محاكاة localStorage
global.localStorage = {
  _data: {},
  getItem(key) { return this._data[key] || null; },
  setItem(key, val) { this._data[key] = val; },
  removeItem(key) { delete this._data[key]; }
};
global._memStore = {};
global._localStorageAvailable = true;
global.saveToStorage = function(key, value) {
  const str = JSON.stringify(value);
  try { localStorage.setItem(key, str); return true; } catch(e) { return false; }
};
global.loadFromStorage = function(key, defaultValue) {
  try {
    const data = localStorage.getItem(key);
    if (data === null) return defaultValue;
    return JSON.parse(data);
  } catch (e) { return defaultValue; }
};
// Wrapper for testing
global.isWorkAffected = function(system, ev) { return _isWorkAffected(system, ev); };

// تحميل ملف النظام
const fs = require('fs');
const systemCode = fs.readFileSync('/home/user/workspace/eval-project/system-data.js', 'utf8');
eval(systemCode);

let passCount = 0;
let failCount = 0;
let results = [];

function test(name, fn) {
  try {
    fn();
    passCount++;
    results.push(`✅ ${name}`);
  } catch (e) {
    failCount++;
    results.push(`❌ ${name}: ${e.message}`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

function approxEqual(a, b, eps = 0.001) {
  return Math.abs(a - b) < eps;
}

// ============================================================
// 1. حساب الأوزان الأساسية
// ============================================================

test('calculateWeights: فيلم واقعي مستقل', () => {
  const w = calculateWeights('live', 'film', 'independent');
  assert(approxEqual(w.narrative, 5), 'narrative should be 5');
  assert(approxEqual(w.production, 2.5), 'production should be 2.5');
  assert(approxEqual(w.performance, 1.5), 'performance should be 1.5');
  assert(approxEqual(w.value, 1), 'value should be 1');
  assert(!w.source, 'source should not exist');
  assert(!w.series, 'series should not exist');
});

test('calculateWeights: فيلم واقعي تابع', () => {
  const w = calculateWeights('live', 'film', 'derivative');
  assert(approxEqual(w.narrative, 4.5), 'narrative should be 4.5');
  assert(approxEqual(w.production, 2.5), 'production should be 2.5');
  assert(approxEqual(w.performance, 1), 'performance should be 1');
  assert(approxEqual(w.value, 1), 'value should be 1');
  assert(approxEqual(w.source, 1), 'source should be 1');
});

test('calculateWeights: فيلم أنمي مستقل', () => {
  const w = calculateWeights('anime', 'film', 'independent');
  assert(approxEqual(w.narrative, 5), 'narrative should be 5');
  assert(approxEqual(w.production, 3.5), 'production should be 3.5');
  assert(approxEqual(w.value, 1.5), 'value should be 1.5');
  assert(!w.performance, 'performance should not exist');
});

test('calculateWeights: سلسلة أفلام أنمي مستقلة', () => {
  const w = calculateWeights('anime', 'film_series', 'independent');
  assert(approxEqual(w.narrative, 4), 'narrative should be 4');
  assert(approxEqual(w.production, 3), 'production should be 3 (3.5-0.5)');
  assert(approxEqual(w.series, 1.5), 'series should be 1.5');
});

test('calculateWeights: سلسلة أفلام واقعية تابعة', () => {
  const w = calculateWeights('live', 'film_series', 'derivative');
  assert(approxEqual(w.narrative, 3.5), 'narrative should be 3.5 (5-0.5-1)');
  assert(approxEqual(w.series, 1), 'series should be 1');
  assert(approxEqual(w.source, 1), 'source should be 1');
});

test('calculateWeights: مجموع كل تكوين = 10', () => {
  const configs = [
    ['live', 'film', 'independent'],
    ['live', 'film', 'derivative'],
    ['anime', 'film', 'independent'],
    ['anime', 'film', 'derivative'],
    ['live', 'film_series', 'independent'],
    ['live', 'film_series', 'derivative'],
    ['anime', 'film_series', 'independent'],
    ['anime', 'film_series', 'derivative'],
    ['cgi', 'series', 'independent'],
    ['toon', 'limited_series', 'derivative'],
  ];
  for (const [m, f, r] of configs) {
    const w = calculateWeights(m, f, r);
    let total = 0;
    for (const k in w) total += w[k];
    assert(approxEqual(total, 10), `Weights for ${m}/${f}/${r} sum to ${total}, expected 10`);
  }
});

// ============================================================
// 2. sameWeights و isWeightOutdated
// ============================================================

test('sameWeights: أوزان متطابقة', () => {
  const a = { narrative: 5, production: 2.5, value: 1 };
  const b = { narrative: 5, production: 2.5, value: 1 };
  assert(sameWeights(a, b), 'same weights should be equal');
});

test('sameWeights: أوزان مختلفة', () => {
  const a = { narrative: 5, production: 2.5, value: 1 };
  const b = { narrative: 4.5, production: 2.5, value: 1 };
  assert(!sameWeights(a, b), 'different weights should not be equal');
});

test('sameWeights: فرق طفيف تحت التفاكنة', () => {
  const a = { narrative: 5 };
  const b = { narrative: 5.0001 };
  assert(sameWeights(a, b), 'tiny diff within tolerance');
});

test('isWeightOutdated: أوزان محدّثة', () => {
  const system = getEffectiveSystem();
  const ev = {
    status: 'completed',
    medium: 'live', format: 'film', relation: 'independent',
    weights: calculateWeights('live', 'film', 'independent')
  };
  assert(!isWeightOutdated(system, ev), 'should not be outdated');
});

test('isWeightOutdated: أوزان قديمة', () => {
  const system = getEffectiveSystem();
  const ev = {
    status: 'completed',
    medium: 'live', format: 'film', relation: 'independent',
    weights: { narrative: 4, production: 3, performance: 2, value: 1 }
  };
  assert(isWeightOutdated(system, ev), 'should be outdated');
});

test('isWeightOutdated: مسودة لا تُفحص', () => {
  const system = getEffectiveSystem();
  const ev = {
    status: 'draft',
    medium: 'live', format: 'film', relation: 'independent',
    weights: { narrative: 4 }
  };
  assert(!isWeightOutdated(system, ev), 'drafts should not be checked');
});

// ============================================================
// 3. matchesCondition مع المصفوفات
// ============================================================

test('matchesCondition: قيمة مفردة مطابقة', () => {
  const cond = { format: 'film' };
  const config = { format: 'film', medium: 'live' };
  assert(matchesCondition(cond, config), 'should match');
});

test('matchesCondition: قيمة مفردة غير مطابقة', () => {
  const cond = { format: 'film' };
  const config = { format: 'series', medium: 'live' };
  assert(!matchesCondition(cond, config), 'should not match');
});

test('matchesCondition: مصفوفة قيم مطابقة', () => {
  const cond = { format: ['film', 'short_film'] };
  const config = { format: 'film' };
  assert(matchesCondition(cond, config), 'should match array');
});

test('matchesCondition: مصفوفة قيم غير مطابقة', () => {
  const cond = { format: ['film', 'short_film'] };
  const config = { format: 'series' };
  assert(!matchesCondition(cond, config), 'should not match array');
});

test('matchesCondition: شروط متعددة', () => {
  const cond = { format: 'film', relation: 'derivative', nature: 'complementary' };
  const config = { format: 'film', relation: 'derivative', nature: 'complementary', medium: 'live' };
  assert(matchesCondition(cond, config), 'should match all conditions');
});

// ============================================================
// 4. حساب النتيجة
// ============================================================

test('calculateScore: نتيجة صحيحة لتقييم كامل', () => {
  const system = getEffectiveSystem();
  const config = { medium: 'live', format: 'film', relation: 'independent' };
  const scores = {};
  // أعطِ كل المعايير درجة 4 (ممتاز)
  const criteria = getApplicableCriteria(system, config);
  for (const c of criteria) scores[c.id] = 4;
  
  const result = calculateScore(system, config, scores);
  assert(result.allScored, 'all should be scored');
  assert(approxEqual(result.totalScore, 10, 0.01), `perfect scores should give 10, got ${result.totalScore}`);
});

test('calculateScore: نتيجة صفر لتقييم كامل', () => {
  const system = getEffectiveSystem();
  const config = { medium: 'live', format: 'film', relation: 'independent' };
  const scores = {};
  const criteria = getApplicableCriteria(system, config);
  for (const c of criteria) scores[c.id] = 0;
  
  const result = calculateScore(system, config, scores);
  assert(result.allScored, 'all should be scored');
  assert(approxEqual(result.totalScore, 0, 0.01), `zero scores should give 0, got ${result.totalScore}`);
});

test('calculateScore: نتيجة 5 للدرجة المتوسطة (2)', () => {
  const system = getEffectiveSystem();
  const config = { medium: 'live', format: 'film', relation: 'independent' };
  const scores = {};
  const criteria = getApplicableCriteria(system, config);
  for (const c of criteria) scores[c.id] = 2;
  
  const result = calculateScore(system, config, scores);
  assert(result.allScored, 'all should be scored');
  assert(approxEqual(result.totalScore, 5, 0.01), `middle scores should give 5, got ${result.totalScore}`);
});

test('calculateScore: تقييم غير مكتمل', () => {
  const system = getEffectiveSystem();
  const config = { medium: 'live', format: 'film', relation: 'independent' };
  const scores = {};
  const criteria = getApplicableCriteria(system, config);
  // أعطِ نصف المعايير درجات
  for (let i = 0; i < Math.floor(criteria.length / 2); i++) {
    scores[criteria[i].id] = 4;
  }
  
  const result = calculateScore(system, config, scores);
  assert(!result.allScored, 'should not be all scored');
});

test('calculateScore: نقاط فئة مكتملة تُحسب', () => {
  const system = getEffectiveSystem();
  const config = { medium: 'live', format: 'film', relation: 'independent' };
  const scores = {};
  // أكمل فئة القيمة فقط (6 معايير)
  const valueCriteria = getApplicableCriteria(system, config).filter(c => c.categoryId === 'value');
  for (const c of valueCriteria) scores[c.id] = 4;
  
  const result = calculateScore(system, config, scores);
  const valueCS = result.categoryScores.find(cs => cs.categoryId === 'value');
  assert(valueCS && valueCS.allScored, 'value category should be all scored');
  assert(!result.allScored, 'overall should not be all scored');
  
  // نقاط فئة القيمة = (4/4) * 1 = 1
  assert(approxEqual(valueCS.points, 1, 0.01), `value points should be 1, got ${valueCS.points}`);
});

// ============================================================
// 5. عدد المعايير المنطبقة
// ============================================================

test('getApplicableCriteria: فيلم واقعي مستقل = 25 معيار', () => {
  const system = getEffectiveSystem();
  const config = { medium: 'live', format: 'film', relation: 'independent' };
  const criteria = getApplicableCriteria(system, config);
  assert(criteria.length === 25, `expected 25, got ${criteria.length}`);
});

test('getApplicableCriteria: سلسلة أفلام واقعية تابعة = 34 معيار', () => {
  const system = getEffectiveSystem();
  const config = { medium: 'live', format: 'film_series', relation: 'derivative', nature: 'complementary' };
  const criteria = getApplicableCriteria(system, config);
  assert(criteria.length === 34, `expected 34, got ${criteria.length}`);
});

test('getApplicableCriteria: فيلم أنمي مستقل = 24 معيار', () => {
  const system = getEffectiveSystem();
  const config = { medium: 'anime', format: 'film', relation: 'independent' };
  const criteria = getApplicableCriteria(system, config);
  assert(criteria.length === 24, `expected 24, got ${criteria.length}`);
});

// ============================================================
// 6. توليد نص النسخ
// ============================================================

test('generateCopyText: يحتوي على اسم العمل', () => {
  const system = getEffectiveSystem();
  const ev = {
    name: 'عمل تجريبي',
    medium: 'live', format: 'film', relation: 'independent',
    status: 'completed',
    scores: {},
    weights: calculateWeights('live', 'film', 'independent'),
    totalScore: 0
  };
  const text = generateCopyText(system, ev);
  assert(text.includes('عمل تجريبي'), 'should contain work name');
});

test('generateCopyText: يحتوي على النتيجة النهائية', () => {
  const system = getEffectiveSystem();
  const config = { medium: 'live', format: 'film', relation: 'independent' };
  const scores = {};
  const criteria = getApplicableCriteria(system, config);
  for (const c of criteria) scores[c.id] = 3;
  
  const result = calculateScore(system, config, scores);
  const ev = {
    name: 'عمل تجريبي',
    medium: 'live', format: 'film', relation: 'independent',
    status: 'completed',
    scores: scores,
    weights: result.weights,
    totalScore: result.totalScore
  };
  const text = generateCopyText(system, ev);
  assert(text.includes('النتيجة النهائية'), 'should contain final score');
});

test('generateCopyText: لا يحتوي على فئات غير منطبقة', () => {
  const system = getEffectiveSystem();
  const ev = {
    name: 'عمل تجريبي',
    medium: 'live', format: 'film', relation: 'independent',
    status: 'completed',
    scores: {},
    weights: calculateWeights('live', 'film', 'independent'),
    totalScore: 0
  };
  const text = generateCopyText(system, ev);
  assert(!text.includes('العلاقة بالمصدر'), 'should not contain source layer');
  assert(!text.includes('سلسلة الأفلام'), 'should not contain series layer');
});

// ============================================================
// 7. الأوزان الكاملة مع فئات مخصصة
// ============================================================

test('calculateFullWeights: تطبيع إلى 10 مع فئة مخصصة', () => {
  const system = getEffectiveSystem();
  // أضف فئة مخصصة
  system.categories.push({
    id: 'custom.1', name: 'فئة مخصصة', layer: 'base', order: 7, custom: true,
    baseWeights: { live: 1, anime: 1, cgi: 1, toon: 1 }
  });
  
  const w = calculateFullWeights(system, 'live', 'film', 'independent');
  let total = 0;
  for (const k in w) total += w[k];
  assert(approxEqual(total, 10, 0.01), `total should be 10, got ${total}`);
  
  // نظّف
  system.categories = system.categories.filter(c => c.id !== 'custom.1');
});

// ============================================================
// 8. getCriterionText للمعايير ذات الأقسام
// ============================================================

test('getCriterionText: معيار استثمار العالم يفلتر الأقسام', () => {
  const system = getEffectiveSystem();
  const crit = system.criteria.find(c => c.id === 'source.1');
  assert(crit, 'source.1 should exist');
  
  // تكوين مشتق
  const config1 = { medium: 'live', format: 'film', relation: 'derivative', nature: 'derivative' };
  const text1 = getCriterionText(crit, config1);
  assert(text1.includes('مشتق'), 'should contain derivative section');
  assert(!text1.includes('هل يدمج العوالم أو الشخصيات المختلفة بصورة متماسكة'), 'should not contain crossover section text');
  
  // تكوين متقاطع
  const config2 = { medium: 'live', format: 'film', relation: 'derivative', nature: 'crossover' };
  const text2 = getCriterionText(crit, config2);
  assert(text2.includes('هل يدمج العوالم أو الشخصيات المختلفة بصورة متماسكة'), 'should contain crossover section text');
});

// ============================================================
// 9. formatNumber و formatPercent
// ============================================================

test('formatNumber: تقريب بمنزلة عشرية', () => {
  assert(formatNumber(8.28) === '8.3', `8.28 should format to 8.3, got ${formatNumber(8.28)}`);
  assert(formatNumber(5) === '5.0', `5 should format to 5.0, got ${formatNumber(5)}`);
  assert(formatNumber(0) === '0.0', `0 should format to 0.0, got ${formatNumber(0)}`);
});

test('formatPercent: نسبة صحيحة', () => {
  assert(formatPercent(5) === '50%', `5 should be 50%, got ${formatPercent(5)}`);
  assert(formatPercent(2.5) === '25%', `2.5 should be 25%, got ${formatPercent(2.5)}`);
  assert(formatPercent(1.5) === '15%', `1.5 should be 15%, got ${formatPercent(1.5)}`);
});

// ============================================================
// 10. توليد المعرّفات
// ============================================================

test('generateUUID: صيغة صحيحة', () => {
  const uuid = generateUUID();
  assert(typeof uuid === 'string', 'should be string');
  assert(uuid.length === 36, `should be 36 chars, got ${uuid.length}`);
  assert(uuid[8] === '-' && uuid[13] === '-' && uuid[18] === '-' && uuid[23] === '-', 'should have dashes');
});

// ============================================================
// النتائج
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('نتائج الاختبارات');
console.log('='.repeat(60));
for (const r of results) {
  console.log(r);
}
console.log('='.repeat(60));
console.log(`✅ نجح: ${passCount} | ❌ فشل: ${failCount} | الإجمالي: ${passCount + failCount}`);
console.log('='.repeat(60));

if (failCount > 0) process.exit(1);

// ============================================================
// 11. isWorkAffected مع المعايير المحذوفة
// ============================================================

test('isWorkAffected: حذف معيار يجعل العمل متأثرًا', () => {
  const system = getEffectiveSystem();
  const config = { medium: 'live', format: 'film', relation: 'independent' };
  const criteria = getApplicableCriteria(system, config);
  const ev = {
    criterionIds: criteria.map(c => c.id),
    medium: 'live', format: 'film', relation: 'independent', nature: null
  };
  assert(!isWorkAffected(system, ev), 'should not be affected initially');
  
  // احذف معيارًا
  const crit = system.criteria.find(c => c.id === 'value.1');
  crit.deleted = true;
  assert(isWorkAffected(system, ev), 'should be affected after criterion deletion');
  
  // استعد
  crit.deleted = false;
  assert(!isWorkAffected(system, ev), 'should not be affected after restore');
});

test('isWorkAffected: إضافة معيار جديد يجعل العمل متأثرًا', () => {
  const system = getEffectiveSystem();
  const config = { medium: 'live', format: 'film', relation: 'independent' };
  const criteria = getApplicableCriteria(system, config);
  const ev = {
    criterionIds: criteria.map(c => c.id),
    medium: 'live', format: 'film', relation: 'independent', nature: null
  };
  assert(!isWorkAffected(system, ev), 'should not be affected initially');
  
  // أضف معيارًا جديدًا
  system.criteria.push({
    id: 'value.99', categoryId: 'value', name: 'معيار جديد',
    wording: { default: 'اختبار' }, custom: true
  });
  assert(isWorkAffected(system, ev), 'should be affected after adding criterion');
  
  // نظّف
  system.criteria = system.criteria.filter(c => c.id !== 'value.99');
});

test('isWorkAffected: تغيير تكوين العمل لا يجعله متأثرًا', () => {
  const system = getEffectiveSystem();
  const config = { medium: 'live', format: 'film', relation: 'independent' };
  const criteria = getApplicableCriteria(system, config);
  const ev = {
    criterionIds: criteria.map(c => c.id),
    medium: 'live', format: 'film', relation: 'independent', nature: null
  };
  assert(!isWorkAffected(system, ev), 'should not be affected with same config');
});

// ============================================================
// 12. الفئات المخصصة مع معايير
// ============================================================

test('calculateScore: فئة مخصصة بمعيار تدخل في الحساب', () => {
  const system = getEffectiveSystem();
  // أضف فئة مخصصة
  system.categories.push({
    id: 'custom.1', name: 'فئة مخصصة', layer: 'base', order: 7, custom: true,
    baseWeights: { live: 1, anime: 1, cgi: 1, toon: 1 }
  });
  // أضف معيارًا للفئة المخصصة
  system.criteria.push({
    id: 'custom.1.1', categoryId: 'custom.1', name: 'معيار مخصص',
    wording: { default: 'اختبار' }, custom: true
  });
  
  const config = { medium: 'live', format: 'film', relation: 'independent' };
  const criteria = getApplicableCriteria(system, config);
  
  // تأكد أن المعيار المخصص ضمن المعايير المنطبقة
  const customCrit = criteria.find(c => c.id === 'custom.1.1');
  assert(customCrit, 'custom criterion should be in applicable criteria');
  
  // أعطِ كل المعايير درجة 4
  const scores = {};
  for (const c of criteria) scores[c.id] = 4;
  
  const result = calculateScore(system, config, scores);
  assert(result.allScored, 'all should be scored');
  
  // تحقق من ظهور الفئة المخصصة في النتيجة
  const customCS = result.categoryScores.find(cs => cs.categoryId === 'custom.1');
  assert(customCS, 'custom category should appear in results');
  assert(customCS.allScored, 'custom category should be all scored');
  
  // نظّف
  system.categories = system.categories.filter(c => c.id !== 'custom.1');
  system.criteria = system.criteria.filter(c => c.id !== 'custom.1.1');
});

// ============================================================
// 13. نسخ الصياغة حسب الصيغة
// ============================================================

test('getCriterionWording: نسخ مختلفة حسب الصيغة', () => {
  const system = getEffectiveSystem();
  const crit = system.criteria.find(c => c.id === 'narrative.9');
  assert(crit, 'narrative.9 should exist');
  
  const filmText = getCriterionWording(crit, 'film');
  const seriesText = getCriterionWording(crit, 'series');
  const shortText = getCriterionWording(crit, 'short_film');
  
  assert(filmText !== seriesText, 'film and series should have different wording');
  assert(filmText !== shortText, 'film and short_film should have different wording');
  assert(seriesText !== shortText, 'series and short_film should have different wording');
});

test('getCriterionWording: limited_series له صياغة خاصة', () => {
  const system = getEffectiveSystem();
  const crit = system.criteria.find(c => c.id === 'narrative.9');
  const limitedText = getCriterionWording(crit, 'limited_series');
  const defaultText = crit.wording.default;
  
  assert(limitedText !== defaultText, 'limited_series should have its own wording, not default');
  assert(crit.wording.limited_series, 'limited_series wording should exist');
});

test('getCriterionWording: صيغة بدون صياغة خاصة تستخدم الافتراضي', () => {
  const system = getEffectiveSystem();
  const crit = system.criteria.find(c => c.id === 'narrative.2');
  // narrative.2 ليس له صياغات خاصة
  const filmText = getCriterionWording(crit, 'film');
  const seriesText = getCriterionWording(crit, 'series');
  
  assert(filmText === seriesText, 'film and series should both use default');
  assert(filmText === crit.wording.default, 'should use default wording');
});

// ============================================================
// 14. isWorkAffected مع تغيير شروط الفلترة
// ============================================================

test('isWorkAffected: تغيير شروط معيار يجعل العمل متأثرًا', () => {
  const system = getEffectiveSystem();
  const config = { medium: 'live', format: 'film', relation: 'independent' };
  const criteria = getApplicableCriteria(system, config);
  const ev = {
    criterionIds: criteria.map(c => c.id),
    medium: 'live', format: 'film', relation: 'independent', nature: null
  };
  assert(!isWorkAffected(system, ev), 'should not be affected initially');
  
  // أضف شرطًا لمعيار قائم يجعله لا ينطبق على هذا التكوين
  const crit = system.criteria.find(c => c.id === 'value.1');
  const oldConditions = crit.conditions;
  crit.conditions = { medium: 'anime' }; // الآن لا ينطبق على الواقعي
  assert(isWorkAffected(system, ev), 'should be affected after changing conditions');
  
  // استعد
  crit.conditions = oldConditions;
  assert(!isWorkAffected(system, ev), 'should not be affected after restore');
});

// ============================================================
// إعادة النتائج النهائية
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('نتائج الاختبارات');
console.log('='.repeat(60));
for (const r of results) {
  console.log(r);
}
console.log('='.repeat(60));
console.log(`✅ نجح: ${passCount} | ❌ فشل: ${failCount} | الإجمالي: ${passCount + failCount}`);
console.log('='.repeat(60));

if (failCount > 0) process.exit(1);
