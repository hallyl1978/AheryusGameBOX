# AheryusGameBOX - i18n (Internationalization) Guide

**Versiyon:** 1.0
**Tarih:** 2025-11-17
**Durum:** Uygulama Hazır

---

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Desteklenen Diller](#desteklenen-diller)
3. [Database Yapısı](#database-yapısı)
4. [Backend Kullanımı](#backend-kullanımı)
5. [Frontend Kullanımı (Flutter)](#frontend-kullanımı-flutter)
6. [Çeviri Dosyaları](#çeviri-dosyaları)
7. [Yeni Dil Ekleme](#yeni-dil-ekleme)
8. [Yeni Çeviri Ekleme](#yeni-çeviri-ekleme)
9. [Best Practices](#best-practices)

---

## Genel Bakış

AheryusGameBOX, başlangıçta **Türkçe (tr-TR)** ve **İngilizce (en-US)** olmak üzere iki dili destekler. Mimari, ileride kolayca yeni diller eklenebilecek şekilde tasarlanmıştır.

### Özellikler

✅ Key-based çeviri sistemi
✅ Parametre desteği (`{playerName}`, `{level}`)
✅ Fallback mekanizması (tr-TR → en-US → key)
✅ Kategori bazlı organizasyon (common, ui, errors, games)
✅ JSONB ile database'de çoklu dil desteği
✅ Dil bağımlı oyun içeriği (kelime listeleri, bilmeceler)
✅ Otomatik dil tespiti (Accept-Language header)
✅ Kullanıcı dil tercihi kaydetme

---

## Desteklenen Diller

| Kod | Dil | Native İsim | Durum | Flag |
|-----|-----|-------------|-------|------|
| tr-TR | Turkish | Türkçe | ✅ Aktif (Varsayılan) | 🇹🇷 |
| en-US | English | English | ✅ Aktif | 🇺🇸 |

### Planlanan Diller

- de-DE (German / Almanca)
- fr-FR (French / Fransızca)
- es-ES (Spanish / İspanyolca)
- ar-SA (Arabic / Arapça) - RTL desteği ile

---

## Database Yapısı

### Tablolar

**`supported_languages`** - Desteklenen diller
```sql
code            text PRIMARY KEY
name            text
native_name     text
is_active       boolean
is_default      boolean
direction       text (ltr/rtl)
flag_emoji      text
```

**`translations`** - Çeviri anahtarları
```sql
id              uuid PRIMARY KEY
key             text UNIQUE
category_id     uuid
context         text
is_active       boolean
```

**`translation_values`** - Çeviri değerleri
```sql
id              uuid PRIMARY KEY
translation_id  uuid REFERENCES translations(id)
language_code   text REFERENCES supported_languages(code)
value           text
is_reviewed     boolean
```

**`word_lists`** - Kelime oyunları için kelime listeleri
```sql
language_code   text
word            text
difficulty      text
category        text
```

**`riddles`** - Bilmeceler (dil bağımlı)
```sql
language_code   text
question        text
answer          text
hints           jsonb
```

### Helper Functions

**`get_translation(key, language_code)`** - Çeviri getir
```sql
SELECT get_translation('MENU_PLAY', 'tr-TR'); -- "Oyna"
SELECT get_translation('MENU_PLAY', 'en-US'); -- "Play"
```

**`get_jsonb_translation(translations, language_code)`** - JSONB çeviri parse et
```sql
SELECT get_jsonb_translation(
    '{"tr-TR": "Monopoly", "en-US": "Monopoly"}'::jsonb,
    'tr-TR'
); -- "Monopoly"
```

---

## Backend Kullanımı

### Setup

```typescript
import { I18nService } from './services/i18n.service';

// NestJS module
@Module({
  providers: [I18nService],
  exports: [I18nService]
})
export class I18nModule {}
```

### Temel Kullanım

```typescript
// Inject service
constructor(private readonly i18nService: I18nService) {}

// Basit çeviri
const text = this.i18nService.translate('MENU_PLAY', 'tr-TR');
// "Oyna"

// Parametreli çeviri
const greeting = this.i18nService.translate(
  'NOTIFICATION_LEVEL_UP',
  'tr-TR',
  { level: 5 }
);
// "Seviye atladın! Yeni seviye: 5"

// Toplu çeviri
const translations = this.i18nService.translateBulk(
  ['MENU_PLAY', 'MENU_PROFILE', 'MENU_SETTINGS'],
  'en-US'
);
```

### JSONB Çeviriler

Database'de JSONB olarak saklanan çevirileri parse etme:

```typescript
// Oyun adı çevirisi (games.name_translations)
const gameName = this.i18nService.parseJsonbTranslation(
  game.name_translations, // {"tr-TR": "Kelime Oyunu", "en-US": "Word Game"}
  userLanguage
);

// Rozet adı çevirisi
const achievementName = this.i18nService.parseJsonbTranslation(
  achievement.name_translations,
  'tr-TR'
);
```

### Kullanıcı Dil Tercihi

```typescript
// Kullanıcının dilini getir
const userLang = await this.i18nService.getUserLanguage(userId);

// Kullanıcının dilini güncelle
await this.i18nService.setUserLanguage(userId, 'en-US');

// HTTP header'dan dil tespiti
const detectedLang = this.i18nService.detectLanguageFromHeader(
  request.headers['accept-language']
);
// "tr-TR,tr;q=0.9,en-US;q=0.8" → "tr-TR"
```

### İstatistikler

```typescript
const stats = this.i18nService.getStatistics();
// {
//   totalKeys: 150,
//   languages: 2,
//   coverage: Map {
//     'tr-TR' => { translated: 150, percentage: 100 },
//     'en-US' => { translated: 148, percentage: 98.67 }
//   }
// }

// Eksik çevirileri bul
const missing = await this.i18nService.findMissingTranslations('en-US');
// ['NEW_FEATURE_TEXT', 'ANOTHER_KEY']
```

---

## Frontend Kullanımı (Flutter)

### Setup

**pubspec.yaml**
```yaml
dependencies:
  flutter_localizations:
    sdk: flutter
  intl: ^0.19.0

flutter:
  assets:
    - assets/locales/tr-TR/
    - assets/locales/en-US/
```

**main.dart**
```dart
import 'package:flutter_localizations/flutter_localizations.dart';
import 'l10n/app_localizations.dart';

MaterialApp(
  localizationsDelegates: const [
    AppLocalizationsDelegate(),
    GlobalMaterialLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
  ],
  supportedLocales: AppLocalizationsDelegate.supportedLocales,
  // ...
)
```

### Temel Kullanım

```dart
import 'l10n/app_localizations.dart';

class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    return Column(
      children: [
        // Basit çeviri
        Text(l10n.translate('MENU_PLAY')),
        // veya shorthand:
        Text(l10n.t('MENU_PLAY')),

        // Parametre ile
        Text(l10n.translate('PROFILE_LEVEL', params: {'level': 5})),
        // "Seviye 5"

        // Getter shortcuts
        Text(l10n.menuPlay), // "Oyna"
        Text(l10n.menuProfile), // "Profilim"

        ElevatedButton(
          onPressed: () {},
          child: Text(l10n.confirm),
        ),
      ],
    );
  }
}
```

### Dil Değiştirme

```dart
// Locale provider (Riverpod örneği)
final localeProvider = StateProvider<Locale>((ref) => const Locale('tr', 'TR'));

// Kullanım
class LanguageSettings extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentLocale = ref.watch(localeProvider);

    return DropdownButton<Locale>(
      value: currentLocale,
      items: [
        DropdownMenuItem(
          value: const Locale('tr', 'TR'),
          child: Text('🇹🇷 Türkçe'),
        ),
        DropdownMenuItem(
          value: const Locale('en', 'US'),
          child: Text('🇺🇸 English'),
        ),
      ],
      onChanged: (locale) {
        if (locale != null) {
          ref.read(localeProvider.notifier).state = locale;
          // Backend'e de kaydet
          // await api.updateUserLanguage(locale.toString());
        }
      },
    );
  }
}
```

---

## Çeviri Dosyaları

### Dosya Yapısı

```
Project/locales/
├── tr-TR/
│   ├── common.json      # Genel kelimeler (yes, no, ok, cancel)
│   ├── ui.json          # UI metinleri (menu, buttons, labels)
│   ├── errors.json      # Hata mesajları
│   └── games.json       # Oyun içi metinler
└── en-US/
    ├── common.json
    ├── ui.json
    ├── errors.json
    └── games.json
```

### Çeviri Anahtarı Formatı

**Naming Convention:**
```
CATEGORY_CONTEXT_DETAIL

Örnekler:
MENU_PLAY           // Menü > Oyna butonu
AUTH_LOGIN_TITLE    // Auth > Giriş başlığı
ERROR_NETWORK       // Hata > Ağ hatası
GAME_YOUR_TURN      // Oyun > Senin sıran
PROFILE_LEVEL       // Profil > Seviye
```

**Parametre Kullanımı:**
```json
{
  "GREETING": "Merhaba, {name}!",
  "PROFILE_LEVEL": "Seviye {level}",
  "GAME_WINNER": "Kazanan: {playerName}",
  "TIME_LEFT": "Kalan Süre: {hours}s {minutes}d {seconds}s"
}
```

---

## Yeni Dil Ekleme

### 1. Database'e Ekle

```sql
INSERT INTO supported_languages (code, name, native_name, flag_emoji)
VALUES ('de-DE', 'German', 'Deutsch', '🇩🇪');
```

### 2. Çeviri Dosyaları Oluştur

```bash
mkdir -p Project/locales/de-DE
cp Project/locales/en-US/*.json Project/locales/de-DE/
# Ardından dosyaları Almanca'ya çevir
```

### 3. Backend'i Güncelle

```typescript
// i18n.service.ts - loadLanguages() içinde
languages.push({
  code: 'de-DE',
  name: 'German',
  nativeName: 'Deutsch',
  isActive: true,
  isDefault: false,
  direction: 'ltr',
  flagEmoji: '🇩🇪'
});
```

### 4. Frontend'i Güncelle

```dart
// app_localizations.dart
static const supportedLocales = [
  Locale('tr', 'TR'),
  Locale('en', 'US'),
  Locale('de', 'DE'), // Yeni
];
```

**pubspec.yaml**
```yaml
flutter:
  assets:
    - assets/locales/de-DE/
```

---

## Yeni Çeviri Ekleme

### 1. JSON Dosyalarına Ekle

**tr-TR/ui.json**
```json
{
  "NEW_FEATURE_TITLE": "Yeni Özellik"
}
```

**en-US/ui.json**
```json
{
  "NEW_FEATURE_TITLE": "New Feature"
}
```

### 2. Database'e Import (opsiyonel)

```typescript
await this.i18nService.setTranslation(
  'NEW_FEATURE_TITLE',
  new Map([
    ['tr-TR', 'Yeni Özellik'],
    ['en-US', 'New Feature']
  ]),
  'ui',
  'Title for the new feature section'
);
```

### 3. Kullan

**Backend:**
```typescript
const title = this.i18nService.translate('NEW_FEATURE_TITLE', userLang);
```

**Frontend:**
```dart
Text(l10n.translate('NEW_FEATURE_TITLE'))
```

---

## Best Practices

### ✅ Yapılması Gerekenler

1. **Key-based çeviriler kullan**
   ```dart
   ✅ Text(l10n.t('MENU_PLAY'))
   ❌ Text('Oyna')
   ```

2. **Anlamlı key isimleri**
   ```
   ✅ ERROR_AUTH_INVALID_CREDENTIALS
   ❌ ERR1, ERROR_MSG_23
   ```

3. **Parametre kullan**
   ```json
   ✅ "GREETING": "Merhaba, {name}!"
   ❌ "GREETING_JOHN": "Merhaba, John!"
   ```

4. **Context bilgisi ekle**
   ```typescript
   ✅ await i18n.setTranslation(key, values, category, 'Used in settings page')
   ```

5. **Fallback stratejisi**
   ```typescript
   // tr-TR → en-US → key
   const text = i18n.translate(key, preferredLang);
   ```

### ❌ Yapılmaması Gerekenler

1. **Hard-coded metinler**
   ```dart
   ❌ AppBar(title: Text('Ana Sayfa'))
   ✅ AppBar(title: Text(l10n.menuHome))
   ```

2. **Dil spesifik kod**
   ```typescript
   ❌ if (lang === 'tr-TR') { return 'Merhaba'; }
   ✅ return i18n.translate('GREETING', lang);
   ```

3. **Birleştirilmiş string'ler**
   ```dart
   ❌ 'Seviye ' + level.toString()
   ✅ l10n.t('PROFILE_LEVEL', params: {'level': level})
   ```

4. **Eksik çeviriler**
   ```typescript
   // Her key için tüm dillerde çeviri olmalı
   ✅ Düzenli olarak findMissingTranslations() çalıştır
   ```

### 🎯 Öneriler

**Çeviri Kalite Kontrolü:**
```typescript
// Çeviri testleri
describe('Translations', () => {
  it('should have all keys in all languages', async () => {
    const missing = await i18n.findMissingTranslations('en-US');
    expect(missing).toHaveLength(0);
  });

  it('should have valid parameters', async () => {
    const validation = await i18n.validateTranslation('GREETING', 'tr-TR');
    expect(validation.hasMissingParams).toBe(false);
  });
});
```

**Çeviri Coverage:**
```typescript
const stats = i18n.getStatistics();
stats.coverage.forEach((lang, code) => {
  if (lang.percentage < 100) {
    logger.warn(`Language ${code} is ${lang.percentage}% complete`);
  }
});
```

---

## Örnekler

### Bildirim Gönderme (Backend)

```typescript
async sendNotification(userId: string, type: string, data: any) {
  const userLang = await this.i18nService.getUserLanguage(userId);

  const title = this.i18nService.translate(
    `NOTIFICATION_${type.toUpperCase()}_TITLE`,
    userLang
  );

  const message = this.i18nService.translate(
    `NOTIFICATION_${type.toUpperCase()}_MESSAGE`,
    userLang,
    data // { playerName: 'John', level: 5 }
  );

  await this.notificationService.send({
    userId,
    title,
    message
  });
}
```

### Oyun İçi Mesajlar (Frontend)

```dart
class GameScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final gameState = ref.watch(gameStateProvider);

    return Center(
      child: Text(
        gameState.isMyTurn
          ? l10n.t('GAME_YOUR_TURN')
          : l10n.t('GAME_WAITING_FOR_TURN', params: {
              'playerName': gameState.currentPlayer.name
            }),
        style: Theme.of(context).textTheme.headlineSmall,
      ),
    );
  }
}
```

### Hata Mesajları

```typescript
// Backend error handler
catch (error) {
  const userLang = request.user?.preferredLanguage || 'tr-TR';

  const errorMessage = this.i18nService.translate(
    `ERROR_${error.code}`,
    userLang
  );

  throw new HttpException({
    message: errorMessage,
    code: error.code
  }, HttpStatus.BAD_REQUEST);
}
```

```dart
// Frontend error handling
try {
  await api.createRoom(roomName);
} catch (error) {
  final l10n = AppLocalizations.of(context);

  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text(l10n.t('ERROR_${error.code}')),
      backgroundColor: Colors.red,
    ),
  );
}
```

---

## İleri Düzey Konular

### Dil Bağımlı Oyun İçeriği

**Kelime Oyunu:**
```typescript
// Backend - Kelime listesi getir
async getWordsForGame(gameId: string, languageCode: string) {
  const words = await db.query(`
    SELECT word
    FROM word_lists
    WHERE language_code = $1
      AND difficulty = 'medium'
      AND is_active = true
    ORDER BY RANDOM()
    LIMIT 100
  `, [languageCode]);

  return words;
}
```

**Bilmece Oyunu:**
```typescript
async getRiddle(languageCode: string, difficulty: string) {
  const riddle = await db.queryOne(`
    SELECT question, answer, hints
    FROM riddles
    WHERE language_code = $1
      AND difficulty = $2
      AND is_active = true
    ORDER BY RANDOM()
    LIMIT 1
  `, [languageCode, difficulty]);

  return riddle;
}
```

### Çeviri Versiyonlama

Önemli çeviri değişikliklerini takip etmek için:

```sql
-- Her çeviri güncellemesinde history kaydı
INSERT INTO translation_history (
  translation_id,
  language_code,
  old_value,
  new_value,
  changed_by,
  change_reason
) VALUES (
  'uuid',
  'tr-TR',
  'Eski Metin',
  'Yeni Metin',
  'admin_user_id',
  'Grammar correction'
);
```

---

**Son Güncelleme:** 2025-11-17
**Hazırlayan:** AI Assistant
**Durum:** Production Ready
