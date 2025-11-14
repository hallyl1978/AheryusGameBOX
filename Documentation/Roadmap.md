# AheryusGameBOX - Başlangıç Roadmap Taslağı

## 0. Amaç ve Kapsam
- Bu roadmap, anatalimat.md ve Documentation/ProjeBaslangic.md dokümanlarındaki mimari ve süreç kurallarına uygun olarak hazırlanmış başlangıç planıdır.
- Hedef: Çok platformlu (mobil, tablet, web) AheryusGameBOX oyun platformunun ilk çalışır sürümüne (MVP) ulaşmak.
- Ayrıntılı görev ve kabul kriterleri için bkz. `Documentation/WorkPlan_Detayli.md`.

## 1. Faz 0 – Hazırlık ve Altyapı
- [x] Standart klasör yapısının oluşturulması (Documentation, Project/src, assets, config, _temp, Sessions, Testing).
- [x] Oturum kayıt sisteminin devreye alınması (Sessions altında tarih/saat bazlı dosyalar).
- [ ] Supabase projesinin oluşturulması ve temel ayarların yapılması.
- [ ] Projede kullanılacak istemci teknolojisinin netleştirilmesi (Flutter, React/Next.js vb.).
- [ ] Geliştirme ortamı ve temel araçların belirlenmesi (versiyon kontrol, CI/CD taslağı).

## 2. Faz 1 – Çekirdek Domain ve Veri Modeli
- [ ] Kullanıcı ve kimlik doğrulama modeli:
  - Supabase Auth + Google Identity entegrasyonu için kullanıcı tablosu ve ilgili alanların belirlenmesi.
- [ ] Oyun ve oturum modeli:
  - `games`, `game_sessions`, `players`, `moves` benzeri tablolar için şema taslağı.
  - LAN ve bulut senaryolarını destekleyecek oturum kimliklendirme modeli.
- [ ] Skor ve ödül sistemi:
  - XP, coin, rozet ve seviye alanlarının veri tabanı taslağı.
- [ ] İlk SQL şema taslaklarının hazırlanması (Documentation veya Project/config altında saklanacak).

## 3. Faz 2 – Backend Temel API ve Oyun İskeleti
- [ ] Backend teknoloji seçimi (ör. Node.js/TypeScript, NestJS vb.) ve proje iskeletinin oluşturulması.
- [ ] Temel API uçları:
  - Oyun listarına erişim (`GET /games`).
  - Yeni oyun oturumu oluşturma (`POST /sessions`).
  - Oturuma katılma (`POST /sessions/{id}/join`).
  - Oturum durumunu ve herkese açık state’i getirme (`GET /sessions/{id}`).
- [ ] Oyun kuralları için ortak arayüz/fonksiyon imzaları:
  - `initGame`, `applyMove`, `getPublicState`, `getPlayerState` gibi fonksiyonların sözleşmesi.
- [ ] Hata yönetimi ve loglama için temel middleware (global error handler).

## 4. Faz 3 – İlk Oyun Modülü (Basit Board/Kelime Oyunu)
- [ ] Documentation/ProjeBaslangic.md’deki oyun türlerinden biri seçilerek MVP oyun tasarımı yapılması (örneğin basit bir kelime oyunu).
- [ ] Bu oyun için:
  - Kuralların dokümantasyonu.
  - Gerekli ek tabloların (oyun spesifik durumlar) belirlenmesi.
  - Backend tarafında oyun mantığının implementasyonu (kural motoru).
- [ ] Test senaryolarının belirlenmesi (unit + basic integration).

## 5. Faz 4 – İstemci (Frontend) MVP
- [ ] Ana ekran:
  - Giriş (auth) akışı (Supabase/Google).
  - Oyun listesinin gösterimi.
- [ ] Oyun ekranı:
  - Seçilen oyuna katılma.
  - Tur/hamle bazlı UI akışı.
  - Temel gerçek zamanlı güncelleme (Supabase Realtime veya WebSocket).
- [ ] i18n altyapısı:
  - tr-TR ve en-US için temel çeviri dosyalarının oluşturulması.
- [ ] Mobil öncelikli tasarım; web için uyumlu layout.

## 6. Faz 5 – Skor, Ödül ve Profil Ekranı
- [ ] Kullanıcı profil ekranı:
  - Toplam skor, seviye, rozetler, sanal para.
- [ ] Oyun sonu skor hesaplama ve ödül atama akışının tamamlanması.
- [ ] Basit leaderboard taslağı (günlük/haftalık skorlar).

## 7. Faz 6 – Test, Loglama ve Stabilizasyon
- [ ] Birim testler:
  - Oyun kuralları, skor hesaplama, yardımcı fonksiyonlar.
- [ ] Entegrasyon testleri:
  - Auth + oyun başlatma + hamle akışları.
- [ ] Temel yük testi senaryolarının belirlenmesi.
- [ ] Loglama stratejisi:
  - Backend için yapılandırılmış log formatı ve temel event’lerin (oturum açma, oyun başlama/bitiş, hata) kaydı.

## 8. Faz 7 – Admin Paneli İlk Taslak
- [ ] Admin rolü ve RBAC modeli (role claim veya ayrı role tablosu).
- [ ] Admin için temel ekranlar:
  - Kullanıcı listesi ve detayları.
  - Oyun listesi ve konfigürasyonları.
- [ ] Basit istatistik görünümü (aktif kullanıcı sayısı, en çok oynanan oyunlar).

## 9. Faz 8 – Yapay Zeka Entegrasyonu (İlk Adımlar)
- [ ] Moderasyon için metin filtresi entegrasyon taslağı (backend üzerinden).
- [ ] Basit içerik üretimi akışı:
  - Örneğin soru/puzzle üretimi için backend fonksiyonu tasarımı.
- [ ] AI bot oyuncular için uygun oyun seçimi ve basit strateji taslağı.

## 10. Sürekli İyileştirme ve Gelecek Fazlar
- [ ] Turnuva sistemi, arkadaş listesi, mesajlaşma vb. ileri seviye özellikler için ayrı faz dokümanları oluşturulacak.
- [ ] Her büyük özellik eklenmeden önce:
  - Documentation/ProjeBaslangic.md veya ilgili ek doküman güncellenecek.
  - Sonra geliştirilecek kod bu güncel dokümana göre planlanacak.

