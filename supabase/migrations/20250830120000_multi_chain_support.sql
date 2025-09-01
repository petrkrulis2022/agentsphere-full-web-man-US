-- Multi-Chain Support Migration for AgentSphere
-- Adds support for deploying agents across multiple blockchain networks

-- Add multi-chain deployment columns to deployed_objects table
ALTER TABLE public.deployed_objects 
ADD COLUMN IF NOT EXISTS deployment_network JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS network_config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cross_chain_config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS supported_networks JSONB DEFAULT '[]';

-- Create indexes for better query performance on new JSONB columns
CREATE INDEX IF NOT EXISTS idx_deployed_objects_deployment_network 
ON public.deployed_objects USING GIN (deployment_network);

CREATE INDEX IF NOT EXISTS idx_deployed_objects_network_config 
ON public.deployed_objects USING GIN (network_config);

CREATE INDEX IF NOT EXISTS idx_deployed_objects_supported_networks 
ON public.deployed_objects USING GIN (supported_networks);

-- Add comments for documentation
COMMENT ON COLUMN public.deployed_objects.deployment_network IS 'Primary and additional network deployment information including transaction hashes and agent IDs';
COMMENT ON COLUMN public.deployed_objects.network_config IS 'Network-specific payment and configuration settings for each deployed network';
COMMENT ON COLUMN public.deployed_objects.cross_chain_config IS 'Cross-chain interoperability settings and bridge configurations';
COMMENT ON COLUMN public.deployed_objects.supported_networks IS 'Array of chain IDs where this agent is deployed and accessible';

-- Create function to validate multi-chain deployment structure
CREATE OR REPLACE FUNCTION validate_multi_chain_deployment(deployment JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if primary network exists
    IF NOT (deployment ? 'primary') THEN
        RETURN FALSE;
    END IF;
    
    -- Validate primary network structure
    IF NOT (
        deployment->'primary' ? 'chainId' AND
        deployment->'primary' ? 'name' AND
        deployment->'primary' ? 'type'
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- If additional networks exist, validate their structure
    IF deployment ? 'additional' THEN
        IF jsonb_typeof(deployment->'additional') != 'array' THEN
            RETURN FALSE;
        END IF;
        
        -- Validate each additional network
        FOR i IN 0..jsonb_array_length(deployment->'additional')-1 LOOP
            IF NOT (
                deployment->'additional'->i ? 'chainId' AND
                deployment->'additional'->i ? 'name' AND
                deployment->'additional'->i ? 'type'
            ) THEN
                RETURN FALSE;
            END IF;
        END LOOP;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to validate network payment configuration
CREATE OR REPLACE FUNCTION validate_network_payments(config JSONB)
RETURNS BOOLEAN AS $$
DECLARE
    network_key TEXT;
    network_config JSONB;
BEGIN
    -- Iterate through each network configuration
    FOR network_key IN SELECT jsonb_object_keys(config) LOOP
        network_config := config->network_key;
        
        -- Check required fields
        IF NOT (
            network_config ? 'enabled' AND
            network_config ? 'preferredToken' AND
            network_config ? 'walletAddress'
        ) THEN
            RETURN FALSE;
        END IF;
        
        -- Validate wallet address format (basic check)
        IF length(network_config->>'walletAddress') < 10 THEN
            RETURN FALSE;
        END IF;
    END LOOP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add constraints to ensure valid multi-chain data
ALTER TABLE public.deployed_objects 
ADD CONSTRAINT check_deployment_network_valid 
CHECK (
    deployment_network = '{}'::jsonb OR 
    validate_multi_chain_deployment(deployment_network)
);

ALTER TABLE public.deployed_objects 
ADD CONSTRAINT check_network_config_valid 
CHECK (
    network_config = '{}'::jsonb OR 
    validate_network_payments(network_config)
);

-- Create function to get agents by network
CREATE OR REPLACE FUNCTION get_agents_by_network(target_chain_id INTEGER)
RETURNS TABLE(
    id UUID,
    name TEXT,
    description TEXT,
    location JSONB,
    agent_type TEXT,
    primary_network JSONB,
    network_deployment JSONB,
    interaction_fee_usdfc NUMERIC,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        do.id,
        do.name,
        do.description,
        do.location,
        do.agent_type,
        deployment_network->'primary' as primary_network,
        CASE 
            WHEN (deployment_network->'primary'->>'chainId')::integer = target_chain_id 
            THEN deployment_network->'primary'
            ELSE (
                SELECT network_deployment
                FROM jsonb_array_elements(deployment_network->'additional') AS network_deployment
                WHERE (network_deployment->>'chainId')::integer = target_chain_id
                LIMIT 1
            )
        END as network_deployment,
        do.interaction_fee_usdfc,
        do.created_at
    FROM public.deployed_objects do
    WHERE 
        supported_networks ? target_chain_id::text OR
        (deployment_network->'primary'->>'chainId')::integer = target_chain_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get cross-chain agent statistics
CREATE OR REPLACE FUNCTION get_cross_chain_stats()
RETURNS TABLE(
    network_name TEXT,
    chain_id INTEGER,
    total_agents BIGINT,
    primary_deployments BIGINT,
    secondary_deployments BIGINT,
    avg_interaction_fee NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH network_stats AS (
        -- Primary deployments
        SELECT 
            deployment_network->'primary'->>'name' as network_name,
            (deployment_network->'primary'->>'chainId')::integer as chain_id,
            COUNT(*) as primary_count,
            0::bigint as secondary_count,
            AVG(interaction_fee_usdfc) as avg_fee
        FROM public.deployed_objects
        WHERE deployment_network ? 'primary'
        GROUP BY 
            deployment_network->'primary'->>'name',
            (deployment_network->'primary'->>'chainId')::integer
        
        UNION ALL
        
        -- Secondary deployments
        SELECT 
            additional_network->>'name' as network_name,
            (additional_network->>'chainId')::integer as chain_id,
            0::bigint as primary_count,
            COUNT(*) as secondary_count,
            AVG(interaction_fee_usdfc) as avg_fee
        FROM public.deployed_objects,
             jsonb_array_elements(deployment_network->'additional') as additional_network
        WHERE deployment_network ? 'additional'
        GROUP BY 
            additional_network->>'name',
            (additional_network->>'chainId')::integer
    )
    SELECT 
        ns.network_name,
        ns.chain_id,
        SUM(ns.primary_count + ns.secondary_count) as total_agents,
        SUM(ns.primary_count) as primary_deployments,
        SUM(ns.secondary_count) as secondary_deployments,
        AVG(ns.avg_fee) as avg_interaction_fee
    FROM network_stats ns
    WHERE ns.network_name IS NOT NULL
    GROUP BY ns.network_name, ns.chain_id
    ORDER BY total_agents DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to validate cross-chain bridge configurations
CREATE OR REPLACE FUNCTION validate_bridge_config(config JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Basic validation for bridge configuration
    IF config = '{}'::jsonb THEN
        RETURN TRUE; -- Empty config is valid
    END IF;
    
    -- Check for required bridge fields if config is not empty
    IF config ? 'enabled' AND (config->>'enabled')::boolean = true THEN
        IF NOT (
            config ? 'bridge_protocol' AND
            config ? 'source_networks' AND
            config ? 'target_networks'
        ) THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add constraint for cross-chain configuration
ALTER TABLE public.deployed_objects 
ADD CONSTRAINT check_cross_chain_config_valid 
CHECK (
    cross_chain_config = '{}'::jsonb OR 
    validate_bridge_config(cross_chain_config)
);

-- Update existing single-chain deployments to multi-chain format
UPDATE public.deployed_objects 
SET 
    deployment_network = jsonb_build_object(
        'primary', jsonb_build_object(
            'chainId', COALESCE(chain_id, 296),
            'name', CASE 
                WHEN COALESCE(chain_id, 296) = 296 THEN 'Hedera Testnet'
                WHEN COALESCE(chain_id, 296) = 11155111 THEN 'Ethereum Sepolia'
                WHEN COALESCE(chain_id, 296) = 421614 THEN 'Arbitrum Sepolia'
                WHEN COALESCE(chain_id, 296) = 84532 THEN 'Base Sepolia'
                WHEN COALESCE(chain_id, 296) = 11155420 THEN 'OP Sepolia'
                WHEN COALESCE(chain_id, 296) = 43113 THEN 'Avalanche Fuji'
                ELSE 'Unknown Network'
            END,
            'type', CASE 
                WHEN COALESCE(chain_id, 296) = 296 THEN 'hedera'
                ELSE 'evm'
            END,
            'wallet_address', COALESCE(deployer_wallet_address, agent_wallet_address, ''),
            'deployment_timestamp', created_at
        ),
        'additional', '[]'::jsonb,
        'cross_chain_enabled', false
    ),
    supported_networks = jsonb_build_array(COALESCE(chain_id, 296)::text),
    network_config = jsonb_build_object(
        COALESCE(chain_id, 296)::text, jsonb_build_object(
            'enabled', true,
            'preferredToken', COALESCE(currency_type, 'HBAR'),
            'walletAddress', COALESCE(deployer_wallet_address, agent_wallet_address, ''),
            'usdcAddress', CASE 
                WHEN COALESCE(chain_id, 296) = 11155111 THEN '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
                WHEN COALESCE(chain_id, 296) = 421614 THEN '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d'
                WHEN COALESCE(chain_id, 296) = 84532 THEN '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
                WHEN COALESCE(chain_id, 296) = 11155420 THEN '0x5fd84259d3c8b37a387c0d8a4c5b0c0d7d3c0D7'
                WHEN COALESCE(chain_id, 296) = 43113 THEN '0x5425890298aed601595a70AB815c96711a31Bc65'
                ELSE NULL
            END
        )
    )
WHERE deployment_network = '{}' OR deployment_network IS NULL;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION validate_multi_chain_deployment(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_network_payments(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_bridge_config(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_agents_by_network(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_cross_chain_stats() TO authenticated;

-- Create view for easy multi-chain agent querying
CREATE OR REPLACE VIEW multi_chain_agents AS
SELECT 
    id,
    name,
    description,
    location,
    agent_type,
    deployment_network->'primary'->>'name' as primary_network_name,
    (deployment_network->'primary'->>'chainId')::integer as primary_chain_id,
    jsonb_array_length(COALESCE(deployment_network->'additional', '[]'::jsonb)) as additional_networks_count,
    (deployment_network->>'cross_chain_enabled')::boolean as cross_chain_enabled,
    supported_networks,
    interaction_fee_usdfc,
    payment_methods,
    created_at,
    updated_at
FROM public.deployed_objects
WHERE deployment_network IS NOT NULL AND deployment_network != '{}';

-- Grant access to the view
GRANT SELECT ON multi_chain_agents TO authenticated;

-- Create indexes for the new view
CREATE INDEX IF NOT EXISTS idx_multi_chain_agents_primary_chain 
ON public.deployed_objects ((deployment_network->'primary'->>'chainId'));

CREATE INDEX IF NOT EXISTS idx_multi_chain_agents_cross_chain 
ON public.deployed_objects (((deployment_network->>'cross_chain_enabled')::boolean));

-- Success message
SELECT 'Multi-chain support migration completed successfully!' as status;
