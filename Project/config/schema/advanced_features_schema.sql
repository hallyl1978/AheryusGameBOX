-- AheryusGameBOX - İleri Düzey Özellikler Şeması
-- Bu dosya initial_schema.sql sonrasında çalıştırılmak üzere hazırlanmıştır.
-- Documentation/Advanced_Features.md dokümanına referans alır.

-- ============================================================================
-- 1. MATCHMAKING SİSTEMİ
-- ============================================================================

-- Oyuncu beceri puanları (MMR - Matchmaking Rating)
CREATE TABLE IF NOT EXISTS public.player_ratings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    mmr int DEFAULT 1000,
    games_played int DEFAULT 0,
    wins int DEFAULT 0,
    losses int DEFAULT 0,
    draws int DEFAULT 0,
    volatility decimal(10,2) DEFAULT 50.0,
    peak_mmr int DEFAULT 1000,
    last_match_at timestamptz,
    created_at timestamptz DEFAULT timezone('utc', now()),
    updated_at timestamptz DEFAULT timezone('utc', now()),
    UNIQUE(user_id, game_id)
);

-- Eşleştirme kuyruğu (matchmaking queue)
CREATE TABLE IF NOT EXISTS public.matchmaking_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    mmr int NOT NULL,
    preferences jsonb DEFAULT '{}'::jsonb,
    region text,
    party_id uuid,
    status text DEFAULT 'waiting', -- waiting, matched, cancelled, timeout
    joined_at timestamptz DEFAULT timezone('utc', now()),
    matched_at timestamptz,
    expires_at timestamptz,
    CONSTRAINT valid_status CHECK (status IN ('waiting', 'matched', 'cancelled', 'timeout'))
);

-- Eşleştirme geçmişi (matchmaking history)
CREATE TABLE IF NOT EXISTS public.matchmaking_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id uuid NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    avg_mmr decimal(10,2),
    mmr_spread decimal(10,2),
    wait_time_seconds int,
    player_ratings jsonb,
    quality_score decimal(5,2),
    created_at timestamptz DEFAULT timezone('utc', now())
);

-- ============================================================================
-- 2. ANALİTİK VE TELEMETRİ
-- ============================================================================

-- Telemetri olayları (telemetry events)
CREATE TABLE IF NOT EXISTS public.telemetry_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    session_id uuid REFERENCES public.game_sessions(id) ON DELETE SET NULL,
    event_type text NOT NULL,
    event_category text NOT NULL, -- navigation, action, system, social, economy
    event_data jsonb NOT NULL,
    client_timestamp timestamptz,
    server_timestamp timestamptz DEFAULT timezone('utc', now()),
    platform text,
    app_version text,
    CONSTRAINT valid_category CHECK (event_category IN ('navigation', 'action', 'system', 'social', 'economy'))
);

-- Oyuncu oturum metrikleri
CREATE TABLE IF NOT EXISTS public.player_session_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    session_id uuid REFERENCES public.game_sessions(id) ON DELETE SET NULL,
    session_start timestamptz NOT NULL,
    session_end timestamptz,
    duration_seconds int,
    events_count int DEFAULT 0,
    actions_count int DEFAULT 0,
    platform text,
    device_info jsonb,
    created_at timestamptz DEFAULT timezone('utc', now())
);

-- Günlük metrikler (aggregated daily metrics)
CREATE TABLE IF NOT EXISTS public.daily_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date date NOT NULL,
    metric_type text NOT NULL,
    metric_key text,
    metric_value decimal(15,2),
    metadata jsonb,
    created_at timestamptz DEFAULT timezone('utc', now()),
    UNIQUE(metric_date, metric_type, metric_key)
);

-- Funnel analizi
CREATE TABLE IF NOT EXISTS public.funnel_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    funnel_name text NOT NULL,
    step_name text NOT NULL,
    step_order int NOT NULL,
    completed boolean DEFAULT false,
    metadata jsonb,
    timestamp timestamptz DEFAULT timezone('utc', now())
);

-- ============================================================================
-- 3. AI TABANLI ÖZELLİKLER
-- ============================================================================

-- Hile tespiti olayları (cheat detection)
CREATE TABLE IF NOT EXISTS public.cheat_detection_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    session_id uuid REFERENCES public.game_sessions(id) ON DELETE SET NULL,
    detection_type text NOT NULL, -- behavior, statistical, pattern, reported
    severity text NOT NULL, -- low, medium, high, critical
    confidence_score decimal(5,2) NOT NULL,
    evidence jsonb NOT NULL,
    status text DEFAULT 'pending', -- pending, reviewed, confirmed, false_positive
    reviewed_by uuid REFERENCES public.users(id),
    reviewed_at timestamptz,
    action_taken text,
    notes text,
    created_at timestamptz DEFAULT timezone('utc', now()),
    CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT valid_detection_status CHECK (status IN ('pending', 'reviewed', 'confirmed', 'false_positive'))
);

-- Oyuncu güven skoru (player trust score)
CREATE TABLE IF NOT EXISTS public.player_trust_scores (
    user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    trust_score decimal(5,2) DEFAULT 100.0,
    flags_count int DEFAULT 0,
    confirmed_violations int DEFAULT 0,
    false_positives int DEFAULT 0,
    last_incident_at timestamptz,
    status text DEFAULT 'good_standing', -- good_standing, flagged, restricted, banned
    restricted_until timestamptz,
    ban_reason text,
    updated_at timestamptz DEFAULT timezone('utc', now()),
    CONSTRAINT valid_trust_status CHECK (status IN ('good_standing', 'flagged', 'restricted', 'banned'))
);

-- Oyuncu beceri profili (adaptive difficulty)
CREATE TABLE IF NOT EXISTS public.player_skill_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    current_difficulty text DEFAULT 'medium',
    suggested_difficulty text,
    performance_metrics jsonb,
    learning_curve jsonb,
    preferences jsonb,
    last_adjusted_at timestamptz,
    created_at timestamptz DEFAULT timezone('utc', now()),
    updated_at timestamptz DEFAULT timezone('utc', now()),
    UNIQUE(user_id, game_id)
);

-- Zorluk ayarlama geçmişi
CREATE TABLE IF NOT EXISTS public.difficulty_adjustments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    from_difficulty text,
    to_difficulty text,
    reason text,
    auto_adjusted boolean DEFAULT true,
    performance_data jsonb,
    created_at timestamptz DEFAULT timezone('utc', now())
);

-- Moderasyon kuyruğu (moderation queue)
CREATE TABLE IF NOT EXISTS public.moderation_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type text NOT NULL, -- username, room_name, chat, profile_image
    content_id uuid,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    content text,
    content_url text,
    ai_score decimal(5,2),
    ai_flags jsonb,
    status text DEFAULT 'pending', -- pending, approved, rejected, escalated
    reviewed_by uuid REFERENCES public.users(id),
    reviewed_at timestamptz,
    action_taken text,
    reviewer_notes text,
    created_at timestamptz DEFAULT timezone('utc', now()),
    CONSTRAINT valid_content_type CHECK (content_type IN ('username', 'room_name', 'chat', 'profile_image')),
    CONSTRAINT valid_moderation_status CHECK (status IN ('pending', 'approved', 'rejected', 'escalated'))
);

-- Moderasyon kuralları
CREATE TABLE IF NOT EXISTS public.moderation_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_type text NOT NULL,
    rule_name text NOT NULL,
    rule_pattern text,
    severity text,
    auto_action text, -- none, flag, block, warn, ban
    is_active boolean DEFAULT true,
    priority int DEFAULT 0,
    metadata jsonb,
    created_at timestamptz DEFAULT timezone('utc', now()),
    updated_at timestamptz DEFAULT timezone('utc', now())
);

-- ============================================================================
-- 4. SOSYAL ÖZELLİKLER
-- ============================================================================

-- Arkadaşlıklar (friendships)
CREATE TABLE IF NOT EXISTS public.friendships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    friend_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status text DEFAULT 'pending', -- pending, accepted, blocked
    requested_at timestamptz DEFAULT timezone('utc', now()),
    accepted_at timestamptz,
    blocked_at timestamptz,
    UNIQUE(user_id, friend_id),
    CONSTRAINT no_self_friendship CHECK (user_id != friend_id),
    CONSTRAINT valid_friendship_status CHECK (status IN ('pending', 'accepted', 'blocked'))
);

-- Parti/Grup sistemi
CREATE TABLE IF NOT EXISTS public.parties (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    leader_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name text,
    max_size int DEFAULT 4,
    is_public boolean DEFAULT false,
    status text DEFAULT 'active', -- active, in_game, disbanded
    voice_channel_id text,
    created_at timestamptz DEFAULT timezone('utc', now()),
    disbanded_at timestamptz,
    CONSTRAINT valid_party_status CHECK (status IN ('active', 'in_game', 'disbanded'))
);

-- Parti üyeleri
CREATE TABLE IF NOT EXISTS public.party_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    party_id uuid NOT NULL REFERENCES public.parties(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    is_ready boolean DEFAULT false,
    joined_at timestamptz DEFAULT timezone('utc', now()),
    left_at timestamptz,
    UNIQUE(party_id, user_id)
);

-- Bildirimler (notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    notification_type text NOT NULL,
    title text NOT NULL,
    message text,
    data jsonb,
    is_read boolean DEFAULT false,
    read_at timestamptz,
    expires_at timestamptz,
    created_at timestamptz DEFAULT timezone('utc', now())
);

-- Oyun davetleri
CREATE TABLE IF NOT EXISTS public.game_invitations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id uuid NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    from_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    to_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status text DEFAULT 'pending', -- pending, accepted, declined, expired
    message text,
    expires_at timestamptz,
    responded_at timestamptz,
    created_at timestamptz DEFAULT timezone('utc', now()),
    CONSTRAINT valid_invitation_status CHECK (status IN ('pending', 'accepted', 'declined', 'expired'))
);

-- ============================================================================
-- 5. TURNUVA VE REKABET
-- ============================================================================

-- Turnuvalar
CREATE TABLE IF NOT EXISTS public.tournaments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    tournament_type text NOT NULL, -- single_elimination, double_elimination, round_robin, swiss
    max_participants int,
    current_participants int DEFAULT 0,
    entry_fee int DEFAULT 0,
    prize_pool jsonb,
    status text DEFAULT 'registration', -- registration, in_progress, completed, cancelled
    start_time timestamptz,
    end_time timestamptz,
    registration_deadline timestamptz,
    rules jsonb,
    settings jsonb,
    created_by uuid REFERENCES public.users(id),
    created_at timestamptz DEFAULT timezone('utc', now()),
    CONSTRAINT valid_tournament_status CHECK (status IN ('registration', 'in_progress', 'completed', 'cancelled'))
);

-- Turnuva katılımcıları
CREATE TABLE IF NOT EXISTS public.tournament_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    seed int,
    current_round int DEFAULT 0,
    elimination_round int,
    status text DEFAULT 'active', -- active, eliminated, withdrawn, winner
    points int DEFAULT 0,
    registered_at timestamptz DEFAULT timezone('utc', now()),
    UNIQUE(tournament_id, user_id),
    CONSTRAINT valid_participant_status CHECK (status IN ('active', 'eliminated', 'withdrawn', 'winner'))
);

-- Turnuva maçları
CREATE TABLE IF NOT EXISTS public.tournament_matches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    session_id uuid REFERENCES public.game_sessions(id) ON DELETE SET NULL,
    round int NOT NULL,
    match_order int NOT NULL,
    participant1_id uuid REFERENCES public.tournament_participants(id) ON DELETE SET NULL,
    participant2_id uuid REFERENCES public.tournament_participants(id) ON DELETE SET NULL,
    winner_id uuid REFERENCES public.tournament_participants(id),
    status text DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    scheduled_at timestamptz,
    started_at timestamptz,
    completed_at timestamptz,
    CONSTRAINT valid_match_status CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled'))
);

-- Sezonlar
CREATE TABLE IF NOT EXISTS public.seasons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    season_number int NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status text DEFAULT 'upcoming', -- upcoming, active, completed
    rewards jsonb,
    settings jsonb,
    created_at timestamptz DEFAULT timezone('utc', now()),
    CONSTRAINT valid_season_status CHECK (status IN ('upcoming', 'active', 'completed'))
);

-- Sezon sıralamaları
CREATE TABLE IF NOT EXISTS public.season_rankings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    season_id uuid NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    game_id uuid REFERENCES public.games(id) ON DELETE CASCADE,
    points int DEFAULT 0,
    rank int,
    tier text, -- bronze, silver, gold, platinum, diamond, master
    division int,
    peak_rank int,
    peak_tier text,
    games_played int DEFAULT 0,
    updated_at timestamptz DEFAULT timezone('utc', now()),
    UNIQUE(season_id, user_id, game_id)
);

-- ============================================================================
-- 6. SİSTEM VE MONİTORİNG
-- ============================================================================

-- Rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    ip_address inet,
    endpoint text NOT NULL,
    request_count int DEFAULT 1,
    window_start timestamptz DEFAULT timezone('utc', now()),
    window_end timestamptz,
    blocked_until timestamptz
);

-- Sistem sağlık metrikleri
CREATE TABLE IF NOT EXISTS public.system_health_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name text NOT NULL,
    metric_value decimal(15,2),
    metric_unit text,
    component text,
    severity text,
    metadata jsonb,
    timestamp timestamptz DEFAULT timezone('utc', now())
);

-- Hata logları
CREATE TABLE IF NOT EXISTS public.error_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    error_type text NOT NULL,
    error_message text,
    stack_trace text,
    user_id uuid REFERENCES public.users(id),
    session_id uuid REFERENCES public.game_sessions(id),
    request_id text,
    endpoint text,
    severity text, -- low, medium, high, critical
    metadata jsonb,
    created_at timestamptz DEFAULT timezone('utc', now())
);

-- ============================================================================
-- İNDEKSLER (Performance Optimization)
-- ============================================================================

-- Matchmaking indeksleri
CREATE INDEX IF NOT EXISTS idx_matchmaking_queue_active
    ON public.matchmaking_queue(game_id, status, mmr)
    WHERE status = 'waiting';

CREATE INDEX IF NOT EXISTS idx_player_ratings_lookup
    ON public.player_ratings(user_id, game_id);

CREATE INDEX IF NOT EXISTS idx_player_ratings_mmr
    ON public.player_ratings(game_id, mmr DESC);

-- Analytics indeksleri
CREATE INDEX IF NOT EXISTS idx_telemetry_events_time
    ON public.telemetry_events(server_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_telemetry_events_user
    ON public.telemetry_events(user_id, server_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_telemetry_events_category
    ON public.telemetry_events(event_category, server_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_session_metrics_user
    ON public.player_session_metrics(user_id, session_start DESC);

CREATE INDEX IF NOT EXISTS idx_daily_metrics_lookup
    ON public.daily_metrics(metric_date DESC, metric_type);

-- Social indeksleri
CREATE INDEX IF NOT EXISTS idx_friendships_user
    ON public.friendships(user_id, status);

CREATE INDEX IF NOT EXISTS idx_friendships_friend
    ON public.friendships(friend_id, status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
    ON public.notifications(user_id, is_read, created_at DESC)
    WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_party_members_user
    ON public.party_members(user_id, party_id)
    WHERE left_at IS NULL;

-- Tournament indeksleri
CREATE INDEX IF NOT EXISTS idx_tournaments_status
    ON public.tournaments(status, start_time);

CREATE INDEX IF NOT EXISTS idx_tournament_participants
    ON public.tournament_participants(tournament_id, status);

CREATE INDEX IF NOT EXISTS idx_season_rankings
    ON public.season_rankings(season_id, game_id, rank);

-- Security indeksleri
CREATE INDEX IF NOT EXISTS idx_cheat_detection_user
    ON public.cheat_detection_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_trust_scores_status
    ON public.player_trust_scores(status, trust_score);

CREATE INDEX IF NOT EXISTS idx_moderation_queue_pending
    ON public.moderation_queue(status, created_at)
    WHERE status = 'pending';

-- System indeksleri
CREATE INDEX IF NOT EXISTS idx_error_logs_time
    ON public.error_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_error_logs_severity
    ON public.error_logs(severity, created_at DESC)
    WHERE severity IN ('high', 'critical');

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE public.player_ratings IS 'Oyuncu beceri puanları ve MMR takibi';
COMMENT ON TABLE public.matchmaking_queue IS 'Aktif matchmaking kuyruğu';
COMMENT ON TABLE public.telemetry_events IS 'Oyuncu davranış ve event telemetrisi';
COMMENT ON TABLE public.cheat_detection_events IS 'Hile tespit olayları ve incelemeleri';
COMMENT ON TABLE public.player_trust_scores IS 'Oyuncu güven skorları ve hesap durumu';
COMMENT ON TABLE public.friendships IS 'Oyuncu arkadaşlık ilişkileri';
COMMENT ON TABLE public.tournaments IS 'Turnuva tanımları';
COMMENT ON TABLE public.seasons IS 'Sezonluk lig bilgileri';
