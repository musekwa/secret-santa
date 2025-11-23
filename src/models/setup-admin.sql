-- Add is_admin column to participants table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'participants' 
        AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE public.participants 
        ADD COLUMN is_admin boolean NOT NULL DEFAULT false;
    END IF;
END $$;

-- Generate a unique 6-digit OTP for admin
-- This OTP will be used repeatedly and expires in 1 year
DO $$
DECLARE
    admin_otp text;
    admin_id uuid;
    expires_at text;
    otp_exists boolean;
BEGIN
    -- Generate a unique 6-digit OTP
    LOOP
        admin_otp := LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
        SELECT EXISTS(SELECT 1 FROM public.verifications WHERE otp = admin_otp) INTO otp_exists;
        EXIT WHEN NOT otp_exists;
    END LOOP;

    -- Calculate expiration date (1 year from now)
    expires_at := (CURRENT_TIMESTAMP + INTERVAL '1 year')::text;

    -- Insert or update admin participant
    INSERT INTO public.participants (name, email, amount, code, is_verified, is_admin)
    VALUES (
        'Musekwa Evariste',
        'musekwa2011@gmail.com',
        '1000',
        '00000000', -- Admin code (8 digits)
        true,
        true
    )
    ON CONFLICT (email) 
    DO UPDATE SET
        name = EXCLUDED.name,
        is_admin = true,
        is_verified = true;

    -- Get the admin participant ID
    SELECT id INTO admin_id 
    FROM public.participants 
    WHERE email = 'musekwa2011@gmail.com';

    -- Delete any existing verification records for admin
    DELETE FROM public.verifications 
    WHERE participant_id = admin_id;

    -- Insert new verification record with 1-year expiration
    INSERT INTO public.verifications (otp, expires_at, participant_id)
    VALUES (admin_otp, expires_at, admin_id);

    -- Output the OTP for reference
    RAISE NOTICE 'Admin OTP created: %', admin_otp;
    RAISE NOTICE 'Admin OTP expires at: %', expires_at;
END $$;

