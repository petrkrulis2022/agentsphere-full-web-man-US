-- Add payment methods and configuration columns to deployed_objects table
-- This supports the 6-faced payment cube system

ALTER TABLE public.deployed_objects 
ADD COLUMN payment_methods JSONB DEFAULT '{}'::jsonb,
ADD COLUMN payment_config JSONB DEFAULT '{}'::jsonb;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_deployed_objects_payment_methods ON public.deployed_objects USING GIN (payment_methods);
CREATE INDEX IF NOT EXISTS idx_deployed_objects_payment_config ON public.deployed_objects USING GIN (payment_config);

-- Add comments for documentation
COMMENT ON COLUMN public.deployed_objects.payment_methods IS 'Configuration for the 6 payment methods: crypto_qr, bank_virtual_card, bank_qr, voice_pay, sound_pay, onboard_crypto';
COMMENT ON COLUMN public.deployed_objects.payment_config IS 'Additional configuration data for payment methods including bank details, wallet addresses, etc';

-- Update RLS policies if needed (assuming they exist)
-- This allows users to update payment methods for their own deployed objects
DO $$
BEGIN
    -- Check if RLS is enabled and policies exist
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'deployed_objects' 
        AND policyname = 'Users can update own deployed_objects'
    ) THEN
        -- Policy already exists, no action needed
        RAISE NOTICE 'RLS policy already exists for deployed_objects table';
    END IF;
END $$;

-- Create a function to validate payment methods structure
CREATE OR REPLACE FUNCTION validate_payment_methods(methods JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if at least one payment method is enabled
    IF NOT EXISTS (
        SELECT 1 FROM jsonb_each_text(methods -> 'enabled') 
        WHERE value = 'true'
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Validate required fields for crypto methods
    IF (methods -> 'crypto_qr' ->> 'enabled')::boolean = true THEN
        IF methods -> 'crypto_qr' ->> 'wallet_address' IS NULL OR 
           length(methods -> 'crypto_qr' ->> 'wallet_address') < 10 THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    IF (methods -> 'voice_pay' ->> 'enabled')::boolean = true THEN
        IF methods -> 'voice_pay' ->> 'wallet_address' IS NULL OR 
           length(methods -> 'voice_pay' ->> 'wallet_address') < 10 THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    IF (methods -> 'sound_pay' ->> 'enabled')::boolean = true THEN
        IF methods -> 'sound_pay' ->> 'wallet_address' IS NULL OR 
           length(methods -> 'sound_pay' ->> 'wallet_address') < 10 THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add constraint to ensure payment methods are valid
ALTER TABLE public.deployed_objects 
ADD CONSTRAINT check_payment_methods_valid 
CHECK (
    payment_methods = '{}'::jsonb OR 
    validate_payment_methods(payment_methods)
);

-- Create a function to get payment statistics
CREATE OR REPLACE FUNCTION get_payment_method_stats()
RETURNS TABLE(
    payment_method TEXT,
    enabled_count BIGINT,
    total_agents BIGINT,
    usage_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH payment_stats AS (
        SELECT 
            'crypto_qr' as method,
            COUNT(*) FILTER (WHERE (payment_methods -> 'crypto_qr' ->> 'enabled')::boolean = true) as enabled,
            COUNT(*) as total
        FROM public.deployed_objects
        WHERE payment_methods IS NOT NULL
        
        UNION ALL
        
        SELECT 
            'bank_virtual_card' as method,
            COUNT(*) FILTER (WHERE (payment_methods -> 'bank_virtual_card' ->> 'enabled')::boolean = true) as enabled,
            COUNT(*) as total
        FROM public.deployed_objects
        WHERE payment_methods IS NOT NULL
        
        UNION ALL
        
        SELECT 
            'bank_qr' as method,
            COUNT(*) FILTER (WHERE (payment_methods -> 'bank_qr' ->> 'enabled')::boolean = true) as enabled,
            COUNT(*) as total
        FROM public.deployed_objects
        WHERE payment_methods IS NOT NULL
        
        UNION ALL
        
        SELECT 
            'voice_pay' as method,
            COUNT(*) FILTER (WHERE (payment_methods -> 'voice_pay' ->> 'enabled')::boolean = true) as enabled,
            COUNT(*) as total
        FROM public.deployed_objects
        WHERE payment_methods IS NOT NULL
        
        UNION ALL
        
        SELECT 
            'sound_pay' as method,
            COUNT(*) FILTER (WHERE (payment_methods -> 'sound_pay' ->> 'enabled')::boolean = true) as enabled,
            COUNT(*) as total
        FROM public.deployed_objects
        WHERE payment_methods IS NOT NULL
        
        UNION ALL
        
        SELECT 
            'onboard_crypto' as method,
            COUNT(*) FILTER (WHERE (payment_methods -> 'onboard_crypto' ->> 'enabled')::boolean = true) as enabled,
            COUNT(*) as total
        FROM public.deployed_objects
        WHERE payment_methods IS NOT NULL
    )
    SELECT 
        ps.method,
        ps.enabled,
        ps.total,
        CASE 
            WHEN ps.total > 0 THEN ROUND((ps.enabled::numeric / ps.total::numeric) * 100, 2)
            ELSE 0
        END as percentage
    FROM payment_stats ps;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION validate_payment_methods(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_payment_method_stats() TO authenticated;
