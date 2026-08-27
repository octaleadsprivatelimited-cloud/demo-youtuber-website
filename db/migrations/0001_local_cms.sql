CREATE TABLE IF NOT EXISTS local_cms_collections (
  name TEXT PRIMARY KEY,
  records TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1
);
