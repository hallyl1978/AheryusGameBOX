import { Test, TestingModule } from '@nestjs/testing';
import { I18nService, TranslationParams } from './i18n.service';
import { DatabaseConfig } from '../config/database.config';
import { ConfigService } from '@nestjs/config';

describe('I18nService', () => {
  let service: I18nService;

  const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        I18nService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                'game.defaultLanguage': 'tr-TR',
                'game.supportedLanguages': ['tr-TR', 'en-US'],
                'SUPABASE_URL': 'https://test.supabase.co',
                'SUPABASE_SERVICE_ROLE_KEY': 'test-key',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<I18nService>(I18nService);

    jest.spyOn(DatabaseConfig, 'getClient').mockReturnValue(mockSupabaseClient as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loadTranslations', () => {
    it('should load translations from database', async () => {
      const mockTranslations = [
        {
          key: 'WELCOME',
          category: 'common',
          translation_values: [
            { language_code: 'tr-TR', value: 'Hoş Geldiniz' },
            { language_code: 'en-US', value: 'Welcome' },
          ],
        },
        {
          key: 'GOODBYE',
          category: 'common',
          translation_values: [
            { language_code: 'tr-TR', value: 'Görüşürüz' },
            { language_code: 'en-US', value: 'Goodbye' },
          ],
        },
      ];

      mockSupabaseClient.select.mockResolvedValueOnce({
        data: mockTranslations,
        error: null,
      });

      await service.loadTranslations();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('translations');
      expect(mockSupabaseClient.select).toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      mockSupabaseClient.select.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed' },
      });

      await expect(service.loadTranslations()).rejects.toThrow();
    });
  });

  describe('translate', () => {
    beforeEach(async () => {
      const mockTranslations = [
        {
          key: 'WELCOME',
          category: 'common',
          translation_values: [
            { language_code: 'tr-TR', value: 'Hoş Geldiniz' },
            { language_code: 'en-US', value: 'Welcome' },
          ],
        },
        {
          key: 'GREETING',
          category: 'common',
          translation_values: [
            { language_code: 'tr-TR', value: 'Merhaba {name}' },
            { language_code: 'en-US', value: 'Hello {name}' },
          ],
        },
      ];

      mockSupabaseClient.select.mockResolvedValueOnce({
        data: mockTranslations,
        error: null,
      });

      await service.loadTranslations();
    });

    it('should translate key to specified language', () => {
      const result = service.translate('WELCOME', 'tr-TR');
      expect(result).toBe('Hoş Geldiniz');
    });

    it('should translate key to English', () => {
      const result = service.translate('WELCOME', 'en-US');
      expect(result).toBe('Welcome');
    });

    it('should use default language when not specified', () => {
      const result = service.translate('WELCOME');
      expect(result).toBe('Hoş Geldiniz'); // Default is tr-TR
    });

    it('should replace parameters in translation', () => {
      const params: TranslationParams = { name: 'Ahmet' };
      const result = service.translate('GREETING', 'tr-TR', params);
      expect(result).toBe('Merhaba Ahmet');
    });

    it('should replace multiple parameters', () => {
      // Add a translation with multiple params
      const mockTranslations = [
        {
          key: 'SCORE',
          category: 'game',
          translation_values: [
            { language_code: 'tr-TR', value: '{player} {points} puan kazandı' },
            { language_code: 'en-US', value: '{player} earned {points} points' },
          ],
        },
      ];

      mockSupabaseClient.select.mockResolvedValueOnce({
        data: mockTranslations,
        error: null,
      });

      service.loadTranslations();

      const params: TranslationParams = { player: 'Ahmet', points: 100 };
      const result = service.translate('SCORE', 'tr-TR', params);
      expect(result).toBe('Ahmet 100 puan kazandı');
    });

    it('should fallback to English when translation not found in specified language', () => {
      const mockTranslations = [
        {
          key: 'NEW_FEATURE',
          category: 'common',
          translation_values: [
            { language_code: 'en-US', value: 'New Feature' },
          ],
        },
      ];

      mockSupabaseClient.select.mockResolvedValueOnce({
        data: mockTranslations,
        error: null,
      });

      service.loadTranslations();

      const result = service.translate('NEW_FEATURE', 'tr-TR');
      expect(result).toBe('New Feature'); // Fallback to English
    });

    it('should return key when translation not found', () => {
      const result = service.translate('NON_EXISTENT_KEY', 'tr-TR');
      expect(result).toBe('NON_EXISTENT_KEY');
    });
  });

  describe('parseJsonbTranslation', () => {
    it('should parse JSONB translation object', () => {
      const translations = {
        'tr-TR': 'Türkçe Metin',
        'en-US': 'English Text',
      };

      const result = service.parseJsonbTranslation(translations, 'tr-TR');
      expect(result).toBe('Türkçe Metin');
    });

    it('should fallback to English when language not found', () => {
      const translations = {
        'en-US': 'English Text',
      };

      const result = service.parseJsonbTranslation(translations, 'tr-TR');
      expect(result).toBe('English Text');
    });

    it('should return empty string when no translations available', () => {
      const result = service.parseJsonbTranslation({}, 'tr-TR');
      expect(result).toBe('');
    });

    it('should handle null/undefined translations', () => {
      expect(service.parseJsonbTranslation(null, 'tr-TR')).toBe('');
      expect(service.parseJsonbTranslation(undefined, 'tr-TR')).toBe('');
    });
  });

  describe('getSupportedLanguages', () => {
    it('should return list of supported languages', async () => {
      const mockLanguages = [
        { code: 'tr-TR', name: 'Turkish', native_name: 'Türkçe', is_active: true },
        { code: 'en-US', name: 'English', native_name: 'English', is_active: true },
      ];

      mockSupabaseClient.select.mockResolvedValueOnce({
        data: mockLanguages,
        error: null,
      });

      const result = await service.getSupportedLanguages();

      expect(result).toEqual(mockLanguages);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('supported_languages');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('is_active', true);
    });
  });

  describe('translateBulk', () => {
    beforeEach(async () => {
      const mockTranslations = [
        {
          key: 'WELCOME',
          category: 'common',
          translation_values: [
            { language_code: 'tr-TR', value: 'Hoş Geldiniz' },
            { language_code: 'en-US', value: 'Welcome' },
          ],
        },
        {
          key: 'GOODBYE',
          category: 'common',
          translation_values: [
            { language_code: 'tr-TR', value: 'Görüşürüz' },
            { language_code: 'en-US', value: 'Goodbye' },
          ],
        },
      ];

      mockSupabaseClient.select.mockResolvedValueOnce({
        data: mockTranslations,
        error: null,
      });

      await service.loadTranslations();
    });

    it('should translate multiple keys at once', () => {
      const keys = ['WELCOME', 'GOODBYE'];
      const result = service.translateBulk(keys, 'tr-TR');

      expect(result).toEqual({
        WELCOME: 'Hoş Geldiniz',
        GOODBYE: 'Görüşürüz',
      });
    });

    it('should handle missing keys in bulk translation', () => {
      const keys = ['WELCOME', 'NON_EXISTENT', 'GOODBYE'];
      const result = service.translateBulk(keys, 'tr-TR');

      expect(result).toEqual({
        WELCOME: 'Hoş Geldiniz',
        NON_EXISTENT: 'NON_EXISTENT',
        GOODBYE: 'Görüşürüz',
      });
    });
  });
});
