/*
  # Add MCP Services Column

  1. New Column
    - `mcp_services` (JSONB) - Stores selected MCP server integration services as JSON array

  2. Indexes
    - GIN index for efficient JSON queries on mcp_services column

  3. Comments
    - Documentation for the new column purpose
*/

-- Add mcp_services column to store MCP server integration selections
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployed_objects' AND column_name = 'mcp_services'
  ) THEN
    ALTER TABLE deployed_objects ADD COLUMN mcp_services JSONB;
    
    -- Add comment for the new column
    COMMENT ON COLUMN deployed_objects.mcp_services IS 'JSON array of selected MCP server integration services (e.g., ["Chat", "Voice", "Analysis"])';
    
    -- Add GIN index for efficient JSON queries
    CREATE INDEX IF NOT EXISTS idx_deployed_objects_mcp_services 
    ON deployed_objects USING GIN (mcp_services) 
    WHERE mcp_services IS NOT NULL;
    
  END IF;
END $$;
