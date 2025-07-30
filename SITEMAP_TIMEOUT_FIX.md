# Sitemap Timeout Fix Implementation

## Problem

The Calendly sitemap contains 1,333 URLs, which exceeds Vercel's 300-second serverless function timeout limit, causing the crawling process to fail with a 504 error.

## Solution Implemented

### 1. Timeout Protection

- Added execution time tracking with 270-second limit (30-second buffer)
- Function now stops processing early if approaching timeout
- Returns partial results instead of timing out completely

### 2. Batch Size Optimization

- Reduced MAX_PAGES from 20 to 10 for more conservative processing
- Added timeout checking in the main crawling loop
- Process stops safely when time limit approaches

### 3. Sitemap Parsing Protection

- Added 30-second timeout for sitemap fetch operations
- Limited sitemap processing to maximum 5,000 URLs to prevent memory issues
- Added progress logging for large sitemaps

### 4. Enhanced Response Information

- Added `timeoutReached` flag to indicate if processing stopped due to timeout
- Added `executionTime` to track performance
- Added informative messages about remaining pages

## How It Works Now

1. **Batch Processing**: The system processes URLs in batches of 10
2. **Timeout Monitoring**: Continuously checks execution time during processing
3. **Graceful Stopping**: If timeout approaches, returns results for processed pages
4. **Progress Tracking**: Users can re-run the crawl to continue with remaining pages

## For Large Sitemaps Like Calendly (1,333 URLs)

- **First Run**: Processes ~10 pages, returns partial results
- **Subsequent Runs**: Continue processing remaining pages in batches
- **Multiple Runs**: May need 100+ runs to complete all 1,333 URLs
- **Alternative**: Focus on specific content sections rather than full sitemap

## Recommended Approach for Large Sites

1. **Use Specific URLs**: Instead of full sitemap, use targeted URLs:

   - `https://calendly.com/features/`
   - `https://calendly.com/solutions/`
   - `https://calendly.com/integrations/`

2. **Section-by-Section**: Process different website sections separately

3. **Content Prioritization**: Focus on main product/service pages first

## Expected Response Format

```json
{
  "crawled": 10,
  "totalChunks": 45,
  "pages": ["url1", "url2", ...],
  "timeoutReached": true,
  "executionTime": 268000,
  "totalDiscovered": 1333,
  "totalRemaining": 1323,
  "message": "Processed 10 pages before timeout. 1323 pages remaining."
}
```

The system is now resilient to large sitemaps and will process them incrementally instead of failing completely.
