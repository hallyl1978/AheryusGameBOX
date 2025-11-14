
# Çok Platformlu Oyun Platformu – Teknik Tasarım ve Geliştirme Dokümanı
**Sürüm:** 1.0  
**Durum:** Tasarım / Başlangıç Uygulama Rehberi  
**Dil:** `tr-TR` (i18n için kaynak doküman)
**Proje/Uygulama Adı:AheryusGameBOX
** Github Adresi:	https://github.com/hallyl1978/AheryusGameBOX.git
** Supabase URL:
** Supabase Anon Key:

---

## 0. LLM ve İnsan Kullanımı İçin Kısa Özet

Bu doküman hem insanlar hem de büyük dil modelleri (LLM) tarafından okunup uygulanabilir olacak şekilde hazırlanmıştır.

- **İnsan geliştiriciler** için: genel mimari, teknoloji seçimi, veri tabanı şeması, oyun modül yapısı, yapay zeka entegrasyonu ve yönetim paneli gereksinimlerini anlatan ayrıntılı bir rehberdir.  
- **LLM’ler için:**  
  - Her bölüm net başlıklarla ayrılmıştır.  
  - Uygulanabilir talimatlar `### Uygulama Notları (LLM)` alt başlıklarında toplanmıştır.  
  - Kod üretirken bu dokümanı “sistemin iş kuralları ve mimari referansı” olarak kabul etmelidir.

LLM, kod üretirken:
1. Dokümandaki mimari ve veri modeli varsayılan kabul edilmeli,
2. Farklı bir mimari istenmedikçe buradaki kavram adları (tablo isimleri, servis isimleri, vb.) korunmalıdır.

---

## 1. Genel Bakış ve Hedefler

### 1.1 Proje Tanımı

Bu proje, **yerel LAN ağında** veya **sunucu üzerinden** çalışabilen, ağırlıklı olarak **mobil ve tablet** odaklı ancak **web üzerinden de kullanılabilen** bir **çoklu oyun platformu**dur.

Platformda aşağıdaki türlerde oyunlar desteklenecektir:

- Monopoly tarzı **kutu / board oyunları**
- **Kelime oyunları** (kelime bulma, anagram, bilgi yarışması)
- **Sosyal dedüksiyon oyunları** (Vampir Köylü benzeri)
- **Okey ve kağıt oyunları**
- **Bilmece, bulmaca, Sudoku** gibi tek veya çok oyunculu puzzle oyunları
- İleride eklenecek diğer oyun türleri (kategori bazlı genişletilebilir yapı)

### 1.2 Temel Özellikler

- Sunucu temelli mimari, **yerel ağ (LAN) modu** desteği
- **Gerçek zamanlı** çok oyunculu oyunlar (turn-based ve gerektiğinde near real-time)
- **Supabase + Google** üzerinden kimlik doğrulama
- Başlangıçta **Türkçe ve İngilizce**, ileride kolayca genişletilebilir **çoklu dil (i18n)** altyapısı
- **Skor, sanal para, rozet ve seviye** bazlı ödül ve oyunlaştırma sistemi
- **Yönetim paneli** (oyun yönetimi, kullanıcı istatistikleri, içerik yönetimi, moderasyon, ayarlar)
- **Yapay zeka entegrasyonu**:
  - Metin moderasyonu
  - Oyun içi öneri ve ipuçları
  - Kişiselleştirilmiş öneriler (oyun tavsiyesi, zorluk ayarı)
  - İçerik üretimi (bilmece, soru, puzzle üretimi)

### 1.3 Hedefler

- Tek bir platform altında çok sayıda masaüstü, kart ve puzzle oyununu **modüler** şekilde sunmak
- **Yönetilebilir ve genişletilebilir** bir mimari kurmak
- Oyunları hem gerçek kullanıcılarla hem de istenirse **AI botlar** ile oynanabilir kılmak
- Hem **bulut sunucuda** hem de **yerel ağda** çalışabilecek esnek bir yapı oluşturmak

### Uygulama Notları (LLM)

- Bu doküman, platformun **kanonik iş gereksinimleri** olarak kabul edilmelidir.
- Yeni kod / modül üretirken önce ilgili bölümü bul (ör: veri tabanı için Bölüm 6).

---

## 2. Mimari Genel Bakış

### 2.1 Yüksek Seviye Mimarisi

- **İstemci (Client):**
  - Mobil (Android, iOS)
  - Tablet
  - Web tarayıcı
- **Sunucu (Backend / Game Server):**
  - Oyun kuralları, skor, ödül sistemi ve oturum yönetimi
  - Gerçek zamanlı iletişim (WebSocket / Supabase Realtime)
- **Veri Tabanı ve Backend Servisleri:**
  - Supabase (PostgreSQL + Auth + Realtime)
- **Yapay Zeka Servisleri:**
  - Dış API veya kendi model servisleri
  - Moderasyon, öneri, içerik üretimi, bot oyuncu
- **Yönetim Paneli:**
  - Web tabanlı admin arayüzü

### 2.2 Sunucu ve Yerel Ağ Desteği

- **Bulut modu:**
  - Backend sunucusu (ör. Node.js) internet üzerinden erişilebilir
  - Supabase bulut hizmeti kullanılır
- **Yerel ağ modu:**
  - Aynı backend sunucusu LAN üzerinde çalıştırılır
  - İstemciler lokal IP ile bağlanır
  - İki yaklaşım:
    1. LAN sunucusu yine internet üzerinden Supabase kullanır (internet varsa)
    2. Gelişmiş senaryo: self-hosted Supabase ya da offline “guest auth” modu

### 2.3 Bileşenler

1. **API & Game Server:**
   - REST/GraphQL API + WebSocket
   - Oyun odaları, oturum yönetimi, maç sonuçları
2. **Realtime Katmanı:**
   - WebSocket veya Supabase Realtime kanal altyapısı
3. **Veri Katmanı:**
   - PostgreSQL (Supabase) – kullanıcılar, oyunlar, skorlar, ödüller, içerik
4. **İstemci Uygulamalar:**
   - Tek kod tabanı ile mobil + web (Flutter veya React + React Native)
5. **Yönetim Paneli:**
   - Admin rolleri, içeriği ve kullanıcıları yönetir
6. **Yapay Zeka Servisleri:**
   - HTTP/HTTPS ile backend üzerinden çağrılır

### Uygulama Notları (LLM)

- Oyun kuralları **kesinlikle sunucu tarafında** uygulanmalıdır (cheat önleme).
- İstemci “view + input” katmanıdır; state’in tek doğru kaynağı sunucudur.

---

## 3. Teknoloji Yığını (Tech Stack)

### 3.1 Backend

- Dil: **TypeScript + Node.js**
- Framework önerisi:
  - Minimal: Express / Fastify
  - Daha yapısal: NestJS
- Realtime:
  - Seçenek A: Supabase Realtime kanalları
  - Seçenek B: Socket.io WebSocket sunucusu
- Kullanım:
  - Oyun odası yönetimi
  - HTTP API (kullanıcı profili, skorlar, admin işlemleri)
  - AI servisleri ile entegrasyon

### 3.2 Veri Tabanı ve Auth

- **Supabase (PostgreSQL)**
  - Auth (e-posta/şifre + Google OAuth)
  - Realtime (kanallar ve değişiklik bildirimleri)
  - PostgREST ile hızlı CRUD API’ler
- DB için migration aracı (Knex, Prisma, Supabase migrations)

### 3.3 İstemci (Client)

**Tercih 1 – Flutter (önerilen):**  
- Tek kod tabanıyla Android, iOS ve Web
- Supabase Flutter SDK ile entegrasyon
- Durum yönetimi: Riverpod / Bloc

**Tercih 2 – React + React Native:**  
- Web için React, mobil için React Native
- Kod paylaşımı için ortak oyun mantığı modülleri

### 3.4 Diğer

- Container: Docker (backend + opsiyonel self-hosted Supabase)
- CI/CD: GitHub Actions / GitLab CI
- Log ve hata takibi: Sentry benzeri bir servis

### Uygulama Notları (LLM)

- Backend için NestJS + TypeScript şablonları üretirken modüler mimari (modules, services, controllers) kullanılmalıdır.
- Flutter tercihinde Supabase Flutter SDK ve WebSocket bağlantılarını kullanacak örnek kodlar üretilebilir.

---

## 4. Oyun Modül Mimarisi

### 4.1 Modüler Oyun Yapısı

Her oyun, aşağıdaki arayüzü/konsepti sağlayan bir **oyun modülü** olarak tasarlanır:

- `initGame(players, config)` – oyunu başlat
- `applyMove(state, playerId, move)` – oyuncu hamlesini uygula, geçerli mi kontrol et
- `getPublicState(state, playerId?)` – istemciye gönderilecek state’i hazırla
- `isGameOver(state)` – oyun bitti mi?
- `calculateResults(state)` – kazanan/puan bilgisi

Oyun türüne göre (kutu oyunu, kelime oyunu, puzzle, kart oyunu) bu arayüzün detayları genişletilebilir.

### 4.2 Oyun Kategorileri

- **Board Games (Kutu Oyunları)**
  - Örnek: Monopoly benzeri oyun
  - Özellik: taş hareketleri, zar, kartlar
- **Kelime Oyunları**
  - Örnek: kelime bul, anagram, bilgi yarışması
  - Özellik: dil bağımlı içerik
- **Sosyal Oyunlar (Vampir Köylü)**
  - Roller, gece/gündüz fazları, oylama
- **Kart/Okey Oyunları**
  - Okey, pişti, vs.
- **Puzzle / Bulmaca**
  - Bilmece, Sudoku, mantık bulmacaları

### 4.3 Lobby ve Oyun Odaları

- Kullanıcılar lobby’de:
  - Oyun seçer
  - Oda oluşturur veya mevcut odaya katılır
- Oyun odası:
  - ID, oyun tipi, max oyuncu sayısı, durum (beklemede, oynanıyor, bitti)
  - Realtime kanalına karşılık gelir

### Uygulama Notları (LLM)

- Yeni bir oyun için önce **oyun modülü** oluştur, sonra bunu “Game Registry” içine kaydet.
- Lobby ekranı, backend’den gelen `Games` tablosu ve ayarlara göre dinamik oluşturulmalıdır.

---

## 5. Kimlik Doğrulama ve Kullanıcı Yönetimi

### 5.1 Supabase Auth + Google OAuth

- Kullanıcılar:
  - E-posta/şifre ile kayıt
  - Google hesabı ile giriş (OAuth)
- Supabase, token üretim ve yenileme işlemlerini üstlenir.
- İstemci; aldığını JWT’yi backend ve Supabase isteklerinde kullanır.

### 5.2 Kullanıcı Profili

Ek profil alanları için örnek tablo (`user_profiles`):

- `id` (uuid, Supabase auth user id)
- `username`
- `display_name`
- `avatar_url`
- `preferred_language` (tr, en, ...)
- `level`, `xp`, `coins` (sanal para)
- `created_at`, `updated_at`

### 5.3 Yerel Ağ / Offline Senaryosu

- Temel varsayım: LAN modunda dahi Supabase erişilebilir ise standart auth kullanılır.
- Tamamen offline istenirse gelişmiş opsiyon:
  - self-hosted Supabase
  - veya sunucu tarafında basit “guest kullanıcı” mekanizması

### Uygulama Notları (LLM)

- Backend API, gelen istekteki JWT’yi doğrulamalı (middleware / guard).
- Flutter veya React tarafında “AuthProvider” benzeri bir yapı ile kullanıcının giriş durumu yönetilmelidir.

---

## 6. Veri Tabanı Tasarımı (Şema Önerisi)

Not: İsimler örnektir, proje ilerledikçe refine edilebilir.

### 6.1 Temel Tablolar

1. `users` (Supabase auth altında, sistem tablosu)
2. `user_profiles`
3. `games`
4. `game_sessions`
5. `game_session_players`
6. `moves` (opsiyonel, hamle logları)
7. `scores` / `points_history`
8. `virtual_currency_transactions`
9. `badges`
10. `user_badges`
11. `leaderboards` (opsiyonel, özet tablosu)
12. `localized_content` (riddles vs.)
13. `settings`

### 6.2 Örnek Tablo Şemaları (Basitleştirilmiş)

**games**  
- `id` (uuid)  
- `code` (text, örn: "MONO_01", "WORD_QUIZ")  
- `name_tr`, `name_en`  
- `category` (board, word, social, puzzle, card)  
- `min_players`, `max_players`  
- `is_active` (bool)  
- `created_at`, `updated_at`  

**game_sessions**  
- `id` (uuid)  
- `game_id` (fk -> games)  
- `status` (waiting, running, finished)  
- `started_at`, `ended_at`  
- `config` (jsonb – oda ayarları)  

**game_session_players**  
- `id` (uuid)  
- `session_id` (fk -> game_sessions)  
- `user_id` (fk -> user_profiles)  
- `seat_index` (int)  
- `role` (ör. vampir, köylü; jsonb de olabilir)  
- `score` (int)  
- `result` (win/lose/draw)  

**scores / points_history**  
- `id`  
- `user_id`  
- `session_id` (nullable – bazı ödüller oturum dışı olabilir)  
- `delta_points` (int)  
- `reason` (text)  
- `created_at`  

**virtual_currency_transactions**  
- `id`  
- `user_id`  
- `amount` (+/-)  
- `type` (reward, purchase, refund, promo, vs.)  
- `metadata` (jsonb)  
- `created_at`  

**badges**  
- `id`  
- `code`  
- `name_tr`, `name_en`  
- `description_tr`, `description_en`  
- `icon_url`  
- `criteria` (jsonb)  

**user_badges**  
- `id`  
- `user_id`  
- `badge_id`  
- `unlocked_at`  

### Uygulama Notları (LLM)

- SQL oluştururken PostgreSQL + Supabase uyumlu syntax kullanılmalıdır.
- Tablo isimleri ve alanlar bu dokümana göre oluşturulmalı, ama gerektiğinde nullable vs. konuları proje aşamasında netleştirilebilir.

---

## 7. Gerçek Zamanlı İletişim ve Networking

### 7.1 WebSocket / Realtime Yapısı

- Her oyun oturumu için bir **kanal / oda** oluşturulur: `game_session:<session_id>`
- Oyuncular bu kanala subscribe olur.
- Mesaj türleri (örnek):
  - `PLAYER_JOINED`
  - `PLAYER_LEFT`
  - `GAME_STARTED`
  - `MOVE_APPLIED`
  - `GAME_STATE_SYNC`
  - `GAME_FINISHED`
- Sunucu, gelen hamleyi doğrular ve tüm oyunculara yeni state veya “hamle sonucu” gönderir.

### 7.2 Turn-Based Yönetimi

- Sunucu, `current_player_id` veya `current_turn_index` bilgisini state’de tutar.
- İstemci, kendi sırası değilse hamle göndermeyi UI’dan engeller.
- Sunucu, her istekte yine de **sıra kontrolü** yaparak güvence sağlar.

### 7.3 Bağlantı Kopma ve Yeniden Bağlanma

- Oyuncu bağlantısı koptuğunda:
  - Presence / socket disconnect event tetiklenir
  - Oyun kuralına göre:
    - Zamanlayıcı ile bekleme ve geri dönmezse bot devralma
    - Veya oyunun iptal edilmesi / duraklatılması
- Yeniden bağlanma:
  - İstemci, session_id ile tekrar bağlanır
  - Sunucu son state’i `GAME_STATE_SYNC` ile gönderir

### Uygulama Notları (LLM)

- Flutter tarafında `web_socket_channel` veya Supabase Realtime client kullanılabilir.
- Node tarafında Socket.io veya Supabase Realtime kanalları ile örnek kodlar üretilebilir.

---

## 8. Uluslararasılaşma (i18n) ve Yerelleştirme (l10n)

### 8.1 Metinlerin Ayrıştırılması

- Tüm UI metinleri, sabit mesajlar ve oyun içi sistem mesajları **koddan ayrılmalı**.
- Örnek JSON yapısı:
  ```json
  {
    "MENU_PLAY": "Oyuna Başla",
    "MENU_SETTINGS": "Ayarlar"
  }
  ```
  ve İngilizce için aynı anahtarlarla farklı değerler.

### 8.2 Dil Seçimi ve Kayıt

- Uygulama ilk açıldığında:
  - Cihaz diline göre varsayılan dil
  - Kullanıcı dilerse ayarlardan değiştirir
- Seçili dil, `user_profiles.preferred_language` alanında saklanır.

### 8.3 Dil Bağımlı Oyun İçeriği

- Kelime oyunları ve bilmeceler dil bağımlıdır.
- `localized_content` tablosu veya oyun bazlı içerik tabloları:
  - `language` alanı ile içerik hangi dile ait olduğu belirtilir.
- Oyun odası oluşturulurken, oda dili seçilir ve tüm oyuncular için aynı dil kullanılır.

### Uygulama Notları (LLM)

- Flutter’da `intl` / `easy_localization`, React’te `react-i18next` gibi paketler kullanılabilir.
- Kod üretirken string literal yerine i18n anahtarları kullanılmalıdır.

---

## 9. Skor, Ödül ve Oyunlaştırma Sistemi

### 9.1 Puan ve Seviye (XP)

- Her oyun sonunda oyuncular:
  - Katılım puanı
  - Kazanma / kaybetme durumuna göre ek puan
- Toplam XP, seviyeyi belirler (seviye eşikleri konfigüre edilebilir).
- Seviye atlayınca özel bildirim ve gerekirse ödül (sanal para, rozet).

### 9.2 Sanal Para Birimi

- Kullanıcıların `coins` bakiyesi bulunur.
- Kazanma, görev tamamlama, günlük giriş gibi aksiyonlarla coin kazanılır.
- Gelecekte:
  - Kozmetik öğeler
  - Özel oda türleri vs. için harcanabilir.

### 9.3 Rozetler (Badges) ve Başarımlar

- Belirli kriterlere ulaşınca rozet kazanılır:
  - Örn. 100 maç oynamak
  - Aynı oyunda 10 galibiyet serisi vb.
- Rozetler profil sayfasında gösterilir.
- Kriterler `badges.criteria` alanında JSON olarak tanımlanabilir.

### 9.4 Liderlik Tabloları (Leaderboards)

- Global ve oyun bazlı leaderboard’lar:
  - Toplam puan, seviye, kazanma oranı
- Periyodik (haftalık/aylık) leaderboard’lar:
  - Yeni başlayanların da şans bulması için.

### Uygulama Notları (LLM)

- Oyun bitiş mantığında (server tarafı) skor hesaplama ve ödül atama fonksiyonları çağrılmalıdır.
- DB güncellemeleri **transaction** ile yapılmalıdır (XP + coin + rozet birlikte).

---

## 10. Hata Yönetimi ve Loglama

### 10.1 İstemci Tarafı

- Ağ hatalarında kullanıcıya anlamlı mesajlar:
  - “Sunucuya bağlanılamadı, lütfen internetinizi kontrol edin”
- Beklenmeyen hatalarda:
  - Temiz fallback ekran (uygulama çökmeden)
  - Gerekirse loglama servisine hata raporu

### 10.2 Sunucu Tarafı

- Tüm API’lerde try/catch ile global error handler
- Beklenen hatalar:
  - Yetkisiz erişim, geçersiz hamle, parametre eksikliği
- Beklenmeyen hatalar:
  - Stack trace’ler loglanır, kullanıcıya genel bir hata mesajı döner

### 10.3 Loglama

- Öneri: yapılandırılmış JSON log
- Kayıt altına alınacaklar:
  - Önemli event’ler (oturum açma, oyun başlama/bitiş, hata oluşumu)
- Harici izleme:
  - Sentry / LogRocket / benzeri servis

### Uygulama Notları (LLM)

- Backend kodunda global error middleware yazılmalı.
- Flutter’da `runZonedGuarded` veya benzeri mekanizmalar ile global hata yakalama örnekleri üretilebilir.

---

## 11. Geliştirme, Test ve Dağıtım Süreci

### 11.1 Geliştirme Süreci

- Git tabanlı workflow:
  - `main` / `develop` / feature branch’ler
- PR ve kod inceleme
- Otomatik testler (CI) – unit + basic integration

### 11.2 Test Türleri

- **Unit test:** Oyun kuralları, skor hesaplama, yardımcı fonksiyonlar
- **Integration test:** Auth + oyun başlatma + hamle akışı
- **Load test:** Aynı anda onlarca oyun ve yüzlerce oyuncu senaryosu
- **Kullanılabilirlik testi:** UI/UX, çoklu dil, küçük ekranlar

### 11.3 Ortamlar

- **Development:** Lokal ortam
- **Staging:** Gerçekçi veritabanı + neredeyse production’a eş
- **Production:** Canlı ortam, izleme ve alarm mekanizmaları

### 11.4 Dağıtım

- Backend:
  - Docker imajları, container orchestrator’da (veya basit VM)
- Web:
  - Statik build + CDN
- Mobil:
  - Google Play ve App Store dağıtımı

### Uygulama Notları (LLM)

- CI pipeline tanımı üretirken:
  - Lint + test + build aşamalarını içeren YAML dosyaları üretilebilir.
- Dockerfile örnekleri backend için dokümana göre hazırlanmalıdır.

---

## 12. Yönetim Paneli (Admin Panel)

### 12.1 Özellikler

- **Oyun Yönetimi:**
  - Oyun ekleme/çıkarma
  - Oyun konfigürasyonlarını düzenleme
- **Kullanıcı Yönetimi:**
  - Kullanıcı arama, profil görüntüleme
  - Ban / suspend / sanal para düzeltme
- **İçerik Yönetimi:**
  - Bilmece/puzzle ekleme, düzenleme, silme
  - Çoklu dil içerikleri düzenleme
- **İstatistik ve Raporlama:**
  - Aktif kullanıcı sayısı
  - En çok oynanan oyunlar
  - Günlük/haftalık metrikler
- **Moderasyon:**
  - Şikayet / rapor inceleme
  - AI tarafından işaretlenen içerikleri gözden geçirme
- **Ayarlar:**
  - Özellik bayrakları (feature flags)
  - Bakım modu, duyurular

### 12.2 Teknik

- Web tabanlı (React, Next.js veya Admin template)
- Admin rolü bulunan kullanıcılar giriş yapabilir (RBAC)
- Admin API endpoint’leri normal kullanıcı API’lerinden ayrı tutulur

### Uygulama Notları (LLM)

- Admin paneli için ayrı bir `admin` front-end projesi ya da ana web uygulaması içinde `/admin` route’u oluşturulabilir.
- RBAC (Role-Based Access Control) için JWT içinde `role` claim veya ayrı `user_roles` tablosu kullanılabilir.

---

## 13. Yapay Zeka Entegrasyonu

### 13.1 Moderasyon

- Metin moderasyonu:
  - Kullanıcı adları, oda isimleri, (ileride) sohbet mesajları
  - Toxic / küfür / nefret söylemi tespiti -> engelle veya işaretle
- Görsel moderasyon (ileride avatar desteği gelirse):
  - Uygunsuz görsellerin tespiti

### 13.2 Oyun İçi Öneri ve İpuçları

- Sudoku vb. puzzle oyunları için “ipucu ver” butonu
- Kelime oyunlarında harf veya ipucu önerisi
- Sosyal oyunlarda hikâye anlatan “AI Oyun Yöneticisi” (narrator / storyteller)

### 13.3 Kişiselleştirme

- Kullanıcının oynadığı oyunlara göre:
  - Oyun tavsiye sistemi
  - Zorluk seviyesi önerileri
- Günlük / haftalık görevlerin kişiye özel belirlenmesi

### 13.4 İçerik Üretimi

- Bilmece, trivia sorusu, kelime listesi gibi içeriklerin AI ile üretilmesi
- Üretilen içerik moderasyon filtresinden geçirildikten sonra veri tabanına eklenir.
- Gerekirse admin onayı gerektiren “taslak” statüsü ile kaydedilir.

### 13.5 AI Bot Oyuncular

- Uygun oyunlarda (ör. bazı kart veya puzzle oyunları) bot rakipler
- Basit oyunlar için kural tabanlı, karmaşık olanlar için ML tabanlı botlar

### Uygulama Notları (LLM)

- AI çağrıları **backend üzerinden** yapılmalıdır; istemciler direkt API anahtarları görmemelidir.
- Moderasyon ve içerik üretimi için çağrılacak endpoint ve prompt şablonları ayrı bir konfigurasyon dosyasında tutulabilir.

---

## 14. Geleceğe Yönelik Genişletmeler

- Turnuva sistemi (bracket, lig, sezon)
- Arkadaş listesi, parti sistemi, özel oda davetleri
- Mesajlaşma sistemi (DM ve oyun içi chat)
- Kozmetik mağazası (skin, avatar, tema)
- Topluluk içerik üretimi (kullanıcıların hazırladığı puzzle’lar)
- Topluluk / dış geliştirici desteğiyle yeni oyun modülleri
- Self-hosting paketi (kurumsal/lokal kurulumlar için)

### Uygulama Notları (LLM)

- Gelecekte bu bölüme yeni madde eklendiğinde, ilgili kod jenerasyonu sırasında bu maddeler dikkate alınmalıdır (ör. turnuva sistemi için yeni tablolar, yeni API endpoint’leri).

---

## 15. LLM İçin Uygulama Talimatları (Özet)

Bir LLM bu dokümana göre aşağıdaki tür görevleri yerine getirirken:

1. **Backend kodu üretirken:**
   - Oyun modülleri için burada tanımlanan `initGame / applyMove / getPublicState` gibi fonksiyon yapılarını kullan.
   - Veri tabanı tablolarını PostgreSQL/Supabase uyumlu SQL ile oluştur.
   - Auth doğrulaması, hata yönetimi ve loglama için middleware/guard yapılarını ekle.

2. **Frontend (Flutter veya React) kodu üretirken:**
   - Çoklu dil desteği için string’leri i18n anahtarları üzerinden kullan.
   - Realtime bağlantı kurarken, oturum bazlı kanal isimlendirmesine dikkat et (`game_session:<id>`).
   - Skor ve ödül sistemi UI’ları (profil, rozetler, leaderboards) için bu dokümandaki veri modelini temel al.

3. **AI entegrasyonu yaparken:**
   - Tüm AI API çağrılarını backend’de topla, istemciden sadece “fonksiyon çağrısı” olarak iste.
   - Moderasyon, içerik üretimi ve kişiselleştirme için ayrı fonksiyonlar oluştur ve konfigüre edilebilir prompt’lar kullan.

4. **Yeni özellik eklerken:**
   - Önce bu dokümanda ilgili bölümü güncelle (veya yeni alt bölüm ekle),
   - Sonra kod jenerasyonunu güncel dokümana göre yap.

Bu sayede doküman hem teknik ekip hem de LLM tabanlı yardımcılar için **tek ve tutarlı referans** olarak kullanılabilir.
