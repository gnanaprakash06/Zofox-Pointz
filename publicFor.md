📁 public/ folder
Use for: Files that should NOT be processed by Vite
Characteristics:

Files are served as-is, no bundling/optimization
Accessed using absolute paths starting with /
NOT imported in your code
Files keep their original names in production Use public/ for:

✅ favicon.ico
✅ robots.txt, sitemap.xml
✅ manifest.json (PWA)
✅ Files referenced in index.html directly
✅ Files that MUST keep their exact name/path (like for third-party integrations)
✅ Very large files that shouldn't be bundled
