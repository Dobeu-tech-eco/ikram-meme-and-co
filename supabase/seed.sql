-- Example / test catalog data for Ikram & Co.
-- Safe to re-run: ON CONFLICT (slug) DO NOTHING keeps existing rows untouched.
-- Apply to a linked Supabase project with:
--   pnpm supabase db execute --file supabase/seed.sql
-- (or against production once linked to the prod project ref).

insert into artists (slug, name_en, name_ar, bio_en, bio_ar, instagram) values
  ('layla-h', 'Layla H.', 'ليلى ح.', 'Cairo-born illustrator working in ink and gouache.', 'رسامة من القاهرة تعمل بالحبر والغواش.', 'layla.h.art'),
  ('omar-r', 'Omar R.', 'عمر ر.', 'Beirut-based painter exploring city light and memory.', 'رسام مقيم في بيروت يستكشف ضوء المدينة والذاكرة.', 'omar.r.studio'),
  ('nadia-k', 'Nadia K.', 'نادية ك.', 'Amman designer blending Arabic calligraphy with modern pattern.', 'مصممة من عمّان تمزج الخط العربي بالنمط الحديث.', 'nadia.k.design')
on conflict (slug) do nothing;

insert into products (slug, artist_id, title_en, title_ar, description_en, description_ar, price_cents, fulfillment_type, status, quantity, images)
select v.slug, a.id, v.title_en, v.title_ar, v.description_en, v.description_ar,
       v.price_cents::int, v.fulfillment_type::fulfillment_type, v.status::product_status, v.quantity::int, v.images::jsonb
from (values
  ('desert-moon-original', 'layla-h', 'Desert Moon — Original', 'قمر الصحراء — أصلية',
    'Original ink and gouache on paper, 30×40 cm. One of one.', 'حبر وغواش أصلي على ورق، ٣٠×٤٠ سم. قطعة واحدة فقط.',
    '24000', 'original', 'available', '1', '["placeholder-1.jpg"]'),
  ('desert-moon-sticker-edition', 'layla-h', 'Desert Moon Sticker Sheet — Edition of 50', 'ملصقات قمر الصحراء — إصدار من ٥٠',
    'Die-cut vinyl sticker sheet, numbered edition of 50.', 'ورقة ملصقات فينيل مقصوصة، إصدار مرقّم من ٥٠.',
    '1800', 'edition', 'available', '50', '["placeholder-2.jpg"]'),
  ('cairo-nights-original', 'omar-r', 'Cairo Nights — Original', 'ليالي القاهرة — أصلية',
    'Original acrylic on canvas, 50×70 cm. One of one.', 'أكريليك أصلي على قماش، ٥٠×٧٠ سم. قطعة واحدة فقط.',
    '52000', 'original', 'available', '1', '["placeholder-3.jpg"]'),
  ('cairo-nights-print', 'omar-r', 'Cairo Nights — Giclée Print, Edition of 100', 'ليالي القاهرة — طبعة جيكليه، إصدار من ١٠٠',
    'Archival giclée print, signed and numbered, edition of 100.', 'طبعة جيكليه أرشيفية موقّعة ومرقّمة، إصدار من ١٠٠.',
    '6500', 'edition', 'available', '100', '["placeholder-4.jpg"]'),
  ('calligraphy-study-original', 'nadia-k', 'Calligraphy Study No. 3 — Original', 'دراسة خط رقم ٣ — أصلية',
    'Original ink on handmade paper, 25×25 cm. One of one.', 'حبر أصلي على ورق مصنوع يدويًا، ٢٥×٢٥ سم. قطعة واحدة فقط.',
    '31000', 'original', 'available', '1', '["placeholder-5.jpg"]'),
  ('arabesque-tote-pod', 'nadia-k', 'Arabesque Tote — Print on Demand', 'حقيبة أرابيسك — طباعة عند الطلب',
    'Heavyweight cotton tote, printed to order and shipped in 5–7 days.', 'حقيبة قطنية ثقيلة، تُطبع عند الطلب وتُشحن خلال ٥–٧ أيام.',
    '2800', 'pod', 'available', '999', '["placeholder-6.jpg"]'),
  ('souk-patterns-sticker-pack', 'layla-h', 'Souk Patterns Sticker Pack — Edition of 200', 'حزمة ملصقات نقوش السوق — إصدار من ٢٠٠',
    'Pack of six vinyl stickers, edition of 200.', 'حزمة من ٦ ملصقات فينيل، إصدار من ٢٠٠.',
    '1200', 'edition', 'available', '200', '["placeholder-7.jpg"]')
) as v(slug, artist_slug, title_en, title_ar, description_en, description_ar, price_cents, fulfillment_type, status, quantity, images)
join artists a on a.slug = v.artist_slug
on conflict (slug) do nothing;
