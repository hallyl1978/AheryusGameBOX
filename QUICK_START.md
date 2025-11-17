# AheryusGameBOX - Quick Start Guide

Hızlı başlangıç rehberi. Projeyi 10 dakikada yerel ortamınızda çalıştırın.

## 🚀 Hızlı Kurulum (Önerilen)

### Otomatik Setup

```bash
# Repository'yi klonlayın
git clone https://github.com/hallyl1978/AheryusGameBOX.git
cd AheryusGameBOX

# Setup script'ini çalıştırın
./setup.sh
```

Script size aşağıdakileri soracak:
1. Backend dependencies kurulumu (y/n)
2. Frontend dependencies kurulumu (y/n)
3. Database setup (Supabase/Local PostgreSQL)

### Manuel Setup

Eğer otomatik setup'ı kullanmak istemiyorsanız:

#### 1. Environment Variables

```bash
# .env dosyası oluşturun
cp Project/config/env/.env.example Project/config/env/.env.local

# .env.local dosyasını düzenleyin
nano Project/config/env/.env.local
```

Minimum gerekli değerler:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

#### 2. Database Setup

**Supabase kullanıyorsanız:**

1. https://supabase.com/dashboard adresine gidin
2. SQL Editor'ı açın
3. Sırasıyla çalıştırın:
   ```sql
   -- 1. Initial schema
   -- Project/config/schema/initial_schema.sql içeriğini kopyala-yapıştır

   -- 2. Advanced features
   -- Project/config/schema/advanced_features_schema.sql içeriğini kopyala-yapıştır

   -- 3. i18n
   -- Project/config/schema/i18n_schema.sql içeriğini kopyala-yapıştır
   ```

**Yerel PostgreSQL kullanıyorsanız:**

```bash
# Database oluştur
createdb aheryusgamebox

# Schema'ları çalıştır
psql -U postgres -d aheryusgamebox < Project/config/schema/initial_schema.sql
psql -U postgres -d aheryusgamebox < Project/config/schema/advanced_features_schema.sql
psql -U postgres -d aheryusgamebox < Project/config/schema/i18n_schema.sql
```

#### 3. Backend Setup

```bash
# NestJS CLI kur
npm install -g @nestjs/cli

# Backend projesi oluştur
cd Project/src
nest new backend --skip-git

cd backend

# Dependencies kur
npm install @supabase/supabase-js @nestjs/websockets @nestjs/platform-socket.io @nestjs/config

# Servisleri kopyala
cp -r ../backend/services src/

# .env dosyasını kopyala
cp ../../config/env/.env.local .env

# Çalıştır
npm run start:dev
```

Backend http://localhost:3000 adresinde çalışacak.

#### 4. Frontend Setup

```bash
cd Project/src/frontend

# Dependencies kur
flutter pub get

# Locale dosyalarını kopyala
mkdir -p assets/locales
cp -r ../../locales/* assets/locales/

# Çalıştır (Web)
flutter run -d chrome

# Veya (Mobile - emulator gerekli)
flutter run
```

## ✅ Doğrulama

### Backend Test

```bash
# Health check
curl http://localhost:3000

# Beklenen: 200 OK
```

### Frontend Test

Flutter uygulamasını açın ve kontrol edin:
- ✓ Ana sayfa yükleniyor
- ✓ Dil değiştirme çalışıyor (TR ↔ EN)
- ✓ "Oyna" butonu görünüyor

## 🔧 Troubleshooting

### "Cannot find module" hatası (Backend)

```bash
cd Project/src/backend
npm install
```

### "pubspec.yaml not found" hatası (Frontend)

```bash
# Doğru dizinde olduğunuzdan emin olun
cd Project/src/frontend
flutter pub get
```

### Database bağlantı hatası

`.env.local` dosyasındaki Supabase credentials'ları kontrol edin:
```bash
cat Project/config/env/.env.local
```

### Port zaten kullanımda

Backend başka bir portta çalıştırın:
```bash
PORT=3001 npm run start:dev
```

## 📚 Sıradaki Adımlar

1. **Dokümantasyon okuyun:**
   - [Advanced Features](Documentation/Advanced_Features.md)
   - [i18n Guide](Documentation/i18n_Guide.md)

2. **İlk oyunu ekleyin:**
   - Backend'de game module oluşturun
   - Frontend'de game screen ekleyin

3. **Test edin:**
   - Unit testler yazın
   - Integration testler ekleyin

## 💡 Faydalı Komutlar

```bash
# Backend
npm run start:dev      # Development mode
npm run build          # Build
npm run test           # Run tests
npm run lint           # Lint code

# Frontend
flutter run            # Run app
flutter test           # Run tests
flutter build web      # Build for web
flutter analyze        # Analyze code

# Database
psql -U postgres -d aheryusgamebox    # Connect to local DB
```

## 🆘 Yardım

Sorun mu yaşıyorsunuz?

1. [README.md](README.md) dosyasını okuyun
2. [Documentation/](Documentation/) klasöründeki rehberlere göz atın
3. GitHub Issues açın

---

**Kolay gelsin!** 🎮
