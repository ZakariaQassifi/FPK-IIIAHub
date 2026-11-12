"""Shared constants for the storage buckets and upload limits."""

#: Bucket holding the published teaching resources.
RESOURCES_BUCKET = "academic-resources"

#: Bucket holding student contributions waiting for moderation.
CONTRIBUTIONS_BUCKET = "academic-contributions"

#: Maximum accepted upload size (25 MB).
MAX_FILE_SIZE = 25 * 1024 * 1024

#: Magic bytes identifying a PDF payload.
PDF_MAGIC = b"%PDF-"
