# AheryusGameBOX – Teknoloji ve Ortam Kararları (Faz 0)

Bu belge Faz 0 kapsamındaki kritik tercihleri kaydeder ve geliştirme
ekibinin ortak referansı olarak kullanılır.

## 1. Genel Yaklaşım
- **Mobil öncelikli** strateji doğrultusunda istemci teknolojisi Flutter olarak
  seçildi. Flutter ile Android/iOS öncelikli geliştirme yapılacak, web için
  Flutter Web desteği MVP’nin ilerleyen sprintlerinde açılacak.
- **Backend** tarafında **Node.js 20 LTS + NestJS** tercih edildi.
  - NestJS modüler yapısı, dependency injection desteği ve TypeScript ile güçlü
    tip güvenliği sunduğu için seçildi.
  - Gerçek zamanlı iletişim için NestJS WebSocket Gateway ve Supabase Realtime
    kombinasyonu kullanılacak.
- **Veritabanı & Auth**: Supabase (PostgreSQL) + Supabase Auth.
- **Gerçek zamanlı** bildirim ve state yönetimi için Supabase Realtime
  kanalları kullanılacak; gerektiğinde kendi WebSocket sunucumuz devreye
  alınacak.

## 2. Geliştirme Ortamı
- Node.js: >= 20.x
- npm veya yarn: geliştirici tercihine göre; proje standardı npm.
- Flutter SDK: 3.24+ (stable kanal), Dart >= 3.5.
- Git: v2.40+ (branch stratejisi `main` + `develop` + `feature/*`).
- IDE önerisi:
  - Backend için VS Code + resmi NestJS eklentileri veya WebStorm.
  - Flutter için Android Studio / VS Code Flutter eklentileri.
- Kod formatlama:
  - Backend: ESLint + Prettier (NestJS default kuralları temel alınacak).
  - Flutter: `dart format`.

## 3. Süreç ve Otomasyon
- CI/CD hedefi: GitHub Actions.
  - Adım 1 (planlanıyor): lint + test
  - Adım 2: backend build
  - Adım 3: Flutter web build (ilerleyen sprintlerde)
- Versiyon kontrol akışı:
  - `main`: üretim ile senkron, korumalı branch.
  - `develop`: aktif geliştirme entegrasyon branch’i.
  - `feature/<isim>`: tekil özellik çalışmaları.
  - Pull request incelemeleri zorunlu.

## 4. Supabase Bileşenleri
- Proje Supabase üzerinde oluşturulacak, URL ve anon key `.env.local` dosyasında
  tutulacak (repo dışı).
- Auth sağlayıcıları:
  - E-posta/şifre (Supabase default)
  - Google Identity (faz 1 sonuna kadar entegre edilecek)
- Veritabanı genişletmeleri:
  - Row Level Security (RLS) Supabase politikaları ile sağlanacak.
  - `game_sessions`, `session_players`, `moves`, `user_stats` gibi tablolar
    Postgres üzerinde.

## 5. Öncelikli Görevler (Faz 0 Tamamlama)
1. Supabase projesini oluştur ve bağlantı bilgilerini `.env.local` içinde
   sakla.
2. `Project/config/env/.env.example` dosyasını gerçek anahtarları içermeden
   doldur (aşağıda örnek şablon verilecek).
3. Backend iskeletini NestJS CLI ile `Project/src/backend` altında başlat.
4. Flutter projesini `Project/src/frontend` altında başlat.

Bu kararlar Roadmap Faz 0 görevlerini tamamlamak ve Faz 1’e geçiş için temel
oluşturur. Karar değişiklikleri aynı dosya içinde yeni tarih notlarıyla
belgelenecektir.

