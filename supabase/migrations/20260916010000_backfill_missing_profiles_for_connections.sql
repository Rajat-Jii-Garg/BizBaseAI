-- Backfill profile rows for existing auth users that do not have
-- a public profile row.
--
-- This prevents accepted connections from disappearing from
-- the My Connections UI when an old Auth user has no profiles row.
WITH missing_profiles AS (
    SELECT u.id,
        u.email,
        NULLIF(
            u.raw_user_meta_data->>'full_name',
            ''
        ) AS full_name,
        NULLIF(
            u.raw_user_meta_data->>'phone',
            ''
        ) AS phone,
        NULLIF(
            u.raw_user_meta_data->>'username',
            ''
        ) AS candidate_username,
        (u.email_confirmed_at IS NOT NULL) AS email_verified
    FROM auth.users AS u
        LEFT JOIN public.profiles AS p ON p.id = u.id
    WHERE p.id IS NULL
),
prepared_profiles AS (
    SELECT mp.*,
        CASE
            WHEN mp.candidate_username IS NULL THEN NULL
            WHEN ROW_NUMBER() OVER (
                PARTITION BY LOWER(mp.candidate_username)
                ORDER BY mp.id
            ) > 1 THEN NULL
            WHEN EXISTS (
                SELECT 1
                FROM public.profiles AS existing_profile
                WHERE LOWER(existing_profile.username) = LOWER(mp.candidate_username)
            ) THEN NULL
            ELSE mp.candidate_username
        END AS safe_username
    FROM missing_profiles AS mp
)
INSERT INTO public.profiles (
        id,
        email,
        full_name,
        phone,
        username,
        email_verified
    )
SELECT id,
    email,
    full_name,
    phone,
    safe_username,
    email_verified
FROM prepared_profiles ON CONFLICT (id) DO NOTHING;
-- Keep the signup trigger safe for future users.
-- If a username already exists, create the profile without
-- the username instead of failing the signup trigger.
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
DECLARE v_username TEXT;
BEGIN v_username := NULLIF(
    NEW.raw_user_meta_data->>'username',
    ''
);
IF v_username IS NOT NULL
AND EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE LOWER(username) = LOWER(v_username)
) THEN v_username := NULL;
END IF;
BEGIN
INSERT INTO public.profiles (
        id,
        email,
        full_name,
        phone,
        username,
        email_verified
    )
VALUES (
        NEW.id,
        NEW.email,
        NULLIF(
            NEW.raw_user_meta_data->>'full_name',
            ''
        ),
        NULLIF(
            NEW.raw_user_meta_data->>'phone',
            ''
        ),
        v_username,
        (
            NEW.email_confirmed_at IS NOT NULL
        )
    ) ON CONFLICT (id) DO NOTHING;
EXCEPTION
WHEN unique_violation THEN
INSERT INTO public.profiles (
        id,
        email,
        full_name,
        phone,
        username,
        email_verified
    )
VALUES (
        NEW.id,
        NEW.email,
        NULLIF(
            NEW.raw_user_meta_data->>'full_name',
            ''
        ),
        NULLIF(
            NEW.raw_user_meta_data->>'phone',
            ''
        ),
        NULL,
        (
            NEW.email_confirmed_at IS NOT NULL
        )
    ) ON CONFLICT (id) DO NOTHING;
END;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;