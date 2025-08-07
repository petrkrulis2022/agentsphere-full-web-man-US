-- Add missing mcp_services column to deployed_objects table
-- This column stores the MCP Server Integration selections as JSON

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'mcp_services'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN mcp_services JSONB;
    
    -- Add comment for the new column
    COMMENT ON COLUMN deployed_objects.mcp_services IS 'JSON array of selected MCP server integration services';
    
    -- Add index for efficient JSON queries
    CREATE INDEX IF NOT EXISTS idx_deployed_objects_mcp_services 
    ON deployed_objects USING GIN (mcp_services) 
    WHERE mcp_services IS NOT NULL;
    
    RAISE NOTICE 'Added mcp_services column to deployed_objects table';
  ELSE
    RAISE NOTICE 'mcp_services column already exists';
  END IF;
END $$;
