-- ============================================
-- ClimbingHub Indonesia — Seed Data
-- Run this AFTER migration.sql in Supabase SQL Editor
-- ============================================

-- ========== DEFAULT USERS ==========
INSERT INTO users (id, role, name, email, handle, avatar, grade_max, ascents_count) VALUES
  ('00000000-0000-0000-0000-000000000001', 'super_admin', 'Chief Route Curator', 'owner@climbhub.id', '@climbhub_admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80', 'Pemilik Website', 156),
  ('00000000-0000-0000-0000-000000000002', 'registered', 'Ahmad Rizki', 'ahmad.rizki@climbhub.id', '@ahmad_crusher', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80', 'V7 Crusher', 42);

-- ========== GYMS ==========
INSERT INTO gyms (id, name, city, province, image, rating, review_count, slots_morning, slots_afternoon, slots_evening, max_slots_morning, max_slots_afternoon, max_slots_evening, facilities, price_per_session, address, route_setters, description, phone, instagram) VALUES
  ('gym-1', 'Vertigo Boulder Gym', 'Jakarta Selatan', 'DKI Jakarta', 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80', 4.8, 342, 8, 3, 12, 20, 20, 30, ARRAY['Bouldering Wall','Lead Wall','Training Board','Locker','Shower','Cafe','Pro Shop'], 75000, 'Jl. Kemang Raya No.45, Kemang, Jakarta Selatan', ARRAY['Adi Prasetyo','Sari Dewi','Budi Santoso'], 'Gym bouldering premium di Kemang dengan 300+ problem dari VB hingga V10. Dikenal dengan setting kreatif dan komunitas yang solid.', '+6281234567890', '@vertigoboulder'),
  ('gym-2', 'Crux Climbing Bandung', 'Bandung', 'Jawa Barat', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80', 4.6, 218, 15, 7, 5, 25, 25, 25, ARRAY['Bouldering Wall','Spray Wall','Moonboard','Locker','Shower'], 60000, 'Jl. Dago No.123, Coblong, Bandung', ARRAY['Rizky Fauzan','Maya Sari'], 'Gym bouldering terbaik di Bandung dengan view pegunungan. Moonboard dan Spray Wall untuk training serius.', '+6282345678901', '@cruxclimbing.bdg'),
  ('gym-3', 'Summit Bloc Yogyakarta', 'Yogyakarta', 'DI Yogyakarta', 'https://images.unsplash.com/photo-1516592673884-4a382d1124c2?w=800&q=80', 4.7, 189, 18, 10, 20, 20, 20, 30, ARRAY['Bouldering Wall','Training Board','Locker','Cafe','Yoga Studio'], 55000, 'Jl. Malioboro Area, Yogyakarta', ARRAY['Arif Hidayat','Putri Wulandari','Joko Susilo'], 'Pusat bouldering Jogja yang nyaman. Community-focused dengan event rutin setiap bulan.', '+6283456789012', '@summitbloc.jogja'),
  ('gym-4', 'Grip Factory Surabaya', 'Surabaya', 'Jawa Timur', 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80', 4.5, 156, 5, 12, 8, 20, 25, 25, ARRAY['Bouldering Wall','Lead Wall','Locker','Pro Shop'], 65000, 'Jl. Raya Darmo No.88, Surabaya', ARRAY['Denny Kurniawan'], 'Gym bouldering terbesar di Surabaya dengan 250 problem. Setting rutin setiap 2 minggu.', '+6284567890123', '@gripfactory.sby');

-- ========== CRAG REGIONS ==========
INSERT INTO crag_regions (id, name, province, image, sector_count, problem_count) VALUES
  ('citatah', 'Tebing Citatah', 'Jawa Barat', 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80', 8, 147),
  ('harau', 'Lembah Harau', 'Sumatera Barat', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80', 5, 89),
  ('siung', 'Pantai Siung', 'DI Yogyakarta', 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1200&q=80', 12, 203);

-- ========== SECTORS ==========
INSERT INTO sectors (id, crag_id, name, image) VALUES
  ('citatah-sektor-a', 'citatah', 'Sektor A — Goa Pawon', 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80'),
  ('citatah-sektor-b', 'citatah', 'Sektor B — Tebing 125', 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=1200&q=80'),
  ('harau-echo', 'harau', 'Sektor Echo Valley & Granit Merah', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80'),
  ('siung-karang', 'siung', 'Sektor Karang Bolong & Blok Pantai', 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1200&q=80');

-- ========== ROUTES ==========
-- Citatah Sektor A: Batu Merah Direct (Sport)
INSERT INTO routes (id, sector_id, name, discipline, grade, font_grade, pitch_length, bolt_count, anchor_type, setter, fa, fa_date, description, beta_video_url, access_info, local_contact, ascent_count, grade_votes, markers) VALUES
  ('citatah-a-1', 'citatah-sektor-a', 'Batu Merah Direct', 'sport', '5.10d', '6b+', '24m', 9, 'Double Ring Chain Anchor', 'Andi Wahyu', 'Rizky Fauzan', '2019-03-15',
   'Jalur sport single pitch bertali di dinding karst Goa Pawon. Crux di bolt ke-4 melewati overhang tipis dan undercling kapur.',
   'https://www.youtube.com/embed/dQw4w9WgXcQ',
   'Dari Padalarang, ikuti jalan ke Gua Pawon ±3km. Parkir di area wisata (Rp 5.000). Jalan kaki 10 menit ke sektor.',
   'Pak Asep (Warga Lokal): +6281234567', 89,
   '[{"grade":"5.10c","votes":12},{"grade":"5.10d","votes":45},{"grade":"5.11a","votes":18}]'::jsonb,
   '[{"id":"m1","type":"S","x":25,"y":78},{"id":"m2","type":"Z","x":45,"y":52},{"id":"m3","type":"T","x":62,"y":20}]'::jsonb);

-- Citatah Sektor A: Kuda Laut (Bouldering)
INSERT INTO routes (id, sector_id, name, discipline, grade, font_grade, pad_recommendation, landing_quality, start_type, setter, fa, fa_date, description, access_info, local_contact, ascent_count, grade_votes, markers) VALUES
  ('citatah-a-2', 'citatah-sektor-a', 'Kuda Laut', 'bouldering', 'V6', '7A', '2 Crashpads + 1 Spotter', 'Bebatuan datar berumput', 'Sit Start (SS)', 'Sari Dewi', 'Sari Dewi', '2020-07-22',
   'Masalah bouldering kompresi sloper tanpa tali. Membutuhkan heel hook kuat dan body tension untuk keluar dari atap.',
   'Sama dengan akses Sektor A',
   'Pak Asep: +6281234567', 34,
   '[{"grade":"V5","votes":8},{"grade":"V6","votes":22},{"grade":"V7","votes":15}]'::jsonb,
   '[{"id":"m4","type":"S","x":30,"y":82},{"id":"m5","type":"T","x":55,"y":25}]'::jsonb);

-- Citatah Sektor B: Jurus Harimau (Bouldering)
INSERT INTO routes (id, sector_id, name, discipline, grade, font_grade, pad_recommendation, landing_quality, start_type, setter, fa, fa_date, description, access_info, local_contact, ascent_count, grade_votes, markers) VALUES
  ('citatah-b-1', 'citatah-sektor-b', 'Jurus Harimau', 'bouldering', 'V7', '7A+', '3 Crashpads + 2 Spotters', 'Miring dengan trap batu', 'Sit Start (SS)', 'Budi Santoso', 'Adi Prasetyo', '2021-11-05',
   'Classic boulder problem di Citatah. Gerakan dinamis dyno dari jugs rendah ke pinch tajam, finish dengan heel hook mantap.',
   'Dari Sektor A lanjut ±500m ke timur. Ikuti tanda cat merah di batu.',
   'Pak Dede: +6285678901234', 56,
   '[{"grade":"V6","votes":15},{"grade":"V7","votes":30},{"grade":"V8","votes":11}]'::jsonb,
   '[{"id":"m6","type":"S","x":20,"y":85},{"id":"m7","type":"Z","x":38,"y":58},{"id":"m8","type":"T","x":60,"y":22}]'::jsonb);

-- Citatah Sektor B: Tebing 125 Central Pillar (Sport)
INSERT INTO routes (id, sector_id, name, discipline, grade, font_grade, pitch_length, bolt_count, anchor_type, setter, fa, fa_date, description, access_info, local_contact, ascent_count, grade_votes, markers) VALUES
  ('citatah-b-2', 'citatah-sektor-b', 'Tebing 125 Central Pillar', 'sport', '5.11b', '6c', '32m', 12, 'Twin Stainless Rings', 'FPTI Jabar', 'Tim FPTI (2018)', '2018-06-10',
   'Single pitch sport climbing vertikal setinggi 32 meter di pilar utama Tebing 125. Crimp endurance intensif.',
   'Basecamp Tebing 125 Padalarang',
   'Pak Dede: +6285678901234', 41,
   '[{"grade":"5.11a","votes":10},{"grade":"5.11b","votes":24}]'::jsonb,
   '[{"id":"m9","type":"S","x":50,"y":90},{"id":"m10","type":"T","x":50,"y":15}]'::jsonb);

-- Harau: Granite Odyssey (Multi Pitch)
INSERT INTO routes (id, sector_id, name, discipline, grade, font_grade, total_pitches, total_height, pitch_breakdown, descent_info, setter, fa, fa_date, description, access_info, local_contact, ascent_count, grade_votes, markers) VALUES
  ('harau-multi-1', 'harau-echo', 'Harau Granite Odyssey', 'multipitch', '5.11a', '6c+', 4, '165m',
   '[{"pitchNumber":1,"grade":"5.9 (5c)","length":"40m","description":"Slab friction awal menyusuri retakan granit menuju teras anchor pertama."},{"pitchNumber":2,"grade":"5.11a (6c+)","length":"35m","description":"Crux pitch: dihedron corner tipis dengan finger jam dan layback menantang."},{"pitchNumber":3,"grade":"5.10b (6a+)","length":"45m","description":"Face climbing vertical dengan pocket kristal granit merah."},{"pitchNumber":4,"grade":"5.10a (6a)","length":"45m","description":"Mantle finish melewati lip dinding atas menuju stasiun puncak."}]'::jsonb,
   'Rapel 4 kali dari anchor stasiun berantai resmi dengan tali ganda 2x60m. Wajib gunakan helmet dan prusik backup.',
   'Ekspedisi Indonesia-Prancis', 'Pierre & Mak Etek (2017)', '2017-08-17',
   'Rute multi-pitch mahakarya di tebing granit Lembah Harau. Menawarkan sensasi pemanjatan dinding tinggi dengan panorama persawahan Minangkabau.',
   'Masuk kawasan wisata Lembah Harau, jalan kaki 15 menit dari Homestay Abdi ke dasar dinding Echo.',
   'Mak Etek (Pemandu Adat): +6281345678901', 28,
   '[{"grade":"5.10d","votes":5},{"grade":"5.11a","votes":19},{"grade":"5.11b","votes":4}]'::jsonb,
   '[{"id":"mh-start","type":"S","x":45,"y":92,"label":"S"},{"id":"mh-p1","type":"P","x":47,"y":72,"label":"P1"},{"id":"mh-p2","type":"P","x":50,"y":52,"label":"P2"},{"id":"mh-p3","type":"P","x":53,"y":32,"label":"P3"},{"id":"mh-top","type":"T","x":50,"y":12,"label":"T"}]'::jsonb);

-- Harau: Echo Chamber (Sport)
INSERT INTO routes (id, sector_id, name, discipline, grade, font_grade, pitch_length, bolt_count, anchor_type, setter, fa, fa_date, description, access_info, local_contact, ascent_count, grade_votes, markers) VALUES
  ('harau-sport-1', 'harau-echo', 'Echo Chamber', 'sport', '5.12a', '7a+', '28m', 11, 'M12 Marine Chain Anchor', 'Doni Pratama', 'Doni Pratama (2020)', '2020-09-12',
   'Single pitch sport climbing dengan crimp kristal mikro di granit licin. Sangat menguji daya tahan jari.',
   'Dasar tebing Echo Valley',
   'Mak Etek: +6281345678901', 19,
   '[{"grade":"5.11d","votes":6},{"grade":"5.12a","votes":13}]'::jsonb,
   '[{"id":"hs1","type":"S","x":30,"y":85},{"id":"hs2","type":"T","x":35,"y":22}]'::jsonb);

-- Siung: Ombak Samudera (Bouldering)
INSERT INTO routes (id, sector_id, name, discipline, grade, font_grade, pad_recommendation, landing_quality, start_type, setter, fa, fa_date, description, access_info, local_contact, ascent_count, grade_votes, markers) VALUES
  ('siung-boulder-1', 'siung-karang', 'Ombak Samudera', 'bouldering', 'V5', '6C', '2 Crashpads', 'Pasir pantai datar', 'Sit Start (SS)', 'Lokal Jogja', 'Bambang S. (2019)', '2019-05-10',
   'Boulder problem di bongkahan karst persis tepi pantai. Pendaratan nyaman di atas pasir putih dengan deburan ombak.',
   'Sisi timur Pantai Siung, 5 menit dari tempat parkir.',
   'Mas Danang (FPTI Siung): +6285678901234', 52,
   '[{"grade":"V4","votes":10},{"grade":"V5","votes":35},{"grade":"V6","votes":7}]'::jsonb,
   '[{"id":"sb1","type":"S","x":40,"y":80},{"id":"sb2","type":"T","x":45,"y":25}]'::jsonb);

-- Siung: Kuda Karst (Sport)
INSERT INTO routes (id, sector_id, name, discipline, grade, font_grade, pitch_length, bolt_count, anchor_type, setter, fa, fa_date, description, access_info, local_contact, ascent_count, grade_votes, markers) VALUES
  ('siung-sport-1', 'siung-karang', 'Kuda Karst', 'sport', '5.10b', '6a', '18m', 7, 'Marine Stainless Anchor', 'FPTI DIY', 'Tim FPTI (2015)', '2015-04-12',
   'Single pitch sport tebing karst dengan pocket tajam dan pegangan jug bersahabat untuk pemanjat menengah.',
   'Tebing sisi barat Pantai Siung',
   'Mas Danang: +6285678901234', 115,
   '[{"grade":"5.10a","votes":20},{"grade":"5.10b","votes":85},{"grade":"5.10c","votes":10}]'::jsonb,
   '[{"id":"ss1","type":"S","x":55,"y":88},{"id":"ss2","type":"T","x":58,"y":20}]'::jsonb);

-- ========== COMMUNITIES ==========
INSERT INTO communities (id, name, city, province, image, member_count, homebase, description, whatsapp, instagram, tags, members) VALUES
  ('comm-1', 'Jakarta Boulders Collective', 'Jakarta', 'DKI Jakarta', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', 124, 'Vertigo Boulder Gym',
   'Komunitas boulderer aktif Jakarta. Weekly session setiap Sabtu + outdoor trip bulanan ke Citatah.',
   'https://wa.me/+6281234567890', 'https://instagram.com/jakartabouldersco',
   ARRAY['Bouldering','Outdoor','Weekly Session'],
   '[{"name":"Ahmad Rizki","avatar":"https://i.pravatar.cc/60?img=1","role":"Founder"},{"name":"Dewi Pratiwi","avatar":"https://i.pravatar.cc/60?img=5","role":"Setter"},{"name":"Budi Santoso","avatar":"https://i.pravatar.cc/60?img=3","role":"Member"}]'::jsonb),

  ('comm-2', 'Bandung Rock Bloc', 'Bandung', 'Jawa Barat', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80', 87, 'Crux Climbing Bandung',
   'Squad bouldering Bandung. Focus pada teknik dan movement. Trip rutin ke Citatah dan Harau.',
   'https://wa.me/+6282345678901', 'https://instagram.com/bandungrockbloc',
   ARRAY['Technique','Movement','Trip'],
   '[{"name":"Rizky Fauzan","avatar":"https://i.pravatar.cc/60?img=7","role":"Captain"},{"name":"Maya Sari","avatar":"https://i.pravatar.cc/60?img=9","role":"Setter"}]'::jsonb),

  ('comm-3', 'Jogja Crag Collective', 'Yogyakarta', 'DI Yogyakarta', 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=80', 63, 'Summit Bloc Yogyakarta',
   'Komunitas climbing Yogyakarta. Fokus pada outdoor climbing di Siung dan dinding-dinding lokal.',
   'https://wa.me/+6283456789012', 'https://instagram.com/jogjacragco',
   ARRAY['Outdoor','Lead Climbing','Siung'],
   '[{"name":"Arif Hidayat","avatar":"https://i.pravatar.cc/60?img=11","role":"Organizer"},{"name":"Putri W.","avatar":"https://i.pravatar.cc/60?img=13","role":"Member"}]'::jsonb);
