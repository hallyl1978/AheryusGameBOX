-- AheryusGameBOX - i18n (Internationalization) Şeması
-- Çoklu dil desteği için veritabanı yapıları
-- Referans: Documentation/ProjeBaslangic.md - Bölüm 8

-- ============================================================================
-- 1. DİL YÖNETİMİ
-- ============================================================================

-- Desteklenen diller
CREATE TABLE IF NOT EXISTS public.supported_languages (
    code text PRIMARY KEY, -- tr-TR, en-US, de-DE, fr-FR
    name text NOT NULL,
    native_name text NOT NULL, -- Türkçe, English, Deutsch
    is_active boolean DEFAULT true,
    is_default boolean DEFAULT false,
    direction text DEFAULT 'ltr', -- ltr, rtl (Arabic için)
    flag_emoji text,
    created_at timestamptz DEFAULT timezone('utc', now()),
    updated_at timestamptz DEFAULT timezone('utc', now())
);

-- Varsayılan dilleri ekle
INSERT INTO public.supported_languages (code, name, native_name, is_default, flag_emoji) VALUES
    ('tr-TR', 'Turkish', 'Türkçe', true, '🇹🇷'),
    ('en-US', 'English', 'English', false, '🇺🇸')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 2. ÇEVIRI YÖNETİMİ
-- ============================================================================

-- Çeviri kategorileri (organizasyon için)
CREATE TABLE IF NOT EXISTS public.translation_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text UNIQUE NOT NULL, -- ui, games, errors, notifications, achievements
    name text NOT NULL,
    description text,
    created_at timestamptz DEFAULT timezone('utc', now())
);

-- Ana çeviri tablosu (key-value based)
CREATE TABLE IF NOT EXISTS public.translations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text NOT NULL, -- MENU_PLAY, ERROR_NETWORK, ACHIEVEMENT_FIRST_WIN
    category_id uuid REFERENCES public.translation_categories(id),
    context text, -- Çevirmenlere yardımcı bilgi
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT timezone('utc', now()),
    updated_at timestamptz DEFAULT timezone('utc', now()),
    UNIQUE(key)
);

-- Çeviri değerleri (her dil için)
CREATE TABLE IF NOT EXISTS public.translation_values (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    translation_id uuid NOT NULL REFERENCES public.translations(id) ON DELETE CASCADE,
    language_code text NOT NULL REFERENCES public.supported_languages(code),
    value text NOT NULL,
    is_reviewed boolean DEFAULT false, -- Profesyonel çevirmen incelemesi
    reviewed_by uuid REFERENCES public.users(id),
    reviewed_at timestamptz,
    created_at timestamptz DEFAULT timezone('utc', now()),
    updated_at timestamptz DEFAULT timezone('utc', now()),
    UNIQUE(translation_id, language_code)
);

-- ============================================================================
-- 3. OYUN İÇERİĞİ ÇEVİRİLERİ
-- ============================================================================

-- Oyun isimleri ve açıklamaları (çoklu dil)
ALTER TABLE public.games
    ADD COLUMN IF NOT EXISTS name_translations jsonb DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS description_translations jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.games.name_translations IS 'Oyun adı çevirileri: {"tr-TR": "Kelime Oyunu", "en-US": "Word Game"}';
COMMENT ON COLUMN public.games.description_translations IS 'Oyun açıklaması çevirileri';

-- Rozetler (çoklu dil)
ALTER TABLE public.achievements
    ADD COLUMN IF NOT EXISTS name_translations jsonb DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS description_translations jsonb DEFAULT '{}'::jsonb;

-- Bildirimler (çoklu dil)
ALTER TABLE public.notifications
    ADD COLUMN IF NOT EXISTS title_translations jsonb DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS message_translations jsonb DEFAULT '{}'::jsonb;

-- Turnuvalar (çoklu dil)
ALTER TABLE public.tournaments
    ADD COLUMN IF NOT EXISTS name_translations jsonb DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS description_translations jsonb DEFAULT '{}'::jsonb;

-- ============================================================================
-- 4. DİL BAĞIMLI OYUN İÇERİĞİ
-- ============================================================================

-- Kelime oyunları için kelime listesi
CREATE TABLE IF NOT EXISTS public.word_lists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    language_code text NOT NULL REFERENCES public.supported_languages(code),
    word text NOT NULL,
    difficulty text, -- easy, medium, hard
    category text, -- animals, foods, sports
    length int,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT timezone('utc', now()),
    UNIQUE(language_code, word)
);

-- Bilmeceler ve trivia soruları (dil bağımlı)
CREATE TABLE IF NOT EXISTS public.riddles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    language_code text NOT NULL REFERENCES public.supported_languages(code),
    question text NOT NULL,
    answer text NOT NULL,
    hints jsonb, -- Array of hints
    difficulty text,
    category text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT timezone('utc', now())
);

-- Trivia soruları
CREATE TABLE IF NOT EXISTS public.trivia_questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    language_code text NOT NULL REFERENCES public.supported_languages(code),
    question text NOT NULL,
    correct_answer text NOT NULL,
    wrong_answers jsonb NOT NULL, -- Array of 3 wrong answers
    category text,
    difficulty text,
    explanation text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT timezone('utc', now())
);

-- ============================================================================
-- 5. KULLANICI DİL TERCİHLERİ
-- ============================================================================

-- User tablosunu güncelle (eğer yoksa)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'preferred_language'
    ) THEN
        ALTER TABLE public.users
            ADD COLUMN preferred_language text DEFAULT 'tr-TR' REFERENCES public.supported_languages(code);
    END IF;
END $$;

-- Oyun oturumu için dil seçimi
ALTER TABLE public.game_sessions
    ADD COLUMN IF NOT EXISTS language_code text REFERENCES public.supported_languages(code);

COMMENT ON COLUMN public.game_sessions.language_code IS 'Bu oyun oturumu için kullanılan dil (kelime oyunları için kritik)';

-- ============================================================================
-- 6. ÇEVIRI GEÇMİŞİ VE VERSİYONLAMA
-- ============================================================================

-- Çeviri değişiklik geçmişi
CREATE TABLE IF NOT EXISTS public.translation_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    translation_id uuid NOT NULL REFERENCES public.translations(id) ON DELETE CASCADE,
    language_code text NOT NULL,
    old_value text,
    new_value text,
    changed_by uuid REFERENCES public.users(id),
    change_reason text,
    created_at timestamptz DEFAULT timezone('utc', now())
);

-- ============================================================================
-- 7. İNDEKSLER
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_translation_values_language
    ON public.translation_values(language_code);

CREATE INDEX IF NOT EXISTS idx_translation_values_lookup
    ON public.translation_values(translation_id, language_code);

CREATE INDEX IF NOT EXISTS idx_translations_key
    ON public.translations(key) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_word_lists_language
    ON public.word_lists(language_code, difficulty);

CREATE INDEX IF NOT EXISTS idx_riddles_language
    ON public.riddles(language_code, is_active);

CREATE INDEX IF NOT EXISTS idx_trivia_language
    ON public.trivia_questions(language_code, is_active);

-- Games için JSONB indeksler (PostgreSQL GIN index)
CREATE INDEX IF NOT EXISTS idx_games_name_translations
    ON public.games USING gin(name_translations);

CREATE INDEX IF NOT EXISTS idx_achievements_name_translations
    ON public.achievements USING gin(name_translations);

-- ============================================================================
-- 8. ÖRNEK VERİLER
-- ============================================================================

-- Çeviri kategorileri
INSERT INTO public.translation_categories (code, name, description) VALUES
    ('ui', 'UI Elements', 'User interface texts, buttons, labels'),
    ('games', 'Game Content', 'Game names, descriptions, rules'),
    ('errors', 'Error Messages', 'System and validation errors'),
    ('notifications', 'Notifications', 'Push notifications and alerts'),
    ('achievements', 'Achievements', 'Achievement names and descriptions'),
    ('social', 'Social', 'Friend requests, party invites, chat'),
    ('tutorial', 'Tutorial', 'Tutorial and onboarding texts'),
    ('common', 'Common', 'Commonly used words and phrases')
ON CONFLICT (code) DO NOTHING;

-- Örnek çeviriler (Common)
DO $$
DECLARE
    cat_id uuid;
    trans_id uuid;
BEGIN
    -- Common category ID
    SELECT id INTO cat_id FROM public.translation_categories WHERE code = 'common';

    -- YES / NO
    INSERT INTO public.translations (key, category_id, context)
    VALUES ('COMMON_YES', cat_id, 'Affirmative response')
    RETURNING id INTO trans_id;

    INSERT INTO public.translation_values (translation_id, language_code, value) VALUES
        (trans_id, 'tr-TR', 'Evet'),
        (trans_id, 'en-US', 'Yes');

    INSERT INTO public.translations (key, category_id, context)
    VALUES ('COMMON_NO', cat_id, 'Negative response')
    RETURNING id INTO trans_id;

    INSERT INTO public.translation_values (translation_id, language_code, value) VALUES
        (trans_id, 'tr-TR', 'Hayır'),
        (trans_id, 'en-US', 'No');

    -- CANCEL / CONFIRM
    INSERT INTO public.translations (key, category_id, context)
    VALUES ('COMMON_CANCEL', cat_id, 'Cancel action button')
    RETURNING id INTO trans_id;

    INSERT INTO public.translation_values (translation_id, language_code, value) VALUES
        (trans_id, 'tr-TR', 'İptal'),
        (trans_id, 'en-US', 'Cancel');

    INSERT INTO public.translations (key, category_id, context)
    VALUES ('COMMON_CONFIRM', cat_id, 'Confirm action button')
    RETURNING id INTO trans_id;

    INSERT INTO public.translation_values (translation_id, language_code, value) VALUES
        (trans_id, 'tr-TR', 'Onayla'),
        (trans_id, 'en-US', 'Confirm');
END $$;

-- ============================================================================
-- 9. HELPER FUNCTIONS
-- ============================================================================

-- Çeviri alma fonksiyonu
CREATE OR REPLACE FUNCTION get_translation(
    translation_key text,
    lang_code text DEFAULT 'tr-TR'
) RETURNS text AS $$
DECLARE
    translation_text text;
BEGIN
    SELECT tv.value INTO translation_text
    FROM public.translations t
    JOIN public.translation_values tv ON t.id = tv.translation_id
    WHERE t.key = translation_key
      AND tv.language_code = lang_code
      AND t.is_active = true
    LIMIT 1;

    -- Eğer çeviri bulunamazsa, İngilizce'yi dene
    IF translation_text IS NULL AND lang_code != 'en-US' THEN
        SELECT tv.value INTO translation_text
        FROM public.translations t
        JOIN public.translation_values tv ON t.id = tv.translation_id
        WHERE t.key = translation_key
          AND tv.language_code = 'en-US'
          AND t.is_active = true
        LIMIT 1;
    END IF;

    -- Hiç çeviri yoksa key'i döndür
    RETURN COALESCE(translation_text, translation_key);
END;
$$ LANGUAGE plpgsql;

-- JSONB çeviri alma fonksiyonu
CREATE OR REPLACE FUNCTION get_jsonb_translation(
    translations jsonb,
    lang_code text DEFAULT 'tr-TR',
    fallback_lang text DEFAULT 'en-US'
) RETURNS text AS $$
BEGIN
    -- İstenen dilde çeviri var mı?
    IF translations ? lang_code THEN
        RETURN translations->>lang_code;
    END IF;

    -- Fallback dilde var mı?
    IF translations ? fallback_lang THEN
        RETURN translations->>fallback_lang;
    END IF;

    -- İlk bulduğu çeviriyi döndür
    RETURN (SELECT value FROM jsonb_each_text(translations) LIMIT 1);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.supported_languages IS 'Platformda desteklenen diller';
COMMENT ON TABLE public.translations IS 'Çeviri anahtarları (key-based i18n)';
COMMENT ON TABLE public.translation_values IS 'Her dil için çeviri değerleri';
COMMENT ON TABLE public.word_lists IS 'Kelime oyunları için dil bazlı kelime listeleri';
COMMENT ON TABLE public.riddles IS 'Bilmece oyunları için dil bazlı içerik';
COMMENT ON TABLE public.trivia_questions IS 'Trivia/quiz oyunları için dil bazlı sorular';

COMMENT ON FUNCTION get_translation IS 'Çeviri anahtarından dil bazlı metin döndürür, fallback destekler';
COMMENT ON FUNCTION get_jsonb_translation IS 'JSONB çevirilerden dil bazlı metin çıkarır';
