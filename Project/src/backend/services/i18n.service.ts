/**
 * i18n Service (Internationalization)
 *
 * Çoklu dil desteği için merkezi servis.
 * Çevirileri yükler, cache'ler ve sunucu/client tarafına sunar.
 *
 * @see Documentation/ProjeBaslangic.md - Bölüm 8
 * @see Project/config/schema/i18n_schema.sql
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

export interface Translation {
  key: string;
  category: string;
  context?: string;
  values: Map<string, string>; // language_code -> translated value
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  isActive: boolean;
  isDefault: boolean;
  direction: 'ltr' | 'rtl';
  flagEmoji?: string;
}

export interface TranslationParams {
  [key: string]: string | number;
}

@Injectable()
export class I18nService implements OnModuleInit {
  private readonly logger = new Logger(I18nService.name);

  // In-memory cache
  private translations: Map<string, Translation> = new Map();
  private languages: Map<string, Language> = new Map();
  private defaultLanguage: string = 'tr-TR';

  async onModuleInit() {
    await this.loadLanguages();
    await this.loadTranslations();
  }

  /**
   * Desteklenen dilleri yükler
   */
  async loadLanguages(): Promise<void> {
    // TODO: Database'den oku
    // SELECT * FROM supported_languages WHERE is_active = true

    // Mock data
    const languages: Language[] = [
      {
        code: 'tr-TR',
        name: 'Turkish',
        nativeName: 'Türkçe',
        isActive: true,
        isDefault: true,
        direction: 'ltr',
        flagEmoji: '🇹🇷'
      },
      {
        code: 'en-US',
        name: 'English',
        nativeName: 'English',
        isActive: true,
        isDefault: false,
        direction: 'ltr',
        flagEmoji: '🇺🇸'
      }
    ];

    languages.forEach(lang => {
      this.languages.set(lang.code, lang);
      if (lang.isDefault) {
        this.defaultLanguage = lang.code;
      }
    });

    this.logger.log(`Loaded ${languages.length} languages. Default: ${this.defaultLanguage}`);
  }

  /**
   * Tüm çevirileri yükler (cache'e alır)
   */
  async loadTranslations(): Promise<void> {
    // TODO: Database'den oku
    // SELECT t.key, t.category, tv.language_code, tv.value
    // FROM translations t
    // JOIN translation_values tv ON t.id = tv.translation_id
    // WHERE t.is_active = true

    this.logger.log(`Loaded ${this.translations.size} translation keys`);
  }

  /**
   * Belirli bir çeviriyi yeniden yükler
   */
  async reloadTranslation(key: string): Promise<void> {
    // TODO: Database'den belirli key'i yükle
    this.logger.debug(`Reloaded translation: ${key}`);
  }

  /**
   * Çeviri getirir (parametre desteği ile)
   */
  translate(
    key: string,
    languageCode: string = this.defaultLanguage,
    params?: TranslationParams
  ): string {
    const translation = this.translations.get(key);

    if (!translation) {
      this.logger.warn(`Translation key not found: ${key}`);
      return key;
    }

    // İstenen dilde çeviri var mı?
    let text = translation.values.get(languageCode);

    // Yoksa fallback (İngilizce)
    if (!text && languageCode !== 'en-US') {
      text = translation.values.get('en-US');
    }

    // Hiç yoksa default dil
    if (!text) {
      text = translation.values.get(this.defaultLanguage);
    }

    // Hala yoksa key'i döndür
    if (!text) {
      return key;
    }

    // Parametre replacement
    if (params) {
      text = this.replaceParams(text, params);
    }

    return text;
  }

  /**
   * Çoklu çeviri getirir (bulk)
   */
  translateBulk(
    keys: string[],
    languageCode: string = this.defaultLanguage
  ): Map<string, string> {
    const results = new Map<string, string>();

    keys.forEach(key => {
      results.set(key, this.translate(key, languageCode));
    });

    return results;
  }

  /**
   * JSONB translation helper
   * Database'de jsonb olarak saklanan çevirileri parse eder
   */
  parseJsonbTranslation(
    translations: Record<string, string> | null,
    languageCode: string = this.defaultLanguage,
    fallbackKey?: string
  ): string {
    if (!translations || Object.keys(translations).length === 0) {
      return fallbackKey || '';
    }

    // İstenen dilde var mı?
    if (translations[languageCode]) {
      return translations[languageCode];
    }

    // Fallback İngilizce
    if (translations['en-US']) {
      return translations['en-US'];
    }

    // İlk bulduğu çeviri
    const firstKey = Object.keys(translations)[0];
    return translations[firstKey] || fallbackKey || '';
  }

  /**
   * Parametre replacement
   * Örnek: "Merhaba {name}!" -> "Merhaba John!"
   */
  private replaceParams(text: string, params: TranslationParams): string {
    let result = text;

    Object.keys(params).forEach(key => {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(params[key]));
    });

    return result;
  }

  /**
   * Çeviri ekler veya günceller
   */
  async setTranslation(
    key: string,
    translations: Map<string, string>,
    category: string = 'common',
    context?: string
  ): Promise<void> {
    // TODO: Database'e kaydet
    // 1. translations tablosuna key ekle
    // 2. Her dil için translation_values'a kayıt ekle

    // Cache'i güncelle
    this.translations.set(key, {
      key,
      category,
      context,
      values: translations
    });

    this.logger.log(`Translation set: ${key} (${translations.size} languages)`);
  }

  /**
   * Toplu çeviri ekleme (import)
   */
  async importTranslations(
    data: Array<{
      key: string;
      category: string;
      translations: Record<string, string>;
    }>
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const item of data) {
      try {
        const translations = new Map<string, string>(
          Object.entries(item.translations)
        );

        await this.setTranslation(item.key, translations, item.category);
        success++;
      } catch (error) {
        this.logger.error(`Failed to import translation: ${item.key}`, error);
        failed++;
      }
    }

    this.logger.log(`Import completed: ${success} success, ${failed} failed`);

    return { success, failed };
  }

  /**
   * Tüm çevirileri export eder (JSON format)
   */
  exportTranslations(languageCode?: string): Record<string, any> {
    const result: Record<string, any> = {};

    this.translations.forEach((translation, key) => {
      if (languageCode) {
        // Belirli bir dil için
        result[key] = translation.values.get(languageCode) || key;
      } else {
        // Tüm diller için
        const langs: Record<string, string> = {};
        translation.values.forEach((value, lang) => {
          langs[lang] = value;
        });
        result[key] = langs;
      }
    });

    return result;
  }

  /**
   * Eksik çevirileri bulur
   */
  async findMissingTranslations(languageCode: string): Promise<string[]> {
    const missing: string[] = [];

    this.translations.forEach((translation, key) => {
      if (!translation.values.has(languageCode)) {
        missing.push(key);
      }
    });

    this.logger.log(`Found ${missing.length} missing translations for ${languageCode}`);

    return missing;
  }

  /**
   * Çeviri istatistikleri
   */
  getStatistics(): {
    totalKeys: number;
    languages: number;
    coverage: Map<string, { translated: number; percentage: number }>;
  } {
    const totalKeys = this.translations.size;
    const coverage = new Map<string, { translated: number; percentage: number }>();

    this.languages.forEach((lang, code) => {
      let translated = 0;

      this.translations.forEach(translation => {
        if (translation.values.has(code)) {
          translated++;
        }
      });

      const percentage = totalKeys > 0 ? (translated / totalKeys) * 100 : 0;

      coverage.set(code, {
        translated,
        percentage: Math.round(percentage * 100) / 100
      });
    });

    return {
      totalKeys,
      languages: this.languages.size,
      coverage
    };
  }

  /**
   * Dil bilgisini döndürür
   */
  getLanguage(code: string): Language | undefined {
    return this.languages.get(code);
  }

  /**
   * Tüm aktif dilleri döndürür
   */
  getSupportedLanguages(): Language[] {
    return Array.from(this.languages.values()).filter(lang => lang.isActive);
  }

  /**
   * Varsayılan dili döndürür
   */
  getDefaultLanguage(): string {
    return this.defaultLanguage;
  }

  /**
   * Kullanıcının dil tercihini getirir
   */
  async getUserLanguage(userId: string): Promise<string> {
    // TODO: Database'den oku
    // SELECT preferred_language FROM users WHERE id = ?

    return this.defaultLanguage;
  }

  /**
   * Kullanıcının dil tercihini günceller
   */
  async setUserLanguage(userId: string, languageCode: string): Promise<void> {
    // Geçerli bir dil mi?
    if (!this.languages.has(languageCode)) {
      throw new Error(`Invalid language code: ${languageCode}`);
    }

    // TODO: Database'e kaydet
    // UPDATE users SET preferred_language = ? WHERE id = ?

    this.logger.log(`User ${userId} language updated to ${languageCode}`);
  }

  /**
   * Tarayıcı Accept-Language header'ından dil tespiti
   */
  detectLanguageFromHeader(acceptLanguage: string): string {
    if (!acceptLanguage) {
      return this.defaultLanguage;
    }

    // Accept-Language: tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const parts = lang.trim().split(';');
        const code = parts[0];
        const quality = parts[1] ? parseFloat(parts[1].split('=')[1]) : 1.0;
        return { code, quality };
      })
      .sort((a, b) => b.quality - a.quality);

    // Desteklenen bir dil var mı?
    for (const lang of languages) {
      if (this.languages.has(lang.code)) {
        return lang.code;
      }

      // Kısa kod denemeleri (tr -> tr-TR)
      const shortCode = lang.code.split('-')[0];
      for (const [code, _] of this.languages) {
        if (code.startsWith(shortCode + '-')) {
          return code;
        }
      }
    }

    return this.defaultLanguage;
  }

  /**
   * Çeviri kalitesi kontrol et
   */
  async validateTranslation(
    key: string,
    languageCode: string
  ): Promise<{
    exists: boolean;
    isEmpty: boolean;
    hasMissingParams: boolean;
    warnings: string[];
  }> {
    const translation = this.translations.get(key);
    const warnings: string[] = [];

    if (!translation) {
      return {
        exists: false,
        isEmpty: true,
        hasMissingParams: false,
        warnings: ['Translation key does not exist']
      };
    }

    const text = translation.values.get(languageCode);
    const isEmpty = !text || text.trim().length === 0;

    // Parametre kontrolü (bir dilde var diğerinde yok mu?)
    const allParams = new Set<string>();
    translation.values.forEach(value => {
      const matches = value.match(/\{(\w+)\}/g);
      if (matches) {
        matches.forEach(match => {
          allParams.add(match);
        });
      }
    });

    const currentParams = new Set<string>();
    if (text) {
      const matches = text.match(/\{(\w+)\}/g);
      if (matches) {
        matches.forEach(match => currentParams.add(match));
      }
    }

    const hasMissingParams = allParams.size > 0 && currentParams.size !== allParams.size;

    if (hasMissingParams) {
      warnings.push('Missing parameters compared to other languages');
    }

    return {
      exists: true,
      isEmpty,
      hasMissingParams,
      warnings
    };
  }
}
