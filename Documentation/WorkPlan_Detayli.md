# AheryusGameBOX – Ayrıntılı İş Planı

## 0. Genel Bilgiler
- Proje Adı: AheryusGameBOX
- Referans Dokümanlar:
  - anatalimat.md (kanonik oturum ve proje kuralları)
  - Documentation/ProjeBaslangic.md (mimari ve domain referansı)
  - Documentation/Roadmap.md (faz bazlı teknik yol haritası)

## 1. Proje Roller ve Sorumluluklar
- **Ürün Sahibi / Proje Yöneticisi**
  - Roadmap önceliklendirmesi, scope yönetimi.
  - Sprint planlama ve kabul kriterlerinin onayı.
- **Teknik Lider / Mimar**
  - Backend ve frontend teknolojilerinin seçimi.
  - Mimari kararlar, kod kalitesi standartları, review süreçleri.
- **Backend Geliştirici(ler)**
  - Oyun sunucusu, API, veri tabanı şeması ve entegrasyonlar.
- **Frontend Geliştirici(ler)**
  - Mobil/web istemci arayüzleri, i18n, gerçek zamanlı etkileşim.
- **Oyun Tasarımcısı**
  - Oyun kuralları, mekanikler, denge ve akış tasarımı.
- **QA / Test Mühendisi**
  - Test senaryoları, otomasyon planı, regresyon kontrolü.

## 2. Sprint / Faz Organizasyonu (Öneri)
- Sprint süresi: 2 hafta (isteğe göre 1–3 hafta arasında ayarlanabilir).
- Fazların sprintlere dağıtımı:
  - Faz 0–1: Hazırlık + Domain & Veri Modeli (1–2 sprint).
  - Faz 2–3: Backend iskeleti + İlk oyun modülü (2–3 sprint).
  - Faz 4–5: Frontend MVP + Skor/ödül + Profil (2–3 sprint).
  - Faz 6–8: Test, loglama, admin panel, AI entegrasyonu başlangıcı (3+ sprint).

Her sprint için:
- Sprint Hedefi
- Sprint Backlog (iş kalemleri)
- Kabul Kriterleri
- Sprint Sonu Demo / Gözden Geçirme

## 3. Faz 0 – Hazırlık ve Altyapı (Detaylı)
### 3.1 Görevler
- F0-G1: Teknoloji sepetinin netleştirilmesi **(TAMAMLANDI – bkz. Documentation/Tech_Decisions.md)**
  - Backend için: Node.js + TypeScript (NestJS) seçimi yapıldı.
  - Frontend için: mobil öncelikli Flutter tercih edildi; web hedefi Flutter Web üzerinden sağlanacak.
  - Kararlar, Documentation/Tech_Decisions.md dosyasında gerekçeleriyle kaydedildi.
- F0-G2: Geliştirme ortamı standardı **(TAMAMLANDI – bkz. Documentation/Tech_Decisions.md)**
  - Versiyon kontrol sistemi: Git + GitHub (mevcut repo) ve branch stratejisi `main`/`develop`/`feature/*`.
  - Kod formatlama ve lint kuralları kararları belirlendi (ESLint + Prettier, `dart format`).
- F0-G3: CI/CD Taslak
  - Basit bir CI pipeline taslağı: lint + test + build aşamaları.
  - Henüz kod yokken yalnızca plan ve örnek YAML taslağı.
- F0-G4: Supabase Projesi Hazırlığı
  - Supabase instance oluşturma (web arayüzünden).
  - Proje için URL ve Anon Key’in güvenli biçimde saklama stratejisi (örn. `.env` dosyası, Git’e dahil edilmeyecek).

### 3.2 Kabul Kriterleri
- Teknoloji kararı yazılı hale getirilmiş (dokümante).
- Branch stratejisi ve temel Git çalışma akışı netleştirilmiş.
- Supabase için proje oluşturulmuş ve erişim bilgileri güvenli notlarda tutulmuş.

## 4. Faz 1 – Domain & Veri Modeli (Detaylı)
### 4.1 Görevler
- F1-G1: Kullanıcı / Auth Modeli
  - `users` tablosu için alan seti (id, email, display_name, created_at, last_login_at, language_pref, avatar_url vb.).
  - Supabase Auth ile eşleşecek kolonların belirlenmesi.
  - RBAC için role modeli taslağı (örn. `roles` tablosu veya JWT claim).
- F1-G2: Oyun ve Oturum Modeli
  - `games` tablosu:
    - id, name, type (board, word, social, card, puzzle), min_players, max_players, is_active, config_json.
  - `game_sessions` tablosu:
    - id, game_id, host_user_id, status (pending, active, finished), created_at, started_at, finished_at.
  - `session_players` tablosu:
    - id, session_id, user_id, join_time, leave_time, team, seat_order vb.
- F1-G3: Skor ve Ödül Modeli
  - `user_stats` tablosu:
    - user_id, total_xp, coins, level, wins, losses, draws.
  - `achievements` ve `user_achievements` tabloları için temel yapı.
- F1-G4: Hamle ve Oyun Durumu
  - `moves` tablosu:
    - id, session_id, player_id, move_data (JSON), move_number, created_at.
  - Oyun spesifik state için:
    - `session_state` benzeri bir tablo veya JSON alan.
- F1-G5: SQL Şema Taslaklarının Yazılması
  - Tüm tablolar için CREATE TABLE taslakları.
  - Documentation veya Project/config altında `schema.sql` gibi bir dosyada saklanması planı **(başlangıç versiyonu Project/config/schema/initial_schema.sql olarak eklendi)**.

### 4.2 Kabul Kriterleri
- Ana tablolar ve ilişki diyagramı tanımlanmış.
- Şema taslakları çalıştırılabilir (Supabase/Postgres ile uyumlu) olacak şekilde hazırlanmış.

## 5. Faz 2 – Backend Temel API ve Oyun İskeleti (Detaylı)
### 5.1 Görevler
- F2-G1: Backend Projesi Oluşturma
  - Seçilen framework ile boş proje başlatma (ör. NestJS CLI veya Express scaffolding).
  - Proje yapısının ana klasörleri: `src/modules`, `src/common`, `src/config`.
- F2-G2: Ortak Modüller
  - Config yönetimi (Supabase bağlantı bilgileri, port, env).
  - Logger servisi (JSON log formatı).
  - Hata yakalama middleware’i (global error handler).
- F2-G3: Auth / Kullanıcı Servisi API’leri
  - `/auth/me`, `/users/me`, temel kullanıcı profilini dönen uç noktalar için taslak.
  - Supabase JWT doğrulaması için middleware/guard tasarımı.
- F2-G4: Oyun Yönetimi API’leri
  - `GET /games`: aktif oyun listesini döner.
  - `POST /sessions`: yeni oyun oturumu başlatır.
  - `POST /sessions/{id}/join`: oyuncuyu oturuma ekler.
  - `GET /sessions/{id}`: herkese açık oturum state’ini döner.
- F2-G5: Oyun Motoru Arayüzü
  - Tüm oyunlar için ortak interface:
    - `initGame(config)`, `applyMove(state, move)`, `getPublicState(state)`, `getPlayerState(state, playerId)`.
  - Bu interface’i kullanacak bir `GameEngineService` taslağı.

### 5.2 Kabul Kriterleri
- Backend projesi ayağa kalkabilir durumda (hello world API).
- Temel oyun oturumu CRUD ve join akışının kablolanmış olması (henüz gerçek oyun kuralı olmadan).

## 6. Faz 3 – İlk Oyun Modülü (Detaylı)
### 6.1 Görevler
- F3-G1: Oyun Seçimi
  - Proje dokümanındaki kategorilerden birini MVP için seçme (ör. basit kelime oyunu).
  - Oyun kurallarının metinsel dokümantasyonu (giriş, hamle mekanikleri, bitiş koşulu).
- F3-G2: Oyun İçin Veri Modeli
  - Seçilen oyun için ek tablo/alan ihtiyaçları (örn. kelime listesi, soru bankası).
- F3-G3: Backend Oyun Mantığı
  - Seçilen oyunun `initGame`, `applyMove`, `getPublicState`, `getPlayerState` fonksiyonlarının implementasyonu.
  - Geçersiz hamle kontrolü, tur geçişleri, kazanma kaybetme durumlarının belirlenmesi.
- F3-G4: Test Senaryoları
  - Oyun kuralları için unit test’ler (geçerli/geçersiz hamle, oyun bitiş koşulları).

### 6.2 Kabul Kriterleri
- Seçilen oyun backend tarafında uçtan uca simüle edilebilir.
- Ana API üzerinden oturum açma, hamle gönderme ve sonuç alma akışı manuel/otomatik test edilebilir.

## 7. Faz 4 – Frontend MVP (Detaylı)
### 7.1 Görevler
- F4-G1: Proje İskeleti
  - Flutter veya React projesi başlatma.
  - Proje klasörleri: `lib/`, `src/components`, `src/screens` vb.
- F4-G2: i18n Altyapısı
  - `tr-TR` ve `en-US` locale dosyalarının oluşturulması.
  - Metinlerin sabit string yerine anahtarlar üzerinden kullanılması.
- F4-G3: Auth ve Giriş Akışı
  - Supabase SDK entegrasyonu (veya backend relay).
  - Giriş, kayıt, şifre sıfırlama ekranları (MVP kapsamı belirlenmiş).
- F4-G4: Ana Ekran ve Oyun Listesi
  - Oyun listesinin backend’den çekilmesi.
  - Oyun detayına ve oturum oluşturma/kaydolma ekranına yönlendirme.
- F4-G5: Oyun Ekranı (MVP)
  - Seçilen oyuna katılma, hamleleri görme ve gönderme.
  - Gerçek zamanlı güncellemeler için abonelik (Supabase Realtime / WebSocket).

### 7.2 Kabul Kriterleri
- Kullanıcı giriş yapıp en az bir oyunu başlatıp temel hamlelerini UI üzerinden oynayabilir.

## 8. Faz 5 – Skor, Ödül, Profil (Detaylı)
### 8.1 Görevler
- F5-G1: Backend Skor ve Ödül İşlemleri
  - Oyun bitişinde skor hesaplama fonksiyonu.
  - XP, coin, rozet güncellemesini tek transaction içinde yapan servis.
- F5-G2: Profil API’leri
  - `GET /profile` ve ilgili uç noktalar.
- F5-G3: Frontend Profil Ekranı
  - Kullanıcı total istatistikleri, rozetleri ve son oyun performansını gösteren ekran.
- F5-G4: Basit Leaderboard
  - Belirli periyotlar için (günlük/haftalık) skor listeleri (backend + UI).

### 8.2 Kabul Kriterleri
- Oyun bitiminden sonra skor ve ödüller doğru hesaplanıp ekranda gösteriliyor.

## 9. Faz 6–8 – Test, Admin, AI Entegrasyonu (Özet)
Detayları Documentation/Roadmap.md ile uyumlu olacak şekilde:
- Test otomasyonu, loglama, temel admin panel taslağı, moderasyon ve basit AI entegrasyonları için görev listeleri oluşturulacak.
- Bu fazlar genellikle MVP sonrasında genişleme / iyileştirme sprint’lerine bölünecek.

## 10. Geliştirme Aşamasına Geçiş İçin Hazırlık
- Bu iş planı ve Roadmap dokümanı tamamlandıktan sonra:
  - Git deposu başlatılır, dokümanlar commit edilir.
  - İlk teknik spike’lar (küçük prototipler) için task’ler açılır.
  - Sprint 1 için net backlog çıkarılır (özellikle Faz 0–1 görevleri).
