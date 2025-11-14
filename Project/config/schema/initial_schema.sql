-- AheryusGameBOX - Başlangıç Şema Taslağı
-- Bu dosya Supabase/PostgreSQL üzerinde çalıştırılmak üzere hazırlanmıştır.
-- RLS politikaları ve tetikleyiciler sonraki fazlarda eklenecektir.

CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    display_name text NOT NULL,
    avatar_url text,
    language_pref text DEFAULT 'tr-TR',
    role text DEFAULT 'player',
    created_at timestamptz DEFAULT timezone('utc', now()),
    last_login_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.games (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text UNIQUE NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    min_players int NOT NULL,
    max_players int NOT NULL,
    is_active boolean DEFAULT true,
    config jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.game_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id uuid NOT NULL REFERENCES public.games(id),
    host_user_id uuid NOT NULL REFERENCES public.users(id),
    status text NOT NULL DEFAULT 'pending',
    settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT timezone('utc', now()),
    started_at timestamptz,
    finished_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.session_players (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id uuid NOT NULL REFERENCES public.game_sessions(id),
    user_id uuid NOT NULL REFERENCES public.users(id),
    seat_order int,
    team text,
    join_time timestamptz DEFAULT timezone('utc', now()),
    leave_time timestamptz
);

CREATE TABLE IF NOT EXISTS public.moves (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id uuid NOT NULL REFERENCES public.game_sessions(id),
    player_id uuid NOT NULL REFERENCES public.session_players(id),
    move_number int NOT NULL,
    move_type text,
    payload jsonb NOT NULL,
    created_at timestamptz DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.user_stats (
    user_id uuid PRIMARY KEY REFERENCES public.users(id),
    total_xp int DEFAULT 0,
    coins int DEFAULT 0,
    level int DEFAULT 1,
    wins int DEFAULT 0,
    losses int DEFAULT 0,
    draws int DEFAULT 0,
    last_reset_at timestamptz DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.achievements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text UNIQUE NOT NULL,
    name text NOT NULL,
    description text,
    icon_url text,
    created_at timestamptz DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
    user_id uuid REFERENCES public.users(id),
    achievement_id uuid REFERENCES public.achievements(id),
    unlocked_at timestamptz DEFAULT timezone('utc', now()),
    PRIMARY KEY (user_id, achievement_id)
);

-- Oyunların özgün durumları için genel amaçlı tablo
CREATE TABLE IF NOT EXISTS public.session_state (
    session_id uuid PRIMARY KEY REFERENCES public.game_sessions(id),
    state jsonb NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc', now())
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON public.game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_session_players_session ON public.session_players(session_id);
CREATE INDEX IF NOT EXISTS idx_moves_session_move_number ON public.moves(session_id, move_number);
