insert into artists (slug, name_en, name_ar, bio_en, bio_ar) values
('layla-h', 'Layla H.', 'ليلى ح.', 'Cairo-born illustrator working in ink and gouache.', 'رسامة من القاهرة تعمل بالحبر والغواش.');

insert into products (slug, artist_id, title_en, title_ar, price_cents, fulfillment_type, status, quantity, images)
select 'desert-moon-original', id, 'Desert Moon — Original', 'قمر الصحراء — أصلية', 24000, 'original', 'available', 1, '["placeholder-1.jpg"]'
from artists where slug = 'layla-h';

insert into products (slug, artist_id, title_en, title_ar, price_cents, fulfillment_type, status, quantity, images)
select 'desert-moon-sticker-edition', id, 'Desert Moon Sticker Sheet — Edition of 50', 'ملصقات قمر الصحراء — إصدار من ٥٠', 1800, 'edition', 'available', 50, '["placeholder-2.jpg"]'
from artists where slug = 'layla-h';
