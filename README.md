# AheryusGameBOX

🎮 Çok platformlu, gerçek zamanlı, AI destekli modern oyun platformu

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](package.json)
[![Status](https://img.shields.io/badge/status-development-orange.svg)]()

## 📋 İçindekiler

- [Genel Bakış](#genel-bakış)
- [Özellikler](#özellikler)
- [Teknoloji Stack](#teknoloji-stack)
- [Proje Yapısı](#proje-yapısı)
- [Hızlı Başlangıç](#hızlı-başlangıç)
- [Dokümantasyon](#dokümantasyon)
- [Katkıda Bulunma](#katkıda-bulunma)

## 🎯 Genel Bakış

AheryusGameBOX, mobil, tablet ve web platformlarında çalışabilen, yerel ağ (LAN) ve bulut sunucu desteği olan modern bir çoklu oyun platformudur.

### Desteklenen Oyun Türleri

- 🎲 Board Oyunları (Monopoly tarzı)
- 📝 Kelime Oyunları (anagram, kelime bulma)
- 🕵️ Sosyal Dedüksiyon (Vampir Köylü benzeri)
- 🃏 Kart ve Okey Oyunları
- 🧩 Puzzle ve Bulmacalar
- 🎯 Trivia ve Bilgi Yarışmaları

## ✨ Özellikler

### Core Features
✅ **Gerçek Zamanlı Multiplayer** - WebSocket/Supabase Realtime
✅ **Çoklu Platform** - Android, iOS, Web
✅ **Çoklu Dil** - TR/EN (genişletilebilir)
✅ **Yerel Ağ Desteği** - LAN üzerinden oynama

### İleri Düzey Özellikler
✅ **Akıllı Matchmaking** - MMR bazlı oyuncu eşleştirme
✅ **Rating Sistemi** - Elo algoritması, tier sistemi (Bronze → Master)
✅ **Analytics & Telemetry** - GDPR uyumlu davranış takibi
✅ **AI Hile Tespiti** - Anomali tespiti, trust scoring
✅ **İçerik Moderasyonu** - Otomatik filtreleme
✅ **Sosyal Özellikler** - Arkadaşlık, parti sistemi, bildirimler
✅ **Turnuva Sistemi** - Single/double elimination, Swiss format
✅ **Sezonluk Ligler** - Rank ve tier sistemi

### Güvenlik & Performans
✅ **GDPR Uyumlu** - Privacy-first veri toplama
✅ **Rate Limiting** - DDoS koruması
✅ **Caching** - Redis stratejisi
✅ **Database Optimization** - 30+ optimize edilmiş index

## 🛠 Teknoloji Stack

### Backend
- **Framework:** NestJS (TypeScript)
- **Runtime:** Node.js 20 LTS
- **Database:** PostgreSQL (Supabase)
- **Realtime:** Supabase Realtime / WebSocket
- **Caching:** Redis (planned)
- **Auth:** Supabase Auth + Google OAuth

### Frontend
- **Framework:** Flutter 3.24+
- **Language:** Dart 3.5+
- **State Management:** Riverpod
- **i18n:** flutter_localizations

### Database
- **Primary:** PostgreSQL 14+
- **Schema:** 28+ tablolar
- **Indexes:** 30+ optimized
- **Functions:** Helper functions (SQL)

### DevOps
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions (planned)
- **Container:** Docker (planned)

## 📁 Proje Yapısı

```
AheryusGameBOX/
├── Documentation/
│   ├── ProjeBaslangic.md          # Mimari ve domain referansı
│   ├── Advanced_Features.md       # İleri düzey özellikler rehberi
│   ├── i18n_Guide.md              # Çoklu dil desteği rehberi
│   ├── Tech_Decisions.md          # Teknoloji kararları
│   ├── Roadmap.md                 # Faz bazlı yol haritası
│   ├── WorkPlan_Detayli.md        # Detaylı iş planı
│   └── GitHub_Adimlar.md          # Git workflow
│
├── Project/
│   ├── config/
│   │   ├── env/
│   │   │   └── .env.example       # Environment variables şablonu
│   │   └── schema/
│   │       ├── initial_schema.sql           # Temel tablolar
│   │       ├── advanced_features_schema.sql # İleri özellikler
│   │       └── i18n_schema.sql              # Çoklu dil tabloları
│   │
│   ├── locales/                   # Çeviri dosyaları
│   │   ├── tr-TR/
│   │   │   ├── common.json        # 50+ genel kelime
│   │   │   ├── ui.json            # 70+ UI metni
│   │   │   └── errors.json        # 30+ hata mesajı
│   │   └── en-US/
│   │       ├── common.json
│   │       ├── ui.json
│   │       └── errors.json
│   │
│   └── src/
│       ├── backend/               # NestJS Backend
│       │   ├── services/
│       │   │   ├── matchmaking.service.ts    # Eşleştirme
│       │   │   ├── rating.service.ts         # MMR/Elo
│       │   │   ├── telemetry.service.ts      # Analytics
│       │   │   ├── cheat-detection.service.ts # Hile tespiti
│       │   │   ├── moderation.service.ts     # Moderasyon
│       │   │   └── i18n.service.ts           # Çoklu dil
│       │   └── README.md          # Backend dokümantasyonu
│       │
│       └── frontend/              # Flutter Frontend
│           ├── lib/
│           │   ├── l10n/
│           │   │   └── app_localizations.dart
│           │   └── main.dart
│           └── pubspec.yaml
│
└── README.md                      # Bu dosya
```

## 🚀 Hızlı Başlangıç

### Gereksinimler

- **Node.js:** >= 20.x
- **npm:** >= 10.x
- **Flutter:** >= 3.24
- **PostgreSQL:** 14+ (veya Supabase hesabı)
- **Docker:** >= 24.x (opsiyonel)
- **Git:** >= 2.40

### Otomatik Kurulum (Önerilen)

```bash
# 1. Repository'yi klonlayın
git clone https://github.com/hallyl1978/AheryusGameBOX.git
cd AheryusGameBOX

# 2. Environment dosyası oluşturun
make setup-env

# 3. .env dosyasını düzenleyin (Supabase bilgilerinizi ekleyin)
nano Project/config/env/.env

# 4. Bağımlılıkları yükleyin
make install

# 5. Development sunucusunu başlatın
make dev
```

**Backend:** http://localhost:3000
**API Docs:** http://localhost:3000/api/docs

### Docker ile Hızlı Başlangıç

```bash
# Environment dosyası oluşturun
make setup-env

# .env dosyasını düzenleyin
nano Project/config/env/.env

# Development ortamını başlatın
make docker-dev
```

### Manuel Kurulum

<details>
<summary>Adım adım manuel kurulum (tıklayın)</summary>

#### 1. Repository'yi Klonlayın

```bash
git clone https://github.com/hallyl1978/AheryusGameBOX.git
cd AheryusGameBOX
```

#### 2. Supabase Projesi Oluşturun

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. Database URL ve anon key'i kopyalayın

#### 3. Database Şemasını Kurun

```bash
# Supabase SQL Editor'da sırasıyla çalıştırın:
# 1. Project/config/schema/initial_schema.sql
# 2. Project/config/schema/advanced_features_schema.sql
# 3. Project/config/schema/i18n_schema.sql
```

#### 4. Backend Kurulumu

```bash
cd Project/src/backend

# Bağımlılıkları yükle
npm install

# Environment dosyası
cp ../../config/env/.env.example .env

# .env dosyasını düzenle ve Supabase bilgilerini ekle

# Development modunda çalıştır
npm run start:dev
```

Backend: `http://localhost:3000`

#### 5. Frontend Kurulumu

```bash
cd Project/src/frontend

# Bağımlılıkları yükle
flutter pub get

# Web'de çalıştır
flutter run -d chrome
```

</details>

### Test Edin

```bash
# Unit testleri çalıştır
make test

# API endpoint testi
curl http://localhost:3000/api/health

# Oyunları listele
curl http://localhost:3000/api/games?lang=tr-TR
```

**Detaylı test kılavuzu:** [Local_Testing_Guide.md](Documentation/Local_Testing_Guide.md)

## 📚 Dokümantasyon

### Ana Dokümanlar

| Doküman | Açıklama |
|---------|----------|
| [Proje Başlangıç](Documentation/ProjeBaslangic.md) | Mimari ve domain referansı |
| [Advanced Features](Documentation/Advanced_Features.md) | İleri düzey özellikler (matchmaking, analytics, AI) |
| [i18n Guide](Documentation/i18n_Guide.md) | Çoklu dil desteği rehberi |
| [Local Testing Guide](Documentation/Local_Testing_Guide.md) | ⭐ Yerel test ve kurulum rehberi |
| [Tech Decisions](Documentation/Tech_Decisions.md) | Teknoloji seçimleri ve gerekçeleri |
| [Roadmap](Documentation/Roadmap.md) | Faz bazlı geliştirme planı |
| [Work Plan](Documentation/WorkPlan_Detayli.md) | Detaylı görevler ve roller |
| [Backend README](Project/src/backend/README.md) | Backend servisleri dokümantasyonu |

### Özellik Rehberleri

- **Matchmaking Sistemi:** `Documentation/Advanced_Features.md` - Bölüm 1
- **Analytics & Telemetry:** `Documentation/Advanced_Features.md` - Bölüm 2
- **AI Features:** `Documentation/Advanced_Features.md` - Bölüm 3
- **i18n (Çoklu Dil):** `Documentation/i18n_Guide.md`
- **Turnuva Sistemi:** `Documentation/Advanced_Features.md` - Bölüm 5

## 📊 Proje Durumu

### Tamamlanan (✅)

- [x] Proje mimarisi ve dokümantasyon
- [x] Database şeması tasarımı (28+ tablo)
- [x] Backend servis implementasyonları (6 servis)
- [x] i18n altyapısı (TR/EN desteği)
- [x] Frontend iskelet (Flutter + i18n)
- [x] Çeviri dosyaları (150+ key)
- [x] Database entegrasyonu (Supabase)
- [x] NestJS modül yapısı (Game, Matchmaking)
- [x] API endpoint'leri (RESTful)
- [x] WebSocket Gateway (real-time)
- [x] Unit test dosyaları (comprehensive)
- [x] Docker konfigürasyonu (dev + prod)
- [x] Package.json ve bağımlılıklar
- [x] Makefile (otomatik komutlar)

### Devam Eden (🚧)

- [ ] Frontend UI components
- [ ] E2E test'ler
- [ ] Redis caching implementasyonu

### Planlanan (📋)

- [ ] Redis caching
- [ ] AI moderation API entegrasyonu
- [ ] Flutter UI components
- [ ] E2E test'ler
- [ ] Mobile test (Android/iOS)
- [ ] Production deployment

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altındadır - detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim

Proje Sahibi: [@hallyl1978](https://github.com/hallyl1978)

Proje Link: [https://github.com/hallyl1978/AheryusGameBOX](https://github.com/hallyl1978/AheryusGameBOX)

---

**Not:** Bu proje aktif geliştirme aşamasındadır. Özellikler ve dokümantasyon düzenli olarak güncellenmektedir.

**Son Güncelleme:** 2025-11-17
