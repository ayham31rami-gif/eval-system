// ============================================================
// نظام تقييم الأعمال الفنية — بيانات النظام الأساسية
// ============================================================

const SCHEMA_VERSION = 1;

// --- الخيارات الثابتة ---
const MEDIA = {
  live: 'واقعي',
  anime: 'أنمي',
  cgi: 'رسوم متحركة ثلاثية الأبعاد (CGI)',
  toon: 'كرتون (رسوم متحركة ثنائية الأبعاد)'
};

const FORMATS = {
  film: 'فيلم',
  short_film: 'فيلم قصير',
  series: 'مسلسل',
  limited_series: 'مسلسل محدود',
  film_series: 'سلسلة أفلام'
};

const RELATIONS = {
  independent: 'مستقل',
  derivative: 'تابع'
};

const NATURES = {
  complementary: 'تكميلي',
  side: 'جانبي',
  celebratory: 'احتفالي',
  summary: 'ملخص',
  derivative: 'مشتق',
  crossover: 'متقاطع'
};

const SCORE_LEVELS = [
  { value: 4, name: 'ممتاز' },
  { value: 3, name: 'جيد' },
  { value: 2, name: 'عادي' },
  { value: 1, name: 'سيء' },
  { value: 0, name: 'ضعيف' }
];

// --- الفئات ---
const BASE_CATEGORIES = [
  { id: 'narrative', name: 'السرد والكتابة', layer: 'base', order: 1 },
  { id: 'production', name: 'الإخراج والتنفيذ', layer: 'medium', order: 2 },
  { id: 'performance', name: 'الأداء التمثيلي', layer: 'performance', order: 3 },
  { id: 'value', name: 'القيمة والأثر', layer: 'base', order: 4 },
  { id: 'source', name: 'العلاقة بالمصدر', layer: 'source', order: 5 },
  { id: 'series', name: 'سلسلة الأفلام', layer: 'series', order: 6 }
];

// --- المعايير ---
const BASE_CRITERIA = [

  // ===== السرد والكتابة (11 معيارًا) =====
  {
    id: 'narrative.1',
    categoryId: 'narrative',
    name: 'التماسك الداخلي',
    wording: {
      default: 'هل العالم متماسك داخليًا وفق قواعده الخاصة؟\n\nهل تُحترم نتائج الأحداث المهمة حتى نهاية العمل حسب قواعده الداخلية؟',
      series: 'هل العالم متماسك داخليًا وفق قواعده الخاصة؟\n\nهل تُحترم نتائج الأحداث المهمة حتى نهاية الحلقة أو القوس أو العمل حسب قواعده الداخلية؟',
      film_series: 'هل العالم متماسك داخليًا وفق قواعده الخاصة؟\n\nهل تُحترم نتائج الأحداث المهمة حتى نهاية كل فيلم والسلسلة ككل حسب قواعده الداخلية؟'
    }
  },
  {
    id: 'narrative.2',
    categoryId: 'narrative',
    name: 'سببية الأحداث',
    wording: { default: 'هل تترابط الأحداث بعلاقة سبب ونتيجة منطقية؟' }
  },
  {
    id: 'narrative.3',
    categoryId: 'narrative',
    name: 'الشخصيات',
    wording: { default: 'هل تخدم الشخصيات هدف العمل بإقناع، سواء نفسية أو رمزية؟\n\nهل دوافعها وتأثرها وتغيرها وثباتها مبررة داخل منطق العمل؟' }
  },
  {
    id: 'narrative.4',
    categoryId: 'narrative',
    name: 'الشخصيات الثانوية',
    wording: {
      default: 'إن وُجدت، هل ظهرت بشكل كافٍ بالنسبة لأهمية دورها؟ وإن لم توجد، فهل كان الاستغناء عنها مناسبًا للعمل؟',
      short_film: 'إن وُجدت، هل ظهرت بشكل كافٍ بالنسبة لأهمية دورها في الوقت المحدود؟ وإن لم توجد، فهل كان الاستغناء عنها مناسبًا لمدته القصيرة؟'
    }
  },
  {
    id: 'narrative.5',
    categoryId: 'narrative',
    name: 'العلاقات والتفاعلات',
    wording: { default: 'هل العلاقات بين الشخصيات أو بين الشخصية وعالمها مقنعة ضمن منطق العمل؟\n\nهل تتطور التفاعلات بنبرة تناسب أسلوب العمل؟' }
  },
  {
    id: 'narrative.6',
    categoryId: 'narrative',
    name: 'أسلوب العرض',
    wording: { default: 'هل تظهر الأحداث والشخصيات بالصورة والسلوك بدلاً من شرحها مباشرة؟' }
  },
  {
    id: 'narrative.7',
    categoryId: 'narrative',
    name: 'الحوار والتواصل',
    wording: { default: 'هل يبدو تواصل الشخصيات، بالكلام أو بغيره، طبيعيًا ومناسبًا لها وله وظيفة؟\n\nهل يُحسن العمل استخدام صمت الشخصيات حسب هدف العمل؟' }
  },
  {
    id: 'narrative.8',
    categoryId: 'narrative',
    name: 'توزيع القصة',
    wording: {
      default: 'هل أخذ كل خط قصصي، رئيسي أو جانبي، مساحة تناسب أهميته في البنية الكلية؟\n\nهل تتقدم القصة دون تكرار لأحداث أو معلومات سبق تقديمها؟',
      film_series: 'هل توزعت الخطوط والأجزاء داخل كل فيلم وعبر السلسلة ككل بما يناسب أهميتها؟',
      short_film: 'هل وزّع العمل وقته المحدود على عناصره بشكل فعّال، دون حشو أو اختصار مخلّ؟'
    }
  },
  {
    id: 'narrative.9',
    categoryId: 'narrative',
    name: 'الإيقاع ووظيفة المشهد',
    wording: {
      default: 'هل يتقدم العمل بالسرعة المناسبة لأهدافه، دون إطالة أو استعجال؟\n\nهل لكل مشهد وظيفة واضحة درامية أو عاطفية أو جمالية أو معلوماتية أو تأملية ومدة تناسبها؟',
      series: 'هل يتقدم العمل بسرعة مناسبة لأهدافه، دون مماطلة أو استعجال؟\n\nهل لكل مشهد أو حلقة وظيفة واضحة درامية أو عاطفية أو جمالية أو معلوماتية أو تأملية ومدة تناسبها؟',
      limited_series: 'هل يتقدم العمل بسرعة مناسبة لطبيعته المحدودة سلفًا، دون مماطلة أو استعجال؟\n\nهل لكل حلقة وظيفة واضحة لا غنى عنها في القصة الكلية المحدودة مسبقًا؟',
      film_series: 'هل يحافظ كل فيلم على إيقاعه الداخلي، وهل يخدم موقعه داخل إيقاع السلسلة ككل؟',
      short_film: 'هل يتقدم العمل بإيقاع يناسب مدته القصيرة، دون قفز مفرط أو إبطاء غير مبرر؟\n\nهل لكل مشهد وظيفة واضحة لا يستغني عنها العمل في وقته المحدود؟'
    }
  },
  {
    id: 'narrative.10',
    categoryId: 'narrative',
    name: 'التصعيد',
    wording: {
      default: 'هل يبني العمل التوتر أو الاهتمام نحو ذرواته أو تحولاته الكبرى بشكل مناسب؟',
      short_film: 'هل يبني العمل التوتر أو الاهتمام نحو ذروته أو تحولاته الكبرى بكفاءة تتناسب مع مدته القصيرة؟'
    }
  },
  {
    id: 'narrative.11',
    categoryId: 'narrative',
    name: 'الخاتمة والإغلاق',
    wording: {
      default: 'هل تملك النهاية قوة مناسبة لما بناه العمل سواء كانت مغلقة أو مفتوحة أو تأملية؟',
      series: 'هل تنتهي الحلقات والأقواس والمواسم بطريقة مناسبة لما بناه العمل؟\n\nهل تملك نهاية ما قُيّم من العمل قوة مناسبة لما بناه، سواء كانت مغلقة أو مفتوحة أو تأملية؟',
      limited_series: 'هل تنتهي الحلقات والأقواس بطريقة تخدم القصة الكلية المحدودة؟\n\nهل تملك نهاية العمل قوة مناسبة لما بناه، مع إغلاق يناسب طبيعته المحدودة سلفًا؟',
      film_series: 'هل تنتهي الأفلام والأقواس بطريقة مناسبة لما بنته السلسلة؟\n\nهل تملك نهاية ما قُيّم من السلسلة قوة مناسبة لما بناه، سواء كانت مغلقة أو مفتوحة أو تأملية؟',
      short_film: 'هل تملك النهاية قوة مناسبة لما بناه العمل في وقته المحدود، سواء كانت مغلقة أو مفتوحة أو تأملية؟'
    }
  },

  // ===== الإخراج والتنفيذ — واقعي (4 معايير) =====
  {
    id: 'production.live.1', categoryId: 'production', name: 'الاتساق البصري', medium: 'live',
    wording: { default: 'هل يملك العمل أسلوبًا بصريًا وإخراجيًا واضحًا ومتسقًا من البداية إلى النهاية؟' }
  },
  {
    id: 'production.live.2', categoryId: 'production', name: 'الإضاءة والألوان', medium: 'live',
    wording: { default: 'هل تخدم الإضاءة والألوان المعنى أو الإحساس المطلوب لجو القصة؟' }
  },
  {
    id: 'production.live.3', categoryId: 'production', name: 'اللحظات المحورية', medium: 'live',
    wording: { default: 'هل نُفذت الذروات والتحولات الكبرى بمستوى يوازي أهميتها؟' }
  },
  {
    id: 'production.live.4', categoryId: 'production', name: 'توظيف الصوت والموسيقى', medium: 'live',
    wording: { default: 'هل تخدم المؤثرات والبيئة والموسيقى أو الصمت المشهد؟\n\nهل تعزز الجو أو المعنى أو العاطفة دون مبالغة؟' }
  },

  // ===== الإخراج والتنفيذ — أنمي (7 معايير) =====
  {
    id: 'production.anime.1', categoryId: 'production', name: 'جودة الرسم', medium: 'anime',
    wording: { default: 'هل يحافظ الرسم والخلفيات والتفاصيل والمنظور على مستوى مناسب يليق بأسلوب العمل؟' }
  },
  {
    id: 'production.anime.2', categoryId: 'production', name: 'الإضاءة والألوان', medium: 'anime',
    wording: { default: 'هل تخدم الإضاءة والألوان المعنى أو الإحساس المطلوب لجو القصة؟' }
  },
  {
    id: 'production.anime.3', categoryId: 'production', name: 'جودة التحريك ووضوحه', medium: 'anime',
    wording: { default: 'هل الحركة سلسة ومعبرة ومقنعة في ثقلها وسرعتها؟\n\nهل يمكن فهم اتجاه الحركة ومكان الشخصيات ونتيجة الأفعال؟' }
  },
  {
    id: 'production.anime.4', categoryId: 'production', name: 'استثمار التحريك', medium: 'anime',
    wording: { default: 'هل يوجه العمل جهده الحركي إلى المشاهد التي تحتاجها القصة بدلاً من الاستعراض دون حاجة؟' }
  },
  {
    id: 'production.anime.5', categoryId: 'production', name: 'تصميم الشخصيات', medium: 'anime',
    wording: { default: 'هل تصميم كل شخصية واضح ويخدم دورها وينسجم مع عالم العمل؟' }
  },
  {
    id: 'production.anime.6', categoryId: 'production', name: 'اللحظات المحورية', medium: 'anime',
    wording: { default: 'هل نُفذت الذروات والتحولات الكبرى بمستوى يوازي أهميتها؟' }
  },
  {
    id: 'production.anime.7', categoryId: 'production', name: 'توظيف الصوت والموسيقى', medium: 'anime',
    wording: { default: 'هل تخدم المؤثرات والبيئة والموسيقى أو الصمت المشهد؟\n\nهل تعزز الجو أو المعنى أو العاطفة دون مبالغة؟' }
  },

  // ===== الإخراج والتنفيذ — CGI (7 معايير) =====
  {
    id: 'production.cgi.1', categoryId: 'production', name: 'جودة النمذجة والتصميم', medium: 'cgi',
    wording: { default: 'هل تحافظ النماذج والبيئات والتفاصيل على مستوى مناسب يليق بأسلوب العمل؟' }
  },
  {
    id: 'production.cgi.2', categoryId: 'production', name: 'الإضاءة والألوان والريندر', medium: 'cgi',
    wording: { default: 'هل تخدم الإضاءة والألوان والريندر المعنى أو الإحساس المطلوب لجو القصة؟\n\nهل مستوى الريندر (التفاصيل، المحاكاة، الأنسجة) مناسب لأسلوب العمل؟' }
  },
  {
    id: 'production.cgi.3', categoryId: 'production', name: 'جودة التحريك', medium: 'cgi',
    wording: { default: 'هل الحركة سلسة ومعبرة ومقنعة في ثقلها وسرعتها؟\n\nهل يمكن فهم اتجاه الحركة ومكان الشخصيات ونتيجة الأفعال؟' }
  },
  {
    id: 'production.cgi.4', categoryId: 'production', name: 'استثمار التحريك', medium: 'cgi',
    wording: { default: 'هل يوجه العمل جهده الحركي إلى المشاهد التي تحتاجها القصة بدلاً من الاستعراض دون حاجة؟' }
  },
  {
    id: 'production.cgi.5', categoryId: 'production', name: 'تصميم الشخصيات', medium: 'cgi',
    wording: { default: 'هل تصميم كل شخصية واضح ويخدم دورها وينسجم مع عالم العمل؟' }
  },
  {
    id: 'production.cgi.6', categoryId: 'production', name: 'اللحظات المحورية', medium: 'cgi',
    wording: { default: 'هل نُفذت الذروات والتحولات الكبرى بمستوى يوازي أهميتها؟' }
  },
  {
    id: 'production.cgi.7', categoryId: 'production', name: 'توظيف الصوت والموسيقى', medium: 'cgi',
    wording: { default: 'هل تخدم المؤثرات والبيئة والموسيقى أو الصمت المشهد؟\n\nهل تعزز الجو أو المعنى أو العاطفة دون مبالغة؟' }
  },

  // ===== الإخراج والتنفيذ — كرتون (7 معايير) =====
  {
    id: 'production.toon.1', categoryId: 'production', name: 'جودة الرسم والخلفيات', medium: 'toon',
    wording: { default: 'هل يحافظ الرسم والخطوط والخلفيات والتفاصيل على مستوى مناسب يليق بأسلوب العمل المختار — سواء كان مبسطًا أو مفصلًا؟' }
  },
  {
    id: 'production.toon.2', categoryId: 'production', name: 'الإضاءة والألوان', medium: 'toon',
    wording: { default: 'هل تخدم الإضاءة والألوان المعنى أو الإحساس المطلوب لجو القصة؟' }
  },
  {
    id: 'production.toon.3', categoryId: 'production', name: 'جودة التحريك ووضوحه', medium: 'toon',
    wording: { default: 'هل الحركة معبرة ومقنعة في ثقلها وسرعتها، ومحترمة لأسلوب العمل — بما فيه التحريك المحدود إن كان مقصودًا ومنضبطًا؟\n\nهل يمكن فهم اتجاه الحركة ومكان الشخصيات ونتيجة الأفعال؟' }
  },
  {
    id: 'production.toon.4', categoryId: 'production', name: 'استثمار التحريك', medium: 'toon',
    wording: { default: 'هل يوجه العمل جهده الحركي إلى المشاهد التي تحتاجها القصة بدلًا من الاستعراض دون حاجة أو الاكتفاء بالحد الأدنى دون مبرر؟' }
  },
  {
    id: 'production.toon.5', categoryId: 'production', name: 'تصميم الشخصيات', medium: 'toon',
    wording: { default: 'هل تصميم كل شخصية واضح ويخدم دورها وينسجم مع عالم العمل وأسلوبه البصري؟' }
  },
  {
    id: 'production.toon.6', categoryId: 'production', name: 'اللحظات المحورية', medium: 'toon',
    wording: { default: 'هل نُفذت الذروات والتحولات الكبرى بمستوى يوازي أهميتها؟' }
  },
  {
    id: 'production.toon.7', categoryId: 'production', name: 'توظيف الصوت والموسيقى', medium: 'toon',
    wording: { default: 'هل تخدم المؤثرات والبيئة والموسيقى أو الصمت المشهد؟\n\nهل تعزز الجو أو المعنى أو العاطفة دون مبالغة؟' }
  },

  // ===== الأداء التمثيلي — واقعي فقط (4 معايير) =====
  {
    id: 'performance.live.1', categoryId: 'performance', name: 'جودة الأداء', medium: 'live',
    wording: { default: 'هل نقل الممثل مشاعر الشخصية وحالتها بإقناع؟\n\nهل تناسب صوته وحركته وجسده طبيعة الدور؟\n\nهل عبّر الأداء بتفاصيل مباشرة وغير مباشرة كنظرة أو توقف أو نبرة؟' }
  },
  {
    id: 'performance.live.2', categoryId: 'performance', name: 'التفاعل والكيمياء', medium: 'live',
    wording: { default: 'هل يبدو التفاعل بين الممثلين، أو بين الممثل وبيئته مقنعًا؟' }
  },
  {
    id: 'performance.live.3', categoryId: 'performance', name: 'اتساق الأداء وتطوره', medium: 'live',
    wording: { default: 'هل يواكب أداء الممثل ما تمر به الشخصية، سواء تغيرت أم ثبتت؟\n\nهل يحافظ الأداء على مستواه طوال العمل؟' }
  },
  {
    id: 'performance.live.4', categoryId: 'performance', name: 'تجانس الأداء', medium: 'live',
    wording: { default: 'هل جاء أداء جميع من ظهروا في العمل بمستوى يخدمه، دون أن يضعف أحدهم التجربة؟' }
  },

  // ===== القيمة والأثر (6 معايير) =====
  {
    id: 'value.1', categoryId: 'value', name: 'قيمة ما يقدمه العمل',
    wording: { default: 'هل يقدم العمل قيمة فكرية أو عاطفية أو ترفيهية تستحق وقتك؟' }
  },
  {
    id: 'value.2', categoryId: 'value', name: 'وضوح المعنى وثراء التجربة',
    wording: { default: 'هل أوصل العمل فكرته أو إحساسه بوضوح وعمق؟\n\nهل يملك تفاصيل تزيد قيمته دون تعقيد مصطنع؟' }
  },
  {
    id: 'value.3', categoryId: 'value', name: 'العمق والتجدد',
    wording: { default: 'هل يضيف العمل مع امتداد الوقت عمقًا في المعنى أو الإحساس أو تنويعًا في التجربة، لا مجرد أحداث جديدة؟\n\nهل يحافظ على جودة تجربته من بدايته إلى نهايته دون هبوط؟' }
  },
  {
    id: 'value.4', categoryId: 'value', name: 'التميز داخل النوع',
    wording: { default: 'هل يتميز عن غيره من الأعمال المتشابهة من خلال هوية أو تنفيذ؟' }
  },
  {
    id: 'value.5', categoryId: 'value', name: 'الأثر اللحظي',
    wording: { default: 'هل حقق الأثر العاطفي أو التأملي المطلوب مثل الضحك أو الحزن وغيرها؟' }
  },
  {
    id: 'value.6', categoryId: 'value', name: 'الأثر الباقي',
    wording: { default: 'هل تبقى مشاهده أو أفكاره أو شخصياته في الذاكرة؟' }
  },

  // ===== العلاقة بالمصدر (4 معايير) — تابع فقط =====
  {
    id: 'source.1', categoryId: 'source', name: 'استثمار العالم',
    sections: [
      { text: 'هل استثمر العمل علاقته بالمصدر لصناعة تجربة أعمق أو أوضح، أم اكتفى بعدم كسر القواعد؟' },
      { text: '(إن كان تابعًا لمسلسل) هل يستخدم عناصر المسلسل لخدمة القوس، أم يضعها لمجرد الاستدعاء؟', condition: { sourceFormat: 'series' }, filterable: false },
      { text: '(إن كان تابعًا لفيلم) هل يوسع قواعد العالم التي أسسها الفيلم بصورة متماسكة؟ وإن كان مسلسلًا تابعًا لفيلم، هل تضيف أقواسه ومواسمه الجديدة قيمة أو زاوية جديدة؟', condition: { sourceFormat: 'film' }, filterable: false },
      { text: '(إن كان العمل نفسه سلسلة أفلام تابعة) هل يبني كل فيلم على ما أسسه المصدر بصورة متماسكة، ويضيف زاوية أو عمقًا لا يقدمه المصدر وحده؟ هل تستحق السلسلة ككل وجودها بجانب المصدر، أم هي مجرد إعادة صياغة مطولة؟', condition: { format: 'film_series', relation: 'derivative' }, filterable: true },
      { text: '(إن كان مشتقًا) هل يستثمر العنصر المأخوذ من المصدر ليؤسس عالمًا أو قصة مستقلة، أم يبقى أسيرًا للمصدر بلا هوية خاصة؟', condition: { nature: 'derivative' }, filterable: true },
      { text: '(إن كان متقاطعًا) هل يدمج العوالم أو الشخصيات المختلفة بصورة متماسكة تخدم القصة، أم هي مجرد تجميع استعراضي؟', condition: { nature: 'crossover' }, filterable: true }
    ],
    notes: 'ملاحظة: هذا المعيار يقيس علاقة العمل بالمصدر الأصلي. أما العلاقة بين أجزاء السلسلة نفسها فيقيسها معيار "وظيفة كل جزء داخل الكل" في طبقة سلاسل الأفلام — وهما نطاقان مختلفان.\n\nملاحظة إضافية: الشروط المحددة بـ"تابع لمسلسل" و"تابع لفيلم" فقط تفترض معرفة صيغة المصدر الأصلي. أما شرط "العمل نفسه سلسلة أفلام تابعة" فمبني على صيغة العمل نفسه وعلاقته بالمصدر، ويُطبّق حتى لو كان المصدر كتابًا أو لعبة أو مانغا. إن كان المصدر من نوع آخر (كتاب، لعبة، مانغا...)، يُكتفي بالسؤال العام ويُتجاهل شرطا "تابع لمسلسل" و"تابع لفيلم" فقط.\n\nقاعدة الأعمال المتقاطعة: في الأعمال المتقاطعة، تُقيّم العلاقة بكل مصدر مشارك، لا بالمصدر الأبرز فقط.'
  },
  {
    id: 'source.2', categoryId: 'source', name: 'عدالة العمل مع جمهوره',
    wording: { default: 'هل صُمم العمل لمن يعرف المصدر ويُثري تجربتهم، أم يفترض معرفة لا يملكها ويُربك المشاهد؟ يُقصد بالجمهور هنا الجمهور المنطقي للعمل بحسب طبيعته: جمهور المصدر، والجمهور الجديد عند الحاجة، وجمهور كل مصدر في الأعمال المتقاطعة.' }
  },
  {
    id: 'source.3', categoryId: 'source', name: 'تبرير الوجود',
    sections: [
      { text: 'هل يبرر العمل وجوده بحسب طبيعته المعلنة؟' },
      { text: 'تكميلي: هل أضاف تطورًا أو زاوية جديدة للمصدر؟', condition: { nature: 'complementary' }, filterable: true },
      { text: 'جانبي: هل قدّم تجربة مكتفية وممتعة داخل حدودها؟', condition: { nature: 'side' }, filterable: true },
      { text: 'احتفالي: هل قدّم تجربة تستحق الاحتفال، أم مجرد استدعاء سطحي؟', condition: { nature: 'celebratory' }, filterable: true },
      { text: 'ملخص: هل أضاف زاوية أو قيمة للملخص، أم هو مجرد إعادة تدوير؟', condition: { nature: 'summary' }, filterable: true },
      { text: 'مشتق: هل يؤسس هوية مستقلة تتجاوز المصدر؟ هل يبرر العنصر المأخوذ منه قيام عمل كامل؟', condition: { nature: 'derivative' }, filterable: true },
      { text: 'متقاطع: هل يدمج العوالم أو الشخصيات بطريقة عضوية تخدم القصة؟ هل يخدم كل مصدر أم يستغل بعضها؟', condition: { nature: 'crossover' }, filterable: true }
    ]
  },
  {
    id: 'source.4', categoryId: 'source', name: 'مناسبة الصيغة',
    sections: [
      { text: '(إن كان فيلمًا تابعًا) هل يعمل كفيلم طويل له إيقاعه وبنيته، أم يبدو كحلقة تلفزيونية ممددة أو ملخص لأحداث سابقة؟', condition: { format: 'film' }, filterable: true },
      { text: '(إن كان فيلمًا قصيرًا تابعًا) هل يعمل كفيلم قصير مكتفٍ له إيقاعه وبنيته، أم يبدو كجزء مقتطع من المصدر أو مقدمة ممددة له؟', condition: { format: 'short_film' }, filterable: true },
      { text: '(إن كان مسلسلًا تابعًا) هل يعمل كمسلسل له إيقاعه وبنيته، أم يبدو كفيلم جرى تمديده إلى حلقات؟', condition: { format: 'series' }, filterable: true },
      { text: '(إن كان مسلسلًا محدودًا تابعًا) هل يعمل كمسلسل محدود له إيقاعه وبنيته المحدودة سلفًا، أم يبدو كعمل ممدود بلا ضرورة، أو كمسلسل مفتوح بلا خطة إغلاق واضحة؟', condition: { format: 'limited_series' }, filterable: true },
      { text: '(إن كان العمل نفسه سلسلة أفلام تابعة) هل تعمل السلسلة ككيان سينمائي له إيقاعه وبنيته عبر الأجزاء، أم تبدو كحلقات تلفزيونية ممددة أو ملخص مطول للمصدر؟ هل كل فيلم يقف بذاته مع مساهمته في الكل؟', condition: { format: 'film_series' }, filterable: true }
    ]
  },

  // ===== سلسلة الأفلام (5 معايير) — سلاسل فقط =====
  {
    id: 'series.1', categoryId: 'series', name: 'تطور السلسلة عبر الأجزاء',
    wording: { default: 'هل تجدد السلسلة تجربتها من جزء إلى آخر، أم تعيد التجربة نفسها بصور مختلفة؟' }
  },
  {
    id: 'series.2', categoryId: 'series', name: 'الاتساق بين الأجزاء',
    wording: { default: 'هل تحترم الأجزاء ما بناه السابق عليها دون تناقض؟' }
  },
  {
    id: 'series.3', categoryId: 'series', name: 'وظيفة كل جزء داخل الكل',
    wording: { default: 'هل كل فيلم يبرر وجوده داخل السلسلة، أم هو مجرد تكرار؟' }
  },
  {
    id: 'series.4', categoryId: 'series', name: 'تراكم المعنى',
    wording: { default: 'هل تضيف الأجزاء المتعاقبة عمقًا للعالم والشخصيات؟' }
  },
  {
    id: 'series.5', categoryId: 'series', name: 'الحفاظ على المستوى',
    wording: { default: 'هل تحافظ السلسلة على مستواها عبر الأجزاء، أم تهبط بعد جزء قوي؟' }
  }
];

// ============================================================
// دوال النظام
// ============================================================

// الحصول على صياغة المعيار حسب الصيغة
function getCriterionWording(criterion, format) {
  if (criterion.sections) {
    return null; // يستخدم getCriterionText للمعايير ذات الأقسام
  }
  const w = criterion.wording;
  if (typeof w === 'string') return w;
  if (w[format]) return w[format];
  if (format === 'limited_series' && w.series) return w.series;
  return w.default;
}

// مطابقة شرط مع التكوين (يدعم المصفوفات للشروط المتعددة)
function matchesCondition(condition, config) {
  for (const key in condition) {
    const condVal = condition[key];
    const configVal = config[key];
    if (Array.isArray(condVal)) {
      if (!condVal.includes(configVal)) return false;
    } else {
      if (configVal !== condVal) return false;
    }
  }
  return true;
}

// الحصول على نص المعيار الكامل (مع الأقسام الشرطية)
function getCriterionText(criterion, config) {
  if (criterion.sections) {
    let parts = [];
    for (const section of criterion.sections) {
      if (!section.condition) {
        parts.push(section.text);
      } else if (section.filterable) {
        if (matchesCondition(section.condition, config)) {
          parts.push(section.text);
        }
      } else {
        parts.push(section.text);
      }
    }
    let text = parts.join('\n\n');
    if (criterion.notes) text += '\n\n' + criterion.notes;
    return text;
  }
  return getCriterionWording(criterion, config.format);
}

// الحصول على المعايير المنطبقة على تكوين معين
function getApplicableCriteria(system, config) {
  const { medium, format, relation } = config;
  let result = [];

  for (const cat of system.categories) {
    if (cat.deleted) continue;

    let categoryApplies = false;

    if (cat.layer === 'base') {
      categoryApplies = true;
    } else if (cat.layer === 'medium') {
      categoryApplies = true;
    } else if (cat.layer === 'performance') {
      categoryApplies = (medium === 'live');
    } else if (cat.layer === 'source') {
      categoryApplies = (relation === 'derivative');
    } else if (cat.layer === 'series') {
      categoryApplies = (format === 'film_series');
    }

    if (!categoryApplies) continue;

    // التحقق من شروط الفئة المخصصة
    if (cat.conditions) {
      if (!matchesCondition(cat.conditions, config)) continue;
    }

    const catCriteria = system.criteria.filter(c => {
      if (c.deleted) return false;
      if (c.categoryId !== cat.id) return false;
      if (c.medium && c.medium !== medium) return false;
      if (c.conditions) {
        if (!matchesCondition(c.conditions, config)) return false;
      }
      return true;
    });

    result.push(...catCriteria);
  }

  return result;
}

// الحصول على المعايير المنطبقة مجمّعة حسب الفئة
function getApplicableCriteriaByCategory(system, config) {
  const { medium, format, relation } = config;
  let result = [];

  for (const cat of system.categories) {
    if (cat.deleted) continue;

    let categoryApplies = false;
    if (cat.layer === 'base') {
      categoryApplies = true;
    } else if (cat.layer === 'medium') {
      categoryApplies = true;
    } else if (cat.layer === 'performance') {
      categoryApplies = (medium === 'live');
    } else if (cat.layer === 'source') {
      categoryApplies = (relation === 'derivative');
    } else if (cat.layer === 'series') {
      categoryApplies = (format === 'film_series');
    }

    if (!categoryApplies) continue;

    if (cat.conditions) {
      if (!matchesCondition(cat.conditions, config)) continue;
    }

    const catCriteria = system.criteria.filter(c => {
      if (c.deleted) return false;
      if (c.categoryId !== cat.id) return false;
      if (c.medium && c.medium !== medium) return false;
      if (c.conditions) {
        if (!matchesCondition(c.conditions, config)) return false;
      }
      return true;
    });

    if (catCriteria.length > 0) {
      result.push({ category: cat, criteria: catCriteria });
    }
  }

  return result;
}

// حساب الأوزان الأساسية (الفئات الأصلية)
function calculateWeights(medium, format, relation) {
  let w = {};

  // الأساس
  if (medium === 'live') {
    w.narrative = 5;
    w.production = 2.5;
    w.performance = 1.5;
    w.value = 1;
  } else {
    w.narrative = 5;
    w.production = 3.5;
    w.value = 1.5;
  }

  // قاعدة 1: عمل تابع
  if (relation === 'derivative') {
    w.narrative -= 0.5;
    w.source = 1;
    if (medium === 'live') {
      w.performance -= 0.5;
    } else {
      w.production -= 0.5;
    }
  }

  // قاعدة 2: سلسلة أفلام
  if (format === 'film_series') {
    w.narrative -= 1;
    if (relation !== 'derivative' && medium !== 'live') {
      w.series = 1.5;
      w.production -= 0.5;
    } else {
      w.series = 1;
    }
  }

  return w;
}

// حساب الأوزان الكاملة (تشمل الفئات المخصصة)
function calculateFullWeights(system, medium, format, relation) {
  let w = calculateWeights(medium, format, relation);

  // إضافة أوزان الفئات المخصصة
  for (const cat of system.categories) {
    if (cat.deleted) continue;
    if (cat.custom && cat.baseWeights) {
      let catWeight = 0;
      if (cat.layer === 'base') {
        // يأخذ الوزن من الوسيط المحدد
        catWeight = cat.baseWeights[medium] || cat.baseWeights['all'] || 0;
      } else if (cat.layer === 'medium') {
        catWeight = cat.baseWeights[medium] || 0;
      } else if (cat.layer === 'performance') {
        if (medium === 'live') catWeight = cat.baseWeights['live'] || 0;
      } else if (cat.layer === 'source') {
        if (relation === 'derivative') catWeight = cat.baseWeights['derivative'] || 0;
      } else if (cat.layer === 'series') {
        if (format === 'film_series') catWeight = cat.baseWeights['series'] || 0;
      }

      if (catWeight > 0) {
        // تطبيق قواعد التعديل المخصصة
        if (cat.modRules) {
          if (cat.modRules.derivative && relation === 'derivative') {
            catWeight += cat.modRules.derivative;
          }
          if (cat.modRules.filmSeries && format === 'film_series') {
            catWeight += cat.modRules.filmSeries;
          }
        }
        w[cat.id] = catWeight;
      }
    }
  }

  // التطبيع إلى 10
  let total = 0;
  for (const k in w) total += w[k];
  if (total > 0 && Math.abs(total - 10) > 0.001) {
    const scale = 10 / total;
    for (const k in w) w[k] = w[k] * scale;
  }

  return w;
}

// فحص الأعمال المتأثرة بتغيّر النظام
function _isWorkAffected(system, ev) {
  if (!ev.criterionIds || ev.criterionIds.length === 0) return false;
  const config = { medium: ev.medium, format: ev.format, relation: ev.relation, nature: ev.nature };
  const currentIds = new Set(getApplicableCriteria(system, config).map(c => c.id));
  const oldIds = new Set(ev.criterionIds);

  for (const id of currentIds) {
    if (!oldIds.has(id)) return true;
  }
  for (const id of oldIds) {
    if (!currentIds.has(id)) return true;
  }
  return false;
}

// حساب النتيجة النهائية
function calculateScore(system, config, scores) {
  const weights = calculateFullWeights(system, config.medium, config.format, config.relation);
  const categoriesWithCriteria = getApplicableCriteriaByCategory(system, config);

  let categoryScores = [];
  let totalScore = 0;

  for (const { category, criteria } of categoriesWithCriteria) {
    const weight = weights[category.id];
    if (!weight || weight === 0) continue;

    let sum = 0;
    let count = 0;
    let allScored = true;

    for (const crit of criteria) {
      const score = scores[crit.id];
      if (score !== undefined && score !== null) {
        sum += score;
        count++;
      } else {
        allScored = false;
      }
    }

    if (count === 0) {
      categoryScores.push({ categoryId: category.id, name: category.name, weight, criteriaCount: criteria.length, scoredCount: 0, allScored: false, points: 0 });
      continue;
    }

    const avg = sum / count;
    const points = (avg / 4) * weight;
    if (allScored) totalScore += points;

    categoryScores.push({
      categoryId: category.id,
      name: category.name,
      weight,
      criteriaCount: criteria.length,
      scoredCount: count,
      allScored,
      avg,
      points
    });
  }

  return {
    weights,
    categoryScores,
    totalScore,
    allScored: categoryScores.every(cs => cs.allScored)
  };
}

// مقارنة الأوزان بتفاكنة رقمية
function sameWeights(a, b) {
  if (!a || !b) return false;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    const va = a[k] || 0;
    const vb = b[k] || 0;
    if (Math.abs(va - vb) > 0.001) return false;
  }
  return true;
}

// فحص هل الأوزان المخزّنة قديمة مقارنة بالأوزان الحالية
function isWeightOutdated(system, ev) {
  if (!ev || ev.status !== 'completed') return false;
  const currentWeights = calculateFullWeights(system, ev.medium, ev.format, ev.relation);
  return !sameWeights(ev.weights, currentWeights);
}

// تنسيق الرقم بمنزلة عشرية واحدة
function formatNumber(n) {
  return (Math.round(n * 10) / 10).toFixed(1);
}

// تنسيق النسبة المئوية
function formatPercent(weight) {
  const pct = (weight / 10) * 100;
  if (Number.isInteger(pct)) return pct + '%';
  return (Math.round(pct * 10) / 10).toFixed(1) + '%';
}

// توليد نص النسخ
function generateCopyText(system, evaluation) {
  const config = {
    medium: evaluation.medium,
    format: evaluation.format,
    relation: evaluation.relation,
    nature: evaluation.nature
  };

  const categoriesWithCriteria = getApplicableCriteriaByCategory(system, config);
  const weights = evaluation.weights || calculateFullWeights(system, config.medium, config.format, config.relation);

  // استخدام النتيجة المخزّنة إن وُجدت
  let categoryPoints = {};
  let totalScore = 0;
  if (evaluation.status === 'completed' && evaluation.totalScore != null) {
    totalScore = evaluation.totalScore;
    // استخدم categoryScores المخزّنة إن وُجدت
    if (evaluation.categoryScores && evaluation.categoryScores.length > 0) {
      for (const cs of evaluation.categoryScores) {
        categoryPoints[cs.categoryId] = cs.points;
      }
    } else {
      // حساب نقاط الفئات من الأوزان المخزّنة والدرجات الخام
      for (const { category, criteria } of categoriesWithCriteria) {
        const weight = weights[category.id];
        if (!weight) continue;
        let sum = 0, count = 0;
        for (const crit of criteria) {
          const score = evaluation.scores ? evaluation.scores[crit.id] : undefined;
          if (score !== undefined && score !== null) {
            sum += score;
            count++;
          }
        }
        if (count > 0) {
          const avg = sum / count;
          categoryPoints[category.id] = (avg / 4) * weight;
        }
      }
    }
  } else {
    const scoreResult = calculateScore(system, config, evaluation.scores || {});
    totalScore = scoreResult.totalScore;
    for (const cs of scoreResult.categoryScores) {
      categoryPoints[cs.categoryId] = cs.points;
    }
  }

  let lines = [];
  lines.push('اسم العمل: ' + evaluation.name);
  lines.push('');

  // سطر التكوين
  let configParts = [MEDIA[evaluation.medium], FORMATS[evaluation.format]];
  if (evaluation.relation === 'derivative') {
    configParts.push(RELATIONS.derivative + (evaluation.nature ? ' (' + NATURES[evaluation.nature] + ')' : ''));
  } else {
    configParts.push(RELATIONS.independent);
  }
  lines.push(configParts.join(' — '));
  lines.push('');

  // الفئات والمعايير
  for (const { category, criteria } of categoriesWithCriteria) {
    const weight = weights[category.id];
    if (!weight) continue;

    lines.push(category.name + ' (' + formatPercent(weight) + ')');

    for (const crit of criteria) {
      const score = evaluation.scores ? evaluation.scores[crit.id] : undefined;
      let levelName = '—';
      if (score !== undefined && score !== null) {
        const level = SCORE_LEVELS.find(l => l.value === score);
        levelName = level ? level.name : '—';
      }
      lines.push(crit.name + ': ' + levelName);
    }
    lines.push('');
  }

  // النتيجة النهائية
  lines.push('النتيجة النهائية: ' + formatNumber(totalScore) + ' / 10');

  return lines.join('\n\n');
}

// الحصول على النظام الفعلي (أساس + تعديلات)
function getEffectiveSystem() {
  const stored = loadFromStorage('eval_system', null);
  if (stored) return stored;

  return {
    categories: JSON.parse(JSON.stringify(BASE_CATEGORIES)),
    criteria: JSON.parse(JSON.stringify(BASE_CRITERIA))
  };
}

// حفظ النظام
function saveSystem(system) {
  saveToStorage('eval_system', system);
}

// --- دوال التخزين ---
const _memStore = {};
let _localStorageAvailable = false;
try { _localStorageAvailable = typeof localStorage !== 'undefined' && localStorage !== null; } catch(e) { _localStorageAvailable = false; }

function loadFromStorage(key, defaultValue) {
  if (_localStorageAvailable) {
    try {
      const data = localStorage.getItem(key);
      if (data === null) return defaultValue;
      return JSON.parse(data);
    } catch (e) {
      return defaultValue;
    }
  }
  return key in _memStore ? JSON.parse(_memStore[key]) : defaultValue;
}

let _storageFullAlertShown = false;

function saveToStorage(key, value) {
  const str = JSON.stringify(value);
  if (_localStorageAvailable) {
    try {
      localStorage.setItem(key, str);
      _storageFullAlertShown = false;
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        if (typeof showStorageFullAlert === 'function' && !_storageFullAlertShown) {
          _storageFullAlertShown = true;
          showStorageFullAlert();
        } else if (!_storageFullAlertShown) {
          _storageFullAlertShown = true;
          alert('امتلأ التخزين. صدّر مكتبتك واحذف بعض العناصر لتفريغ مساحة.');
        }
      }
      _memStore[key] = str;
      return false;
    }
  }
  _memStore[key] = str;
  return true;
}

// توليد UUID
function generateUUID() {
  if (crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
