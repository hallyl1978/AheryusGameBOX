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
- **Flutter:** >= 3.24
- **PostgreSQL:** 14+ (veya Supabase hesabı)
- **Git:** >= 2.40

### 1. Repository'yi Klonlayın

```bash
git clone https://github.com/hallyl1978/AheryusGameBOX.git
cd AheryusGameBOX
```

### 2. Supabase Projesi Oluşturun

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. Database URL ve anon key'i kopyalayın

### 3. Database Şemasını Kurun

```bash
# Supabase SQL Editor'da sırasıyla çalıştırın:
# 1. Project/config/schema/initial_schema.sql
# 2. Project/config/schema/advanced_features_schema.sql
# 3. Project/config/schema/i18n_schema.sql
```

Alternatif olarak (yerel PostgreSQL):
```bash
psql -U postgres -d aheryusgamebox < Project/config/schema/initial_schema.sql
psql -U postgres -d aheryusgamebox < Project/config/schema/advanced_features_schema.sql
psql -U postgres -d aheryusgamebox < Project/config/schema/i18n_schema.sql
```

### 4. Backend Kurulumu

```bash
cd Project/src

# NestJS projesi oluştur
npm i -g @nestjs/cli
nest new backend

cd backend

# Bağımlılıkları yükle
npm install @supabase/supabase-js
npm install @nestjs/websockets @nestjs/platform-socket.io

# Environment variables
cp ../../config/env/.env.example .env

# .env dosyasını düzenle:
# SUPABASE_URL=your_supabase_url
# SUPABASE_ANON_KEY=your_anon_key
# PORT=3000

# Servisleri kopyala
cp -r ../backend/services src/

# Çalıştır
npm run start:dev
```

Backend şimdi `http://localhost:3000` adresinde çalışıyor.

### 5. Frontend Kurulumu

```bash
cd Project/src/frontend

# Bağımlılıkları yükle
flutter pub get

# Locale dosyalarını assets'e kopyala
mkdir -p assets/locales
cp -r ../../locales/* assets/locales/

# Cihazda çalıştır
flutter run

# Veya web'de
flutter run -d chrome
```

### 6. Test Edin

Backend ve Frontend çalıştıktan sonra:

1. **Frontend'de:**
   - Ana sayfayı görün
   - Dil değiştirmeyi test edin (TR ↔ EN)
   - Profil sayfasını kontrol edin

2. **Backend'de:**
   - http://localhost:3000 adresini ziyaret edin
   - API endpoint'lerini test edin

## 📚 Dokümantasyon

### Ana Dokümanlar

| Doküman | Açıklama |
|---------|----------|
| [Proje Başlangıç](Documentation/ProjeBaslangic.md) | Mimari ve domain referansı |
| [Advanced Features](Documentation/Advanced_Features.md) | İleri düzey özellikler (matchmaking, analytics, AI) |
| [i18n Guide](Documentation/i18n_Guide.md) | Çoklu dil desteği rehberi |
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
- [x] Backend servis iskeletleri (6 servis)
- [x] i18n altyapısı (TR/EN desteği)
- [x] Frontend iskelet (Flutter + i18n)
- [x] Çeviri dosyaları (150+ key)

### Devam Eden (🚧)

- [ ] Database entegrasyonu
- [ ] NestJS modül yapısı
- [ ] API endpoint'leri
- [ ] WebSocket/Realtime implementasyonu
- [ ] Unit test'ler

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
