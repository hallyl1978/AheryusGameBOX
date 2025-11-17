# 🧪 AheryusGameBOX - Yerel Test Rehberi

Bu rehber, AheryusGameBOX projesini yerel bilgisayarınızda test etmek için gereken tüm adımları içerir.

## 📋 İçindekiler

1. [Ön Gereksinimler](#ön-gereksinimler)
2. [Hızlı Başlangıç](#hızlı-başlangıç)
3. [Manuel Kurulum](#manuel-kurulum)
4. [Docker ile Kurulum](#docker-ile-kurulum)
5. [Test Etme](#test-etme)
6. [Sorun Giderme](#sorun-giderme)

---

## 🔧 Ön Gereksinimler

### Zorunlu Gereksinimler

- **Node.js**: v20.0.0 veya üzeri
- **npm**: v10.0.0 veya üzeri
- **Flutter**: v3.24.0 veya üzeri
- **Dart**: v3.5.0 veya üzeri
- **Git**: v2.30.0 veya üzeri

### İsteğe Bağlı (Docker Kullanıyorsanız)

- **Docker**: v24.0.0 veya üzeri
- **Docker Compose**: v2.20.0 veya üzeri

### Sürüm Kontrolü

```bash
# Node.js ve npm versiyonlarını kontrol edin
node --version  # v20.0.0+
npm --version   # v10.0.0+

# Flutter versiyonunu kontrol edin
flutter --version  # 3.24.0+

# Docker versiyonunu kontrol edin (opsiyonel)
docker --version
docker-compose --version
```

---

## 🚀 Hızlı Başlangıç

### Makefile ile Otomatik Kurulum

```bash
# 1. Projeyi klonlayın
git clone https://github.com/hallyl1978/AheryusGameBOX.git
cd AheryusGameBOX

# 2. Environment dosyasını oluşturun
make setup-env

# 3. .env dosyasını düzenleyin
nano Project/config/env/.env  # veya favori editörünüzü kullanın

# 4. Bağımlılıkları yükleyin
make install

# 5. Development sunucusunu başlatın
make dev
```

**Tarayıcınızda açın:** http://localhost:3000

---

## 📦 Manuel Kurulum

### Adım 1: Projeyi Klonlayın

```bash
git clone https://github.com/hallyl1978/AheryusGameBOX.git
cd AheryusGameBOX
```

### Adım 2: Environment Dosyasını Oluşturun

```bash
cp Project/config/env/.env.example Project/config/env/.env
```

### Adım 3: Environment Değişkenlerini Düzenleyin

`.env` dosyasını düzenleyin ve aşağıdaki değerleri doldurun:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_random_secret_key_here

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:8080

# Game Settings
DEFAULT_LANGUAGE=tr-TR
SUPPORTED_LANGUAGES=tr-TR,en-US
```

### Adım 4: Backend Kurulumu

```bash
# Backend dizinine gidin
cd Project/src/backend

# Bağımlılıkları yükleyin
npm install

# TypeScript kodunu derleyin
npm run build

# Development modunda başlatın
npm run start:dev
```

Backend şimdi http://localhost:3000 adresinde çalışıyor olmalı.

### Adım 5: Frontend Kurulumu (Opsiyonel)

```bash
# Frontend dizinine gidin
cd Project/src/frontend

# Flutter bağımlılıklarını yükleyin
flutter pub get

# Web için çalıştırın
flutter run -d chrome

# veya iOS simulator için
flutter run -d ios

# veya Android emulator için
flutter run -d android
```

### Adım 6: Database Migration

```bash
# Supabase CLI ile migration çalıştırın
cd Project
supabase db push

# veya SQL dosyalarını manuel olarak çalıştırın
psql -h your_supabase_host -U postgres -d postgres -f config/schema/advanced_features_schema.sql
psql -h your_supabase_host -U postgres -d postgres -f config/schema/i18n_schema.sql
```

---

## 🐳 Docker ile Kurulum

### Development Ortamı

```bash
# 1. Environment dosyasını oluşturun
make setup-env

# 2. .env dosyasını düzenleyin
nano Project/config/env/.env

# 3. Docker development ortamını başlatın
make docker-dev

# veya direkt docker-compose ile
docker-compose -f Project/docker-compose.dev.yml up -d
```

**Erişim URL'leri:**
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api/docs
- Redis Commander: http://localhost:8081 (--profile with-tools ile)

### Production Ortamı

```bash
# Production ortamını başlatın
make docker-prod

# veya
docker-compose -f Project/docker-compose.yml up -d
```

### Docker Loglarını Görüntüleme

```bash
# Tüm logları görüntüle
make logs

# veya
docker-compose -f Project/docker-compose.dev.yml logs -f

# Sadece backend logları
docker logs -f aheryusgamebox-backend-dev
```

### Docker Container'ları Durdurma

```bash
# Tüm container'ları durdur
make docker-down

# veya
docker-compose -f Project/docker-compose.dev.yml down
```

---

## 🧪 Test Etme

### Backend Unit Tests

```bash
cd Project/src/backend

# Tüm testleri çalıştır
npm run test

# Watch modunda testleri çalıştır
npm run test:watch

# Coverage raporu oluştur
npm run test:cov
```

### Frontend Tests

```bash
cd Project/src/frontend

# Widget testlerini çalıştır
flutter test

# Coverage raporu oluştur
flutter test --coverage
```

### Integration Tests

```bash
# Backend E2E testleri
cd Project/src/backend
npm run test:e2e
```

### API Endpoint Testleri

#### 1. Health Check

```bash
curl http://localhost:3000/api/health
```

**Beklenen Yanıt:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 2. Oyunları Listele

```bash
curl http://localhost:3000/api/games?lang=tr-TR
```

#### 3. Oyun Oturumu Oluştur

```bash
curl -X POST http://localhost:3000/api/games/okey-101/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "hostUserId": "user-123",
    "languageCode": "tr-TR",
    "settings": {
      "maxPlayers": 4,
      "isPrivate": false
    }
  }'
```

#### 4. Matchmaking Kuyruğuna Katıl

```bash
curl -X POST http://localhost:3000/api/matchmaking/queue \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "gameId": "okey-101",
    "preferences": {
      "mode": "ranked"
    }
  }'
```

### WebSocket Testleri

```javascript
// Browser Console'da test edin
const socket = io('ws://localhost:3000/game');

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.emit('join_session', {
  userId: 'user-123',
  sessionId: 'session-456'
});

socket.on('joined_session', (data) => {
  console.log('Joined:', data);
});
```

---

## 🐛 Sorun Giderme

### Port Zaten Kullanımda

**Hata:** `Error: listen EADDRINUSE: address already in use :::3000`

**Çözüm:**
```bash
# Port 3000'i kullanan process'i bul
lsof -i :3000

# Process'i öldür
kill -9 <PID>

# veya farklı bir port kullan
PORT=3001 npm run start:dev
```

### Supabase Bağlantı Hatası

**Hata:** `Failed to initialize database`

**Çözüm:**
1. `.env` dosyasındaki Supabase credentials'ları kontrol edin
2. Supabase project'inizin aktif olduğundan emin olun
3. Network bağlantınızı kontrol edin

```bash
# Supabase bağlantısını test edin
curl https://your-project.supabase.co/rest/v1/
```

### Node Modules Hatası

**Hata:** `Cannot find module '@nestjs/core'`

**Çözüm:**
```bash
# node_modules'u temizle ve yeniden yükle
cd Project/src/backend
rm -rf node_modules package-lock.json
npm install
```

### Docker Build Hatası

**Hata:** `ERROR [builder X/Y] RUN npm ci`

**Çözüm:**
```bash
# Docker cache'i temizle
docker system prune -a

# Yeniden build et
docker-compose -f Project/docker-compose.dev.yml build --no-cache
```

### Flutter Dependencies Hatası

**Hata:** `Because every version of flutter_test from sdk depends on...`

**Çözüm:**
```bash
cd Project/src/frontend

# Pub cache'i temizle
flutter pub cache repair

# Dependencies'i yeniden yükle
flutter clean
flutter pub get
```

### Redis Connection Hatası

**Hata:** `Error: Redis connection to 127.0.0.1:6379 failed`

**Çözüm:**
```bash
# Redis'in çalıştığından emin olun (Docker)
docker ps | grep redis

# Redis'i manuel olarak başlatın
redis-server

# veya Docker ile
docker run -d -p 6379:6379 redis:7-alpine
```

---

## 📊 Performans İzleme

### Backend Performans

```bash
# API response time'ları
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/games

# Memory kullanımı
node --max-old-space-size=4096 dist/main.js
```

### Database Query Performance

```sql
-- Slow query detection
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## 🔐 Güvenlik Kontrolleri

### Environment Dosyası Güvenliği

```bash
# .env dosyasının git'e eklenmediğinden emin olun
git check-ignore .env

# Çıktı: .env (başarılı)
```

### Dependency Vulnerability Scan

```bash
cd Project/src/backend

# npm audit çalıştır
npm audit

# Otomatik fix
npm audit fix
```

---

## 📝 Yararlı Komutlar

```bash
# Makefile komutları
make help           # Tüm komutları göster
make install        # Bağımlılıkları yükle
make dev            # Development server
make test           # Testleri çalıştır
make build          # Production build
make docker-dev     # Docker dev ortamı
make docker-down    # Docker'ı durdur
make clean          # Build artifacts'ı temizle

# Backend komutları
cd Project/src/backend
npm run start:dev   # Development mode
npm run start:prod  # Production mode
npm run test        # Unit tests
npm run lint        # Linter

# Frontend komutları
cd Project/src/frontend
flutter run         # Uygulamayı çalıştır
flutter test        # Testleri çalıştır
flutter build web   # Web build
```

---

## 🎯 Sonraki Adımlar

1. ✅ Backend çalıştırma
2. ✅ Frontend çalıştırma
3. ✅ API endpoint testleri
4. ✅ WebSocket testleri
5. ✅ Database migration
6. 🔄 Production deployment

---

## 📞 Destek

Herhangi bir sorun yaşarsanız:

1. [Issues](https://github.com/hallyl1978/AheryusGameBOX/issues) sayfasından yeni bir issue açın
2. Mevcut documentation'ı kontrol edin
3. Log dosyalarını inceleyin: `Project/src/backend/logs/`

---

**Son Güncelleme:** 2024-01-15
**Versiyon:** 1.0.0
