-- Recreate index around type change to avoid duplicate-name conflicts.
DROP INDEX IF EXISTS "MenuItem_category_isActive_idx";

-- Safely cast enum values to text while preserving existing rows.
ALTER TABLE "MenuItem"
ALTER COLUMN "category" TYPE TEXT USING "category"::text;

-- Enum is no longer used after converting MenuItem.category to text.
DROP TYPE IF EXISTS "MenuCategory";

CREATE INDEX "MenuItem_category_isActive_idx" ON "MenuItem"("category", "isActive");
