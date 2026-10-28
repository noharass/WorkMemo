-- Preserve rule identifiers and the AUTOINCREMENT high-water mark. A site and
-- a path rule may share the same normalized URL while using different modes.
CREATE TABLE work_urls_v8 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url_prefix TEXT NOT NULL CHECK(length(url_prefix)<=2048),
    category TEXT NOT NULL CHECK(category IN ('评测','质检','开发','文档')),
    match_mode TEXT NOT NULL DEFAULT 'path_prefix'
        CHECK(match_mode IN ('path_prefix','origin','domain_suffix')),
    UNIQUE(match_mode,url_prefix)
);
INSERT INTO work_urls_v8(id,url_prefix,category)
    SELECT id,url_prefix,category FROM work_urls;
UPDATE sqlite_sequence SET seq=MAX(seq,COALESCE((SELECT seq FROM sqlite_sequence WHERE name='work_urls'),0))
    WHERE name='work_urls_v8';
DROP TABLE work_urls;
ALTER TABLE work_urls_v8 RENAME TO work_urls;
