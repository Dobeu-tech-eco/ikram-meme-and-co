// Bilingual legal / policy content for Ikram & Co. (إكرام).
// Operating entity: Dobeu Tech Solutions LLC. Contact: jeremyw@dobeu.net.
// All prose lives here so the page components stay thin and just map over it.

export type PolicySection = { heading: string; body: string[] }; // body = array of paragraphs
export type Policy = {
  title: string;
  updated: string;
  intro: string;
  sections: PolicySection[];
};
export type LegalKey = "tos" | "privacy" | "cookies" | "refunds" | "shipping";
export type LegalContent = Record<LegalKey, { en: Policy; ar: Policy }>;

const UPDATED_EN = "Last updated: July 15, 2026";
const UPDATED_AR = "آخر تحديث: ١٥ يوليو ٢٠٢٦";

export const legal: LegalContent = {
  tos: {
    en: {
      title: "Terms of Service",
      updated: UPDATED_EN,
      intro:
        "These Terms of Service govern your access to and use of the Ikram & Co. website and store, operated by Dobeu Tech Solutions LLC (“Ikram & Co.,” “we,” “us,” or “our”). By browsing our catalog, creating orders, or otherwise using the site, you agree to these Terms. If you do not agree, please do not use the site.",
      sections: [
        {
          heading: "Eligibility & accounts",
          body: [
            "You must be at least 18 years old, or the age of majority in your jurisdiction, to place an order. By purchasing, you confirm that the information you provide is accurate and that you are authorized to use the payment method presented at checkout.",
            "You are responsible for keeping your contact and delivery details current. We may refuse service, cancel orders, or limit quantities at our discretion, including where we suspect fraud or a violation of these Terms.",
          ],
        },
        {
          heading: "Products, orders & pricing",
          body: [
            "Ikram & Co. sells original one-of-one artworks, limited-edition sticker sheets and prints, and print-on-demand items from independent artists. Because much of our catalog is handmade or produced individually, colors, textures, and finishing may vary slightly from the images shown on screen.",
            "All prices are listed in the currency shown at checkout and are exclusive of shipping, taxes, and any import duties unless stated otherwise. We work to keep pricing and availability accurate, but errors can occur. If we discover a pricing or description error affecting your order, we may cancel the order and issue a full refund.",
            "An order is confirmed only when we send an order confirmation email. Submitting an order is an offer to purchase, which we may accept or decline.",
          ],
        },
        {
          heading: "Intellectual property & artist rights",
          body: [
            "All artwork, designs, illustrations, text, and imagery on the site are the property of the contributing artists or of Dobeu Tech Solutions LLC and are protected by copyright and other intellectual-property laws. Purchasing a physical item transfers ownership of that item only — it does not transfer any copyright, reproduction, or resale-for-profit rights in the underlying artwork.",
            "You may not reproduce, scan, redistribute, or create derivative commercial products from any work sold through Ikram & Co. without the written permission of the rights holder. We respect artists’ rights and expect our customers to do the same.",
          ],
        },
        {
          heading: "Prohibited use",
          body: [
            "You agree not to use the site for any unlawful purpose, to interfere with its operation or security, to scrape or harvest data, to misrepresent your identity, or to infringe the rights of the artists or of other users. We may suspend or terminate access for conduct that we reasonably believe violates these Terms or harms the community.",
          ],
        },
        {
          heading: "Disclaimers & limitation of liability",
          body: [
            "The site and its contents are provided “as is” and “as available” without warranties of any kind, whether express or implied, to the fullest extent permitted by law. We do not guarantee that the site will be uninterrupted, error-free, or free of harmful components.",
            "To the maximum extent permitted by law, Dobeu Tech Solutions LLC will not be liable for indirect, incidental, or consequential damages arising from your use of the site or products. Where liability cannot be excluded, it is limited to the amount you paid for the order giving rise to the claim. Nothing here is intended as legal advice.",
          ],
        },
        {
          heading: "Governing law & changes",
          body: [
            "These Terms are governed by the laws applicable to the place of business of Dobeu Tech Solutions LLC, without regard to conflict-of-law principles. Any dispute will be subject to the competent courts of that jurisdiction.",
            "We may update these Terms from time to time. The “last updated” date above reflects the current version, and continued use of the site after changes take effect constitutes acceptance of the revised Terms.",
          ],
        },
        {
          heading: "Contact",
          body: [
            "Questions about these Terms can be sent to jeremyw@dobeu.net. © 2026 Dobeu Tech Solutions LLC. All rights reserved.",
          ],
        },
      ],
    },
    ar: {
      title: "شروط الخدمة",
      updated: UPDATED_AR,
      intro:
        "تحكم شروط الخدمة هذه وصولك إلى موقع ومتجر إكرام (Ikram & Co.) واستخدامك له، والذي تُشغّله شركة Dobeu Tech Solutions LLC (“إكرام” أو “نحن”). باستعراض كتالوجنا أو إنشاء الطلبات أو استخدام الموقع بأي شكل، فإنك توافق على هذه الشروط. إذا كنت لا توافق عليها، فيرجى عدم استخدام الموقع.",
      sections: [
        {
          heading: "الأهلية والحسابات",
          body: [
            "يجب أن يكون عمرك ١٨ عامًا على الأقل، أو سن الرشد في بلدك، لتقديم طلب. بإتمام الشراء فإنك تؤكد أن المعلومات التي تقدّمها دقيقة وأنك مخوّل باستخدام وسيلة الدفع المستخدمة عند إتمام الطلب.",
            "أنت مسؤول عن تحديث بيانات التواصل والتوصيل الخاصة بك. يجوز لنا رفض الخدمة أو إلغاء الطلبات أو تقييد الكميات وفق تقديرنا، بما في ذلك عند الاشتباه في الاحتيال أو مخالفة هذه الشروط.",
          ],
        },
        {
          heading: "المنتجات والطلبات والأسعار",
          body: [
            "تبيع إكرام أعمالًا فنية فريدة من نوعها، وأوراق ملصقات ومطبوعات محدودة الإصدار، ومنتجات تُطبع عند الطلب من إبداع فنانين مستقلين. ولأن معظم منتجاتنا مصنوعة يدويًا أو تُنتج بشكل فردي، فقد تختلف الألوان والملمس والتشطيب اختلافًا طفيفًا عمّا يظهر على الشاشة.",
            "تُعرض جميع الأسعار بالعملة الظاهرة عند إتمام الطلب ولا تشمل الشحن أو الضرائب أو أي رسوم استيراد ما لم يُذكر خلاف ذلك. نحرص على دقة الأسعار والتوافر، لكن قد تقع أخطاء. وإذا اكتشفنا خطأً في السعر أو الوصف يؤثر على طلبك، فقد نلغي الطلب ونصدر استردادًا كاملًا.",
            "يُعتبر الطلب مؤكدًا فقط عند إرسالنا رسالة تأكيد الطلب عبر البريد الإلكتروني. إن تقديم الطلب يُعدّ عرضًا للشراء يجوز لنا قبوله أو رفضه.",
          ],
        },
        {
          heading: "الملكية الفكرية وحقوق الفنانين",
          body: [
            "جميع الأعمال الفنية والتصاميم والرسوم والنصوص والصور على الموقع مملوكة للفنانين المشاركين أو لشركة Dobeu Tech Solutions LLC، وهي محمية بموجب قوانين حقوق النشر والملكية الفكرية. إن شراء منتج مادي ينقل ملكية ذلك المنتج فقط، ولا ينقل أي حقوق نشر أو استنساخ أو إعادة بيع ربحية للعمل الفني الأصلي.",
            "لا يجوز لك استنساخ أي عمل يُباع عبر إكرام أو مسحه ضوئيًا أو إعادة توزيعه أو إنشاء منتجات تجارية مشتقة منه دون إذن كتابي من صاحب الحقوق. نحن نحترم حقوق الفنانين ونتوقع من عملائنا فعل الشيء ذاته.",
          ],
        },
        {
          heading: "الاستخدام المحظور",
          body: [
            "توافق على عدم استخدام الموقع لأي غرض غير قانوني، أو التدخل في تشغيله أو أمنه، أو استخراج البيانات منه، أو انتحال هويتك، أو انتهاك حقوق الفنانين أو المستخدمين الآخرين. يجوز لنا تعليق الوصول أو إنهاؤه بسبب أي سلوك نرى بشكل معقول أنه يخالف هذه الشروط أو يضرّ بالمجتمع.",
          ],
        },
        {
          heading: "إخلاء المسؤولية وحدودها",
          body: [
            "يُقدَّم الموقع ومحتواه “كما هو” و“حسب توفره” دون أي ضمانات من أي نوع، صريحة كانت أم ضمنية، إلى أقصى حد يسمح به القانون. لا نضمن أن يكون الموقع خاليًا من الانقطاع أو الأخطاء أو المكوّنات الضارة.",
            "إلى أقصى حد يسمح به القانون، لن تكون شركة Dobeu Tech Solutions LLC مسؤولة عن أي أضرار غير مباشرة أو عرضية أو تبعية تنشأ عن استخدامك للموقع أو المنتجات. وحيثما تعذّر استبعاد المسؤولية، فإنها تقتصر على المبلغ الذي دفعته مقابل الطلب محل المطالبة. لا يُقصد بأي مما ورد هنا أن يكون استشارة قانونية.",
          ],
        },
        {
          heading: "القانون الحاكم والتعديلات",
          body: [
            "تخضع هذه الشروط للقوانين المعمول بها في مقر عمل شركة Dobeu Tech Solutions LLC، دون اعتبار لمبادئ تنازع القوانين. ويخضع أي نزاع للمحاكم المختصة في تلك الولاية القضائية.",
            "قد نُحدّث هذه الشروط من حين لآخر. ويعكس تاريخ “آخر تحديث” أعلاه النسخة الحالية، ويُعدّ استمرارك في استخدام الموقع بعد سريان التغييرات قبولًا للشروط المعدّلة.",
          ],
        },
        {
          heading: "التواصل",
          body: [
            "يمكن إرسال الأسئلة حول هذه الشروط إلى jeremyw@dobeu.net. © ٢٠٢٦ Dobeu Tech Solutions LLC. جميع الحقوق محفوظة.",
          ],
        },
      ],
    },
  },

  privacy: {
    en: {
      title: "Privacy Policy",
      updated: UPDATED_EN,
      intro:
        "This Privacy Policy explains how Ikram & Co., operated by Dobeu Tech Solutions LLC, collects, uses, and protects your personal information when you visit our store or place an order. We aim to collect only what we need to fulfil your orders and improve your experience.",
      sections: [
        {
          heading: "Information we collect",
          body: [
            "When you place an order we collect your name, email address, shipping and billing address, and the contents of your order. Payment card details are entered directly with our payment processor and are never stored on our servers.",
            "We also collect limited technical information automatically, such as your device type, browser, and pages viewed, to keep the site secure and understand how it is used. If you subscribe to updates, we store your email address until you unsubscribe.",
          ],
        },
        {
          heading: "How we use your information",
          body: [
            "We use your information to process and ship orders, send order confirmations and transactional messages, provide customer support, prevent fraud, and comply with legal and tax obligations. With your consent, we may send occasional news about new drops and limited editions.",
          ],
        },
        {
          heading: "Processors we rely on",
          body: [
            "We use Stripe to process payments securely; Stripe receives the payment and billing information required to complete your transaction and handles it under its own privacy terms. We use Resend to deliver transactional emails such as order confirmations. These providers act as processors on our behalf and are permitted to use your data only to deliver their services to us.",
          ],
        },
        {
          heading: "Cookies & analytics",
          body: [
            "We use essential cookies to run the store and, only where you consent, analytics to understand aggregate usage. Our analytics run through PostHog and remain disabled until you accept analytics cookies in the consent banner. You can withdraw consent at any time. See our Cookie Policy for details.",
          ],
        },
        {
          heading: "Data retention",
          body: [
            "We retain order and transaction records for up to 7 years to meet accounting, tax, and legal requirements. Marketing contact data is kept until you unsubscribe, and analytics data is retained only in aggregated or de-identified form according to our provider settings.",
          ],
        },
        {
          heading: "Your rights",
          body: [
            "Depending on where you live, you may have the right to access, correct, delete, or export your personal data, and to object to or restrict certain processing. You can also opt out of marketing at any time using the link in our emails. To exercise any of these rights, contact us and we will respond within a reasonable time.",
          ],
        },
        {
          heading: "Contact",
          body: [
            "For privacy questions or requests, email jeremyw@dobeu.net. © 2026 Dobeu Tech Solutions LLC.",
          ],
        },
      ],
    },
    ar: {
      title: "سياسة الخصوصية",
      updated: UPDATED_AR,
      intro:
        "توضّح سياسة الخصوصية هذه كيف تقوم إكرام، التي تُشغّلها شركة Dobeu Tech Solutions LLC، بجمع معلوماتك الشخصية واستخدامها وحمايتها عند زيارتك لمتجرنا أو تقديمك لطلب. نسعى إلى جمع ما نحتاجه فقط لتلبية طلباتك وتحسين تجربتك.",
      sections: [
        {
          heading: "المعلومات التي نجمعها",
          body: [
            "عند تقديمك لطلب، نجمع اسمك وعنوان بريدك الإلكتروني وعنواني الشحن والفوترة ومحتويات طلبك. أما بيانات بطاقة الدفع فتُدخل مباشرة لدى معالج الدفع الخاص بنا ولا تُخزَّن أبدًا على خوادمنا.",
            "نجمع أيضًا معلومات تقنية محدودة تلقائيًا، مثل نوع جهازك ومتصفحك والصفحات التي تشاهدها، للحفاظ على أمن الموقع وفهم كيفية استخدامه. وإذا اشتركت في التحديثات، فإننا نحتفظ بعنوان بريدك الإلكتروني حتى تلغي الاشتراك.",
          ],
        },
        {
          heading: "كيف نستخدم معلوماتك",
          body: [
            "نستخدم معلوماتك لمعالجة الطلبات وشحنها، وإرسال تأكيدات الطلب والرسائل المتعلقة بالمعاملات، وتقديم دعم العملاء، ومنع الاحتيال، والامتثال للالتزامات القانونية والضريبية. وبموافقتك، قد نرسل أخبارًا من حين لآخر حول الإصدارات الجديدة والمحدودة.",
          ],
        },
        {
          heading: "الجهات المعالِجة التي نعتمد عليها",
          body: [
            "نستخدم Stripe لمعالجة المدفوعات بأمان؛ حيث تتلقى Stripe معلومات الدفع والفوترة اللازمة لإتمام معاملتك وتعالجها وفق شروط الخصوصية الخاصة بها. ونستخدم Resend لإرسال الرسائل المتعلقة بالمعاملات مثل تأكيدات الطلب. تعمل هذه الجهات كمعالِجين نيابةً عنا ولا يُسمح لها باستخدام بياناتك إلا لتقديم خدماتها لنا.",
          ],
        },
        {
          heading: "ملفات تعريف الارتباط والتحليلات",
          body: [
            "نستخدم ملفات تعريف ارتباط أساسية لتشغيل المتجر، ونستخدم التحليلات فقط عند موافقتك لفهم الاستخدام الإجمالي. تعمل تحليلاتنا عبر PostHog وتبقى معطّلة حتى تقبل ملفات تعريف ارتباط التحليلات في شريط الموافقة. يمكنك سحب موافقتك في أي وقت. راجع سياسة ملفات تعريف الارتباط لمزيد من التفاصيل.",
          ],
        },
        {
          heading: "الاحتفاظ بالبيانات",
          body: [
            "نحتفظ بسجلات الطلبات والمعاملات لمدة تصل إلى ٧ سنوات للوفاء بالمتطلبات المحاسبية والضريبية والقانونية. أما بيانات التواصل التسويقي فتُحفظ حتى تلغي الاشتراك، وتُحتفظ بيانات التحليلات فقط في صورة مجمّعة أو مجهّلة الهوية وفق إعدادات مزوّدنا.",
          ],
        },
        {
          heading: "حقوقك",
          body: [
            "بحسب مكان إقامتك، قد يكون لك الحق في الوصول إلى بياناتك الشخصية أو تصحيحها أو حذفها أو تصديرها، والاعتراض على معالجات معينة أو تقييدها. يمكنك أيضًا إلغاء الاشتراك في التسويق في أي وقت عبر الرابط الموجود في رسائلنا. لممارسة أي من هذه الحقوق، تواصل معنا وسنردّ خلال مدة معقولة.",
          ],
        },
        {
          heading: "التواصل",
          body: [
            "للأسئلة أو الطلبات المتعلقة بالخصوصية، راسلنا على jeremyw@dobeu.net. © ٢٠٢٦ Dobeu Tech Solutions LLC.",
          ],
        },
      ],
    },
  },

  cookies: {
    en: {
      title: "Cookie Policy",
      updated: UPDATED_EN,
      intro:
        "This Cookie Policy explains how Ikram & Co., operated by Dobeu Tech Solutions LLC, uses cookies and similar technologies on our store. It should be read together with our Privacy Policy.",
      sections: [
        {
          heading: "What cookies are",
          body: [
            "Cookies are small text files stored on your device when you visit a website. They help the site remember your actions and preferences, keep your session secure, and, where you allow it, help us understand how the site is used.",
          ],
        },
        {
          heading: "Essential cookies",
          body: [
            "Essential cookies are required for the store to function — they maintain your cart and checkout session, remember your language and theme preference, and protect against fraudulent activity. Because the site cannot work properly without them, these cookies are always active and do not require consent.",
          ],
        },
        {
          heading: "Analytics cookies",
          body: [
            "Analytics cookies help us understand aggregate usage — which pages are visited and how customers move through the store — so we can improve it. We use PostHog for this. Analytics remain switched off until you actively accept them, and no analytics cookies are set beforehand.",
          ],
        },
        {
          heading: "Managing consent",
          body: [
            "When you first visit, a consent banner lets you accept or decline analytics cookies. Your choice is remembered, and you can change it at any time. Declining analytics does not affect your ability to browse or place orders. You can also clear cookies through your browser settings, though doing so may reset your preferences.",
          ],
        },
        {
          heading: "Contact",
          body: [
            "If you have questions about our use of cookies, email jeremyw@dobeu.net. © 2026 Dobeu Tech Solutions LLC.",
          ],
        },
      ],
    },
    ar: {
      title: "سياسة ملفات تعريف الارتباط",
      updated: UPDATED_AR,
      intro:
        "توضّح سياسة ملفات تعريف الارتباط هذه كيف تستخدم إكرام، التي تُشغّلها شركة Dobeu Tech Solutions LLC، ملفات تعريف الارتباط والتقنيات المشابهة في متجرنا. وينبغي قراءتها مع سياسة الخصوصية الخاصة بنا.",
      sections: [
        {
          heading: "ما هي ملفات تعريف الارتباط",
          body: [
            "ملفات تعريف الارتباط هي ملفات نصية صغيرة تُخزَّن على جهازك عند زيارتك لموقع ما. وهي تساعد الموقع على تذكّر إجراءاتك وتفضيلاتك، والحفاظ على أمان جلستك، وعند سماحك بذلك، تساعدنا على فهم كيفية استخدام الموقع.",
          ],
        },
        {
          heading: "ملفات تعريف الارتباط الأساسية",
          body: [
            "ملفات تعريف الارتباط الأساسية ضرورية لعمل المتجر، فهي تحافظ على سلة التسوق وجلسة الدفع، وتتذكّر تفضيلات اللغة والمظهر، وتحمي من النشاط الاحتيالي. ولأن الموقع لا يعمل بشكل صحيح بدونها، تكون هذه الملفات نشطة دائمًا ولا تتطلب موافقة.",
          ],
        },
        {
          heading: "ملفات تعريف ارتباط التحليلات",
          body: [
            "تساعدنا ملفات تعريف ارتباط التحليلات على فهم الاستخدام الإجمالي، أي الصفحات التي تُزار وكيفية تنقّل العملاء في المتجر، حتى نتمكن من تحسينه. ونستخدم PostHog لهذا الغرض. وتبقى التحليلات معطّلة حتى تقبلها بشكل فعّال، ولا تُضبط أي ملفات تعريف ارتباط تحليلية قبل ذلك.",
          ],
        },
        {
          heading: "إدارة الموافقة",
          body: [
            "عند زيارتك الأولى، يتيح لك شريط الموافقة قبول ملفات تعريف ارتباط التحليلات أو رفضها. ويُحفظ اختيارك، ويمكنك تغييره في أي وقت. ولا يؤثر رفض التحليلات على قدرتك على التصفّح أو تقديم الطلبات. يمكنك أيضًا مسح ملفات تعريف الارتباط من إعدادات متصفحك، وإن كان ذلك قد يعيد ضبط تفضيلاتك.",
          ],
        },
        {
          heading: "التواصل",
          body: [
            "إذا كان لديك أسئلة حول استخدامنا لملفات تعريف الارتباط، راسلنا على jeremyw@dobeu.net. © ٢٠٢٦ Dobeu Tech Solutions LLC.",
          ],
        },
      ],
    },
  },

  refunds: {
    en: {
      title: "Refund & Returns Policy",
      updated: UPDATED_EN,
      intro:
        "We want you to love what you order from Ikram & Co. This policy explains when returns and refunds are available, and how the rules differ across original artworks, limited editions, and print-on-demand items. Ikram & Co. is operated by Dobeu Tech Solutions LLC.",
      sections: [
        {
          heading: "Original one-of-one artworks",
          body: [
            "Original artworks are unique, handmade pieces. Because each is one of a kind, originals are sold as final sale and are not eligible for return or exchange due to change of mind. Please review the listing details, dimensions, and photographs carefully before purchasing, and reach out with any questions beforehand.",
            "This does not affect your rights where an original arrives damaged or is materially not as described — see the section on damaged or incorrect items below.",
          ],
        },
        {
          heading: "Limited editions & prints",
          body: [
            "Unopened limited-edition sticker sheets and prints may be returned within 14 days of delivery, provided they are in original, resalable condition. To keep prints and stickers pristine, we cannot accept items that have been opened, applied, mounted, or damaged after delivery.",
          ],
        },
        {
          heading: "Print-on-demand items",
          body: [
            "Print-on-demand products are produced individually for your order, so they cannot be returned for change of mind. We will, however, replace or refund any print-on-demand item that arrives defective, misprinted, or damaged.",
          ],
        },
        {
          heading: "Damaged or incorrect items",
          body: [
            "If your order arrives damaged, defective, or incorrect, contact us within 14 days of delivery with your order number and clear photos of the item and packaging. We will arrange a replacement or a full refund, including return shipping where a return is required.",
          ],
        },
        {
          heading: "How to start a return",
          body: [
            "Email jeremyw@dobeu.net with your order number and the reason for the return. We will confirm whether the item qualifies and provide return instructions. Please do not send items back before receiving confirmation, as unauthorized returns may not be processed.",
          ],
        },
        {
          heading: "Refund timing",
          body: [
            "Approved refunds are issued to your original payment method through Stripe. Once we receive and inspect an eligible return (or approve a damage claim), please allow up to 10 business days for the refund to appear, depending on your bank or card issuer. Original shipping charges are non-refundable unless the return is due to our error.",
          ],
        },
      ],
    },
    ar: {
      title: "سياسة الاسترداد والإرجاع",
      updated: UPDATED_AR,
      intro:
        "نريدك أن تحبّ ما تطلبه من إكرام. توضّح هذه السياسة متى يكون الإرجاع والاسترداد متاحًا، وكيف تختلف القواعد بين الأعمال الفنية الأصلية والإصدارات المحدودة ومنتجات الطباعة عند الطلب. وتُشغّل إكرام شركة Dobeu Tech Solutions LLC.",
      sections: [
        {
          heading: "الأعمال الفنية الأصلية الفريدة",
          body: [
            "الأعمال الفنية الأصلية قطع فريدة مصنوعة يدويًا. ولأن كل قطعة فريدة من نوعها، تُباع الأعمال الأصلية كبيع نهائي ولا تخضع للإرجاع أو الاستبدال بسبب تغيّر الرأي. يرجى مراجعة تفاصيل المنتج وأبعاده وصوره بعناية قبل الشراء، والتواصل معنا لأي استفسار مسبقًا.",
            "لا يؤثر ذلك على حقوقك في حال وصل العمل الأصلي تالفًا أو مخالفًا للوصف بشكل جوهري، انظر قسم المنتجات التالفة أو الخاطئة أدناه.",
          ],
        },
        {
          heading: "الإصدارات المحدودة والمطبوعات",
          body: [
            "يمكن إرجاع أوراق الملصقات والمطبوعات محدودة الإصدار غير المفتوحة خلال ١٤ يومًا من التسليم، شرط أن تكون بحالتها الأصلية القابلة لإعادة البيع. وحفاظًا على سلامة المطبوعات والملصقات، لا يمكننا قبول العناصر التي فُتحت أو استُخدمت أو رُكّبت أو تضرّرت بعد التسليم.",
          ],
        },
        {
          heading: "منتجات الطباعة عند الطلب",
          body: [
            "تُنتَج منتجات الطباعة عند الطلب بشكل فردي خصيصًا لطلبك، لذا لا يمكن إرجاعها بسبب تغيّر الرأي. ومع ذلك، سنستبدل أو نسترد قيمة أي منتج طباعة عند الطلب يصل معيبًا أو بطباعة خاطئة أو تالفًا.",
          ],
        },
        {
          heading: "المنتجات التالفة أو الخاطئة",
          body: [
            "إذا وصل طلبك تالفًا أو معيبًا أو خاطئًا، فتواصل معنا خلال ١٤ يومًا من التسليم مع ذكر رقم طلبك وإرفاق صور واضحة للمنتج والتغليف. وسنرتّب لك بديلًا أو استردادًا كاملًا، بما في ذلك تكلفة شحن الإرجاع عند الحاجة إليه.",
          ],
        },
        {
          heading: "كيفية بدء الإرجاع",
          body: [
            "راسلنا على jeremyw@dobeu.net مع ذكر رقم طلبك وسبب الإرجاع. وسنؤكّد ما إذا كان المنتج مؤهلًا ونزوّدك بتعليمات الإرجاع. يرجى عدم إعادة إرسال المنتجات قبل تلقّي التأكيد، إذ قد لا تُعالَج عمليات الإرجاع غير المصرّح بها.",
          ],
        },
        {
          heading: "توقيت الاسترداد",
          body: [
            "تُصدَر المبالغ المستردة المعتمدة إلى وسيلة الدفع الأصلية عبر Stripe. وبمجرد استلامنا للإرجاع المؤهل وفحصه (أو الموافقة على مطالبة تلف)، يرجى إتاحة مدة تصل إلى ١٠ أيام عمل لظهور المبلغ المسترد، بحسب البنك أو جهة إصدار البطاقة. ورسوم الشحن الأصلية غير قابلة للاسترداد ما لم يكن الإرجاع بسبب خطأ منّا.",
          ],
        },
      ],
    },
  },

  shipping: {
    en: {
      title: "Shipping Policy",
      updated: UPDATED_EN,
      intro:
        "This Shipping Policy explains how and when Ikram & Co., operated by Dobeu Tech Solutions LLC, prepares and delivers your order. Because we ship original art, limited editions, and print-on-demand items, timelines can vary by product type.",
      sections: [
        {
          heading: "Processing time",
          body: [
            "Most in-stock orders are prepared and dispatched within 3–5 business days. Print-on-demand items are produced individually and typically add a few extra days before dispatch. Original artworks may require additional handling and careful packing; any longer lead time will be noted on the product listing or in your confirmation.",
            "Orders are processed on business days, excluding weekends and public holidays.",
          ],
        },
        {
          heading: "Carriers & delivery estimates",
          body: [
            "We ship using reputable postal and courier services, selected based on your destination and the fragility of the item. Once an order is dispatched, we will send a confirmation email with tracking details where available. Delivery estimates are provided by the carrier and are not guaranteed, as transit times can be affected by conditions outside our control.",
          ],
        },
        {
          heading: "International shipping",
          body: [
            "We ship internationally to most destinations. Delivery windows for international orders are longer than domestic ones and depend on the destination and customs processing. Please ensure your address and contact details are accurate, as we cannot be responsible for delays caused by incorrect delivery information.",
          ],
        },
        {
          heading: "Customs, duties & taxes",
          body: [
            "International orders may be subject to import duties, taxes, and customs fees charged by the destination country. These charges are the responsibility of the recipient and are not included in the product or shipping price. If a parcel is refused or returned because such charges were not paid, any refund will exclude the original shipping cost.",
          ],
        },
        {
          heading: "Lost or delayed shipments",
          body: [
            "If your tracking has not updated or your order has not arrived within the expected window, contact us at jeremyw@dobeu.net with your order number. We will work with the carrier to locate the parcel and, where a shipment is confirmed lost, arrange a replacement or refund.",
          ],
        },
      ],
    },
    ar: {
      title: "سياسة الشحن",
      updated: UPDATED_AR,
      intro:
        "توضّح سياسة الشحن هذه كيف ومتى تقوم إكرام، التي تُشغّلها شركة Dobeu Tech Solutions LLC، بتحضير طلبك وتوصيله. ولأننا نشحن أعمالًا فنية أصلية وإصدارات محدودة ومنتجات تُطبع عند الطلب، فقد تختلف المدد حسب نوع المنتج.",
      sections: [
        {
          heading: "مدة التجهيز",
          body: [
            "تُجهَّز معظم الطلبات المتوفّرة في المخزون وتُرسَل خلال ٣ إلى ٥ أيام عمل. أما منتجات الطباعة عند الطلب فتُنتَج بشكل فردي وتضيف عادةً بضعة أيام إضافية قبل الإرسال. وقد تتطلّب الأعمال الفنية الأصلية عناية إضافية وتغليفًا دقيقًا؛ وسيُذكر أي وقت تجهيز أطول في صفحة المنتج أو في رسالة التأكيد.",
            "تُعالَج الطلبات في أيام العمل، باستثناء عطلات نهاية الأسبوع والعطلات الرسمية.",
          ],
        },
        {
          heading: "شركات النقل وتقديرات التوصيل",
          body: [
            "نشحن عبر خدمات بريدية وشركات نقل موثوقة، تُختار بحسب وجهتك ومدى هشاشة المنتج. وبمجرد إرسال الطلب، سنرسل رسالة تأكيد تتضمّن تفاصيل التتبّع حيثما توفّرت. وتقديرات التوصيل تقدّمها شركة النقل وليست مضمونة، إذ قد تتأثّر مدد النقل بظروف خارجة عن سيطرتنا.",
          ],
        },
        {
          heading: "الشحن الدولي",
          body: [
            "نشحن دوليًا إلى معظم الوجهات. ومدد التوصيل للطلبات الدولية أطول من المحلية وتعتمد على الوجهة وإجراءات التخليص الجمركي. يرجى التأكد من صحة عنوانك وبيانات تواصلك، إذ لا يمكننا تحمّل مسؤولية التأخير الناتج عن معلومات توصيل غير صحيحة.",
          ],
        },
        {
          heading: "الجمارك والرسوم والضرائب",
          body: [
            "قد تخضع الطلبات الدولية لرسوم استيراد وضرائب ورسوم جمركية يفرضها بلد الوجهة. وتقع هذه الرسوم على عاتق المستلِم وهي غير مشمولة في سعر المنتج أو الشحن. وإذا رُفض الطرد أو أُعيد بسبب عدم سداد هذه الرسوم، فإن أي استرداد سيستثني تكلفة الشحن الأصلية.",
          ],
        },
        {
          heading: "الشحنات المفقودة أو المتأخرة",
          body: [
            "إذا لم يُحدَّث التتبّع أو لم يصل طلبك خلال المدة المتوقعة، فتواصل معنا على jeremyw@dobeu.net مع ذكر رقم طلبك. وسنعمل مع شركة النقل لتحديد موقع الطرد، وفي حال تأكّد فقدان الشحنة، سنرتّب لك بديلًا أو استردادًا.",
          ],
        },
      ],
    },
  },
};
