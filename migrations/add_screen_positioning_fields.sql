-- Migration: Add Screen Percentage Positioning Support
-- Date: February 5, 2026
-- Purpose: Enable agents to be positioned at fixed screen locations (x,y%) in addition to GPS coordinates

-- Clear existing test data (no users yet)
DELETE FROM deployed_objects;

-- Add screen positioning columns
ALTER TABLE deployed_objects 
ADD COLUMN IF NOT EXISTS screen_position_x double precision,
ADD COLUMN IF NOT EXISTS screen_position_y double precision,
ADD COLUMN IF NOT EXISTS positioning_mode varchar(20) DEFAULT 'gps';

-- Add check constraint for positioning mode
ALTER TABLE deployed_objects
DROP CONSTRAINT IF EXISTS check_positioning_mode;

ALTER TABLE deployed_objects
ADD CONSTRAINT check_positioning_mode 
CHECK (positioning_mode IN ('gps', 'screen'));

-- Add check constraint for screen position ranges (0-100%)
ALTER TABLE deployed_objects
DROP CONSTRAINT IF EXISTS check_screen_position_x_range;

ALTER TABLE deployed_objects
ADD CONSTRAINT check_screen_position_x_range 
CHECK (screen_position_x IS NULL OR (screen_position_x >= 0 AND screen_position_x <= 100));

ALTER TABLE deployed_objects
DROP CONSTRAINT IF EXISTS check_screen_position_y_range;

ALTER TABLE deployed_objects
ADD CONSTRAINT check_screen_position_y_range 
CHECK (screen_position_y IS NULL OR (screen_position_y >= 0 AND screen_position_y <= 100));

-- Add index for screen-positioned queries
CREATE INDEX IF NOT EXISTS idx_deployed_objects_screen_mode 
ON deployed_objects (positioning_mode) 
WHERE positioning_mode = 'screen';

-- Add composite index for screen coordinates
CREATE INDEX IF NOT EXISTS idx_deployed_objects_screen_coords 
ON deployed_objects (screen_position_x, screen_position_y)
WHERE positioning_mode = 'screen';

-- Add comment to columns
COMMENT ON COLUMN deployed_objects.screen_position_x IS 'Screen X position as percentage (0-100%). 0=left edge, 50=center, 100=right edge';
COMMENT ON COLUMN deployed_objects.screen_position_y IS 'Screen Y position as percentage (0-100%). 0=top edge, 50=center, 100=bottom edge';
COMMENT ON COLUMN deployed_objects.positioning_mode IS 'Positioning system: gps (world coordinates) or screen (viewport percentage)';

-- Update updated_at trigger to include new columns
DROP TRIGGER IF EXISTS update_deployed_objects_updated_at ON deployed_objects;

CREATE OR REPLACE FUNCTION update_deployed_objects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_deployed_objects_updated_at
    BEFORE UPDATE ON deployed_objects
    FOR EACH ROW
    WHEN (
        OLD.screen_position_x IS DISTINCT FROM NEW.screen_position_x OR
        OLD.screen_position_y IS DISTINCT FROM NEW.screen_position_y OR
        OLD.positioning_mode IS DISTINCT FROM NEW.positioning_mode OR
        OLD.* IS DISTINCT FROM NEW.*
    )
    EXECUTE FUNCTION update_deployed_objects_updated_at();

-- Verify migration
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'deployed_objects'
    AND column_name IN ('screen_position_x', 'screen_position_y', 'positioning_mode')
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Screen positioning migration completed successfully';
    RAISE NOTICE '📊 Columns added: screen_position_x, screen_position_y, positioning_mode';
    RAISE NOTICE '🔒 Constraints: positioning_mode check, screen position range checks';
    RAISE NOTICE '📈 Indexes: screen_mode index, screen_coords composite index';
END $$;
