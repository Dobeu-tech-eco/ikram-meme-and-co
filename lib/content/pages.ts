import type { Locale } from "@/lib/i18n";

/**
 * Static, bilingual prose for the informational pages (About / Contact / FAQ).
 * All copy lives here so the page components stay thin and simply map over it.
 * Keys are keyed by locale ("en" | "ar"); Arabic entries are genuine translations
 * and rely on the layout's dir="rtl" — pages must not set direction themselves.
 */

export type Section = {
  heading: string;
  body: string;
};

export type AboutContent = {
  title: string;
  intro: string;
  sections: Section[];
};

export type ContactContent = {
  title: string;
  intro: string;
  emailLabel: string;
  email: string;
  responseNote: string;
  entityNote: string;
};

export type Qa = {
  q: string;
  a: string;
};

export type FaqContent = {
  title: string;
  intro: string;
  items: Qa[];
};

type LocaleMap<T> = Record<Locale, T>;

const about: LocaleMap<AboutContent> = {
  en: {
    title: "About Ikram & Co.",
    intro:
      "Ikram & Co. is an artist-first storefront for original one-of-one artwork, limited-edition sticker sheets and prints, and print-on-demand pieces from independent artists. We exist to put real work by real people in front of a wider audience — and to make sure the makers are paid fairly for it.",
    sections: [
      {
        heading: "Our story",
        body:
          "Ikram (إكرام) means generosity and honouring a guest — the spirit we want every drop to carry. We started small: a handful of artists, a shared belief that original art deserves a modern home online, and a refusal to flatten distinctive voices into generic merch. Every piece we list is chosen for craft, character, and the story behind it.",
      },
      {
        heading: "Our mission",
        body:
          "We champion working independent artists. That means fair splits, clear credit, and never treating a one-of-one original as interchangeable stock. When you buy an original, you buy the only one that will ever exist — signed, catalogued, and released just once.",
      },
      {
        heading: "How drops work",
        body:
          "New work arrives in scheduled drops. Originals are truly one-of-one: once sold, they are gone. Limited editions are capped at a fixed run and numbered, and print-on-demand keeps a rotating selection available year-round. Popular drops move quickly, so items are held for you at checkout while you pay to keep things fair.",
      },
      {
        heading: "The studio",
        body:
          "Ikram & Co. is operated by Dobeu Tech Solutions LLC, which handles the storefront, payments, fulfilment, and support so the artists can focus on making. We keep the tech quiet and the art loud.",
      },
    ],
  },
  ar: {
    title: "عن إكرام وشركاه",
    intro:
      "إكرام وشركاه متجرٌ يضع الفنان في المقام الأول، متخصص في الأعمال الفنية الأصلية الفريدة، وأوراق الملصقات والمطبوعات محدودة الإصدار، والقطع المطبوعة عند الطلب من إبداع فنانين مستقلين. نسعى لإيصال أعمال حقيقية من أشخاص حقيقيين إلى جمهور أوسع، مع ضمان حصول صانعيها على أجرٍ عادل.",
    sections: [
      {
        heading: "قصتنا",
        body:
          "إكرام تعني الكرم وإجلال الضيف، وهي الروح التي نريد أن يحملها كل إصدار. بدأنا صغارًا: حفنة من الفنانين، وإيمان مشترك بأن الفن الأصيل يستحق موطنًا عصريًا على الإنترنت، ورفضٌ لاختزال الأصوات المميزة في منتجاتٍ نمطية. كل قطعة نعرضها مختارة بعناية لحرفيّتها وشخصيّتها والقصة التي تقف خلفها.",
      },
      {
        heading: "رسالتنا",
        body:
          "ندعم الفنانين المستقلين العاملين. وهذا يعني تقاسمًا عادلًا للأرباح، ونسبةً واضحة للعمل، وألّا نعامل العمل الأصلي الفريد كبضاعة قابلة للاستبدال. حين تشتري عملًا أصليًا، فأنت تقتني النسخة الوحيدة التي ستوجد على الإطلاق، موقّعةً ومفهرسةً وصادرةً مرة واحدة فقط.",
      },
      {
        heading: "كيف تعمل الإصدارات",
        body:
          "تصل الأعمال الجديدة ضمن إصدارات مجدولة. الأعمال الأصلية فريدة تمامًا: ما إن تُباع حتى تختفي. أما الإصدارات المحدودة فمحصورة بعددٍ ثابت ومرقّمة، بينما تُبقي الطباعة عند الطلب تشكيلةً متجددة متاحة على مدار العام. تنفد الإصدارات الرائجة بسرعة، لذا نحجز لك القطعة أثناء الدفع حفاظًا على العدالة.",
      },
      {
        heading: "الاستوديو",
        body:
          "تُدير إكرام وشركاه شركة Dobeu Tech Solutions LLC، التي تتولى المتجر والمدفوعات والشحن والدعم كي يتفرّغ الفنانون للإبداع. نُبقي التقنية في الخلف والفن في الواجهة.",
      },
    ],
  },
};

const contact: LocaleMap<ContactContent> = {
  en: {
    title: "Contact us",
    intro:
      "Questions about a piece, an order, or working with us as an artist? We would love to hear from you. Email is the fastest way to reach the team.",
    emailLabel: "Email",
    email: "jeremyw@dobeu.net",
    responseNote:
      "We read every message and typically reply within about 2 business days. If your question is about an existing order, please include your order number so we can help faster.",
    entityNote:
      "Ikram & Co. is operated by Dobeu Tech Solutions LLC.",
  },
  ar: {
    title: "تواصل معنا",
    intro:
      "هل لديك سؤال عن قطعة أو طلب، أو ترغب في التعاون معنا كفنان؟ يسعدنا أن نسمع منك. البريد الإلكتروني هو أسرع وسيلة للوصول إلى الفريق.",
    emailLabel: "البريد الإلكتروني",
    email: "jeremyw@dobeu.net",
    responseNote:
      "نقرأ كل رسالة، ونردّ عادةً خلال يومي عمل تقريبًا. إذا كان سؤالك يتعلق بطلبٍ قائم، فيرجى إرفاق رقم الطلب لنتمكن من مساعدتك بسرعة أكبر.",
    entityNote:
      "تُدير إكرام وشركاه شركة Dobeu Tech Solutions LLC.",
  },
};

const faq: LocaleMap<FaqContent> = {
  en: {
    title: "Frequently asked questions",
    intro:
      "Everything you might want to know about ordering, originals, editions, shipping, and returns. Still stuck? Reach us any time.",
    items: [
      {
        q: "How do I place an order?",
        a: "Browse the shop, open the piece you love, and check out. Payment is handled securely through Stripe, and you will receive an email confirmation as soon as your order is placed.",
      },
      {
        q: "Are the originals really one-of-one?",
        a: "Yes. Every original is a single, unique piece by the artist — there is only ever one. Once it sells, it is gone for good and will never be reprinted or reissued. Each original is catalogued and signed by its maker.",
      },
      {
        q: "What is the difference between originals, limited editions, and print-on-demand?",
        a: "Originals are unique one-of-one artworks. Limited editions are a fixed, numbered run — once the run sells out, no more are made. Print-on-demand pieces are produced to order and stay available year-round.",
      },
      {
        q: "How does the hold at checkout work?",
        a: "Because originals and limited runs are scarce, the item is reserved for you for a short window while you complete payment. If checkout is not finished in time, the hold is released so someone else can buy it. This keeps drops fair for everyone.",
      },
      {
        q: "How long does shipping take?",
        a: "Originals and in-stock editions typically ship within 3–5 business days. Print-on-demand pieces are made to order and usually ship within 5–10 business days. You will receive tracking by email once your order is on its way.",
      },
      {
        q: "Do you ship internationally?",
        a: "Yes, we ship worldwide. International delivery times vary by destination, and any customs duties or import taxes are the responsibility of the recipient.",
      },
      {
        q: "Is my payment secure?",
        a: "Absolutely. All payments are processed by Stripe, a PCI-compliant payment provider. We never see or store your full card details on our servers.",
      },
      {
        q: "What is your return policy?",
        a: "Print-on-demand and edition items can be returned within 14 days if they arrive damaged or defective — just email us with a photo. Because one-of-one originals are unique, they are final sale unless they arrive damaged in transit.",
      },
      {
        q: "How are drops announced?",
        a: "New drops are released on a schedule and announced by email and on our channels. Because originals and limited editions are capped, popular pieces can sell out quickly, so it pays to be early.",
      },
      {
        q: "How do artists get paid, and can I sell with you?",
        a: "We work on fair, transparent splits with every artist and always credit the maker. If you are an artist interested in a drop, email us — we would love to see your work.",
      },
      {
        q: "Can I request a commission or a custom piece?",
        a: "Some of our artists take commissions between drops. Email us with what you have in mind and we will see whether we can pair you with the right maker.",
      },
    ],
  },
  ar: {
    title: "الأسئلة الشائعة",
    intro:
      "كل ما قد ترغب في معرفته عن الطلب والأعمال الأصلية والإصدارات والشحن والإرجاع. ما زلت بحاجة إلى مساعدة؟ تواصل معنا في أي وقت.",
    items: [
      {
        q: "كيف أضع طلبًا؟",
        a: "تصفّح المتجر، وافتح القطعة التي تعجبك، ثم أكمل الدفع. تُعالَج المدفوعات بأمان عبر Stripe، وستصلك رسالة تأكيد بالبريد الإلكتروني بمجرد إتمام الطلب.",
      },
      {
        q: "هل الأعمال الأصلية فريدة حقًا؟",
        a: "نعم. كل عمل أصلي قطعة واحدة فريدة من إبداع الفنان — لا توجد سواها أبدًا. ما إن تُباع حتى تختفي إلى الأبد ولن تُعاد طباعتها أو إصدارها. كل عمل أصلي مفهرس وموقّع من صانعه.",
      },
      {
        q: "ما الفرق بين الأعمال الأصلية والإصدارات المحدودة والطباعة عند الطلب؟",
        a: "الأعمال الأصلية قطع فريدة لا نظير لها. الإصدارات المحدودة كمية ثابتة ومرقّمة — وما إن تنفد حتى لا يُصنع المزيد. أما قطع الطباعة عند الطلب فتُنتَج حسب الطلب وتبقى متاحة على مدار العام.",
      },
      {
        q: "كيف يعمل الحجز أثناء الدفع؟",
        a: "لأن الأعمال الأصلية والإصدارات المحدودة نادرة، تُحجَز القطعة لك لفترة قصيرة ريثما تُكمل الدفع. وإن لم يكتمل الدفع في الوقت المحدد، يُرفع الحجز ليتمكن غيرك من شرائها. هذا يُبقي الإصدارات عادلة للجميع.",
      },
      {
        q: "كم يستغرق الشحن؟",
        a: "تُشحن الأعمال الأصلية والإصدارات المتوفرة عادةً خلال 3 إلى 5 أيام عمل. أما قطع الطباعة عند الطلب فتُصنع حسب الطلب وتُشحن عادةً خلال 5 إلى 10 أيام عمل. ستصلك بيانات التتبع بالبريد الإلكتروني بمجرد إرسال طلبك.",
      },
      {
        q: "هل تشحنون دوليًا؟",
        a: "نعم، نشحن إلى جميع أنحاء العالم. تختلف مدة التوصيل الدولي حسب الوجهة، وتقع أي رسوم جمركية أو ضرائب استيراد على عاتق المستلم.",
      },
      {
        q: "هل الدفع آمن؟",
        a: "بالتأكيد. تُعالَج جميع المدفوعات عبر Stripe، وهو مزوّد دفع متوافق مع معيار PCI. نحن لا نرى تفاصيل بطاقتك الكاملة ولا نخزّنها على خوادمنا.",
      },
      {
        q: "ما سياسة الإرجاع لديكم؟",
        a: "يمكن إرجاع قطع الطباعة عند الطلب والإصدارات خلال 14 يومًا إذا وصلت تالفة أو معيبة — فقط راسلنا مرفقًا صورة. ولأن الأعمال الأصلية الفريدة لا نظير لها، فهي غير قابلة للإرجاع إلا إذا وصلت تالفة أثناء الشحن.",
      },
      {
        q: "كيف يُعلَن عن الإصدارات؟",
        a: "تصدر الإصدارات الجديدة وفق جدول زمني، ويُعلَن عنها عبر البريد الإلكتروني وقنواتنا. ولأن الأعمال الأصلية والإصدارات المحدودة محدودة الكمية، فقد تنفد القطع الرائجة بسرعة، لذا يُفضّل المبادرة مبكرًا.",
      },
      {
        q: "كيف يتقاضى الفنانون أجورهم، وهل يمكنني البيع معكم؟",
        a: "نعمل بتقاسم عادل وشفاف مع كل فنان، وننسب العمل دائمًا إلى صانعه. إن كنت فنانًا مهتمًا بإصدار، فراسلنا — يسعدنا أن نطّلع على أعمالك.",
      },
      {
        q: "هل يمكنني طلب عمل مخصص أو تكليف فني؟",
        a: "يقبل بعض فنانينا التكليفات بين الإصدارات. راسلنا بما يدور في ذهنك وسننظر في إمكانية توصيلك بالفنان المناسب.",
      },
      {
        q: "هل يمكنني طلب قطعة بمقاس أو خامة مختلفة؟",
        a: "تتوفر بعض القطع بخيارات مقاسات أو خامات متعددة على صفحة المنتج. إن لم تجد ما تبحث عنه، راسلنا وسنُعلمك بما هو ممكن.",
      },
    ],
  },
};

export const pages = { about, contact, faq } as const;
