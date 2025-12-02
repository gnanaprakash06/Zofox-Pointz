📁 src/assets/ folder
Use for: Files that SHOULD be processed by Vite
Characteristics:

Files are imported and bundled by Vite
Optimized, hashed filenames in production (e.g., logo-a3f2b9c.png)
Can be tree-shaken if unused
Better for cache busting Use src/assets/ for:

✅ Images used in components
✅ SVG icons
✅ Fonts (imported in CSS)
✅ Any media that's part of your app logic
✅ Files you want optimized/compressed
