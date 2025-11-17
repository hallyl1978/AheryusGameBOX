# AheryusGameBOX Backend - İleri Düzey Özellikler

Bu dizin, AheryusGameBOX platformunun backend servisleri için hazırlanmış ileri düzey özellik implementasyonlarını içerir.

## 📁 Dizin Yapısı

```
backend/
├── services/
│   ├── matchmaking.service.ts       # Akıllı eşleştirme sistemi
│   ├── rating.service.ts            # MMR ve rating yönetimi
│   ├── telemetry.service.ts         # Analytics ve telemetri
│   ├── cheat-detection.service.ts   # Hile tespit sistemi
│   └── moderation.service.ts        # AI moderasyon
└── README.md
```

## 🎯 Servisler

### 1. Matchmaking Service
**Dosya:** `services/matchmaking.service.ts`

MMR bazlı akıllı oyuncu eşleştirme sistemi.

**Özellikler:**
- Kuyruk yönetimi
- MMR bazlı eşleştirme
- Bekleme süresi optimizasyonu
- Oda oluşturma ve yönetimi

**Kullanım:**
```typescript
const matchmakingService = new MatchmakingService();

// Kuyruğa katıl
await matchmakingService.joinQueue({
  id: 'queue_entry_id',
  userId: 'user_123',
  gameId: 'game_456',
  mmr: 1500,
  preferences: {
    region: 'eu-west',
    maxWaitTime: 60000
  },
  joinedAt: new Date()
});

// Kuyruk durumu
const status = await matchmakingService.getQueueStatus('game_456');
```

### 2. Rating Service
**Dosya:** `services/rating.service.ts`

Elo algoritması ile MMR hesaplama ve tier sistemi.

**Özellikler:**
- Elo rating hesaplama
- MMR güncelleme (kazanma/kaybetme)
- Tier/Division sistemi (Bronze -> Master)
- Leaderboard desteği

**Kullanım:**
```typescript
const ratingService = new RatingService();

// Rating güncelle
await ratingService.updateRatings('game_id', [
  {
    userId: 'user_1',
    opponentIds: ['user_2', 'user_3'],
    result: 'win'
  },
  // ...
]);

// Tier hesapla
const { tier, division } = ratingService.getTierAndDivision(1750);
// { tier: 'Gold', division: 3 }
```

### 3. Telemetry Service
**Dosya:** `services/telemetry.service.ts`

GDPR uyumlu oyuncu davranış analitiği.

**Özellikler:**
- Event tracking
- Session metrikleri
- Funnel analizi
- Retention hesaplama (D1, D7, D30)
- Privacy-first veri toplama

**Kullanım:**
```typescript
const telemetryService = new TelemetryService();

// Event kaydet
await telemetryService.trackEvent({
  userId: 'user_123',
  eventType: 'game_completed',
  eventCategory: 'action',
  eventData: {
    gameId: 'game_456',
    score: 1500,
    duration: 1200
  },
  platform: 'mobile'
});

// Funnel takibi
await telemetryService.trackFunnelStep({
  userId: 'user_123',
  funnelName: 'onboarding',
  stepName: 'tutorial_completed',
  stepOrder: 3,
  completed: true
});
```

### 4. Cheat Detection Service
**Dosya:** `services/cheat-detection.service.ts`

AI destekli hile tespit sistemi.

**Özellikler:**
- Davranış analizi
- Anomali tespiti
- Güven skoru (trust score)
- Otomatik kısıtlama/ban

**Kullanım:**
```typescript
const cheatService = new CheatDetectionService();

// Oyun analizi
const detections = await cheatService.analyzeGameSession('session_123');

if (detections.length > 0) {
  for (const detection of detections) {
    await cheatService.updateTrustScore(detection.userId, detection);
  }
}

// Admin inceleme
await cheatService.reviewDetection(
  'event_id',
  'admin_user_id',
  'confirmed',
  'Clear evidence of cheating'
);
```

### 5. Moderation Service
**Dosya:** `services/moderation.service.ts`

İçerik moderasyonu ve filtreleme.

**Özellikler:**
- Blacklist filtreleme
- Spam tespiti
- AI moderasyon (ileride)
- İnceleme kuyruğu

**Kullanım:**
```typescript
const moderationService = new ModerationService();

// Kullanıcı adı kontrolü
const result = await moderationService.moderateUsername('TestUser123');

if (!result.approved) {
  console.log('Username rejected:', result.reason);
}

// Oda adı kontrolü
const roomResult = await moderationService.moderateRoomName('My Game Room');

// Moderasyon kuralı ekle
await moderationService.addModerationRule({
  ruleType: 'blacklist',
  pattern: 'badword',
  severity: 'high',
  autoAction: 'block'
});
```

## 🗄️ Veritabanı Şeması

İleri düzey özellikler için gerekli veritabanı tabloları:

**Dosya:** `../../config/schema/advanced_features_schema.sql`

Tablolar:
- `player_ratings` - MMR ve rating bilgileri
- `matchmaking_queue` - Aktif eşleştirme kuyruğu
- `matchmaking_history` - Eşleştirme geçmişi
- `telemetry_events` - Event takibi
- `player_session_metrics` - Oturum metrikleri
- `cheat_detection_events` - Hile tespit olayları
- `player_trust_scores` - Güven skorları
- `moderation_queue` - Moderasyon kuyruğu
- `tournaments` - Turnuva sistemi
- `seasons` - Sezonluk ligler

## 🚀 Kurulum ve Başlangıç

### Gereksinimler

- Node.js >= 20.x
- TypeScript >= 5.x
- PostgreSQL 14+ (Supabase)
- Redis (opsiyonel, caching için)

### Adımlar

1. **Veritabanı Şemasını Oluştur**

```bash
# Initial schema
psql -U postgres -d aheryusgamebox < ../../config/schema/initial_schema.sql

# Advanced features schema
psql -U postgres -d aheryusgamebox < ../../config/schema/advanced_features_schema.sql
```

2. **NestJS Projesi Başlat** (henüz yapılmadıysa)

```bash
npm i -g @nestjs/cli
nest new backend
cd backend
```

3. **Servisleri Entegre Et**

Servisleri NestJS modüllerine entegre edin:

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { MatchmakingService } from './services/matchmaking.service';
import { RatingService } from './services/rating.service';
import { TelemetryService } from './services/telemetry.service';
import { CheatDetectionService } from './services/cheat-detection.service';
import { ModerationService } from './services/moderation.service';

@Module({
  providers: [
    MatchmakingService,
    RatingService,
    TelemetryService,
    CheatDetectionService,
    ModerationService
  ]
})
export class AppModule {}
```

## 📊 Performans Optimizasyonu

### Caching Stratejisi

**Redis kullanımı:**
- Matchmaking kuyruğu → Redis List
- Oyuncu online durumu → Redis Set
- Session state → Redis Hash
- Leaderboard → Redis Sorted Set

### Database İndeksleme

Kritik indeksler zaten schema'da tanımlı:
- `idx_matchmaking_queue_active`
- `idx_player_ratings_mmr`
- `idx_telemetry_events_time`
- `idx_cheat_detection_user`

### Batch Processing

Telemetri event'leri batch olarak işlenir (5000ms interval).

## 🔒 Güvenlik

### Rate Limiting

Her endpoint için rate limit uygulanmalı:

```typescript
// rate-limit.guard.ts
@Injectable()
export class RateLimitGuard implements CanActivate {
  // Implementation
}
```

### Data Privacy

- Hassas veriler otomatik sanitize edilir
- Email'ler hash'lenir
- GDPR delete/export desteği

## 🧪 Test

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 📈 Metrikler ve Monitoring

### Key Metrikleri

- **Matchmaking:** Ortalama bekleme süresi, eşleşme kalitesi
- **Rating:** MMR dağılımı, tier dağılımı
- **Telemetry:** DAU/MAU, retention, session duration
- **Cheat Detection:** Tespit oranı, false positive oranı
- **Moderation:** İnceleme kuyruğu uzunluğu, onay oranı

### Alerting

Kritik durumlar:
- Matchmaking bekleme süresi > 60s
- Cheat detection spike (anormal artış)
- Error rate > %5
- Database connection pool exhausted

## 📚 Dökümantasyon

Detaylı bilgi için:
- [Advanced Features Documentation](../../Documentation/Advanced_Features.md)
- [Architecture Documentation](../../Documentation/ProjeBaslangic.md)
- [Roadmap](../../Documentation/Roadmap.md)

## 🛠️ Geliştirme Planı

### Faz 1 (MVP) - Tamamlandı ✅
- [x] Servis iskeletleri oluşturuldu
- [x] Database şeması tasarlandı
- [x] Temel algoritmalar implement edildi

### Faz 2 - Devam Ediyor 🚧
- [ ] Database entegrasyonu
- [ ] NestJS modül yapısı
- [ ] API endpoint'leri
- [ ] Unit test'ler

### Faz 3 - Planlanan 📋
- [ ] Redis entegrasyonu
- [ ] AI moderation API entegrasyonu
- [ ] Machine learning modeli
- [ ] Advanced analytics

## 💡 Katkıda Bulunma

1. Feature branch oluştur (`feature/amazing-feature`)
2. Değişikliklerini commit et
3. Branch'i push et
4. Pull Request aç

## 📝 Lisans

Bu proje AheryusGameBOX projesi kapsamındadır.

---

**Son Güncelleme:** 2025-11-17
**Versiyon:** 1.0.0
