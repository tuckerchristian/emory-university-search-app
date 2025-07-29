# Public Assets Directory

This directory contains static assets that will be served by the application.

## Logo Placement

### Emory University Logo
- **File**: `emory-logo.png`
- **Location**: Place the Emory University logo file here
- **Recommended size**: 120px × 60px (or similar aspect ratio)
- **Format**: PNG with transparent background preferred
- **Usage**: The logo will appear in the header of the search interface

### Current Status
- ✅ Logo placeholder is ready in the UI
- ✅ Emory University logo file is present
- 📝 The logo should now display automatically

### Logo Requirements
- High resolution (at least 240px × 120px for retina displays)
- Transparent background preferred
- Official Emory University branding colors
- Clear visibility on white background

### Implementation
The logo is referenced in `src/App.tsx`:
```jsx
<img src="/emory-logo.png" alt="Emory University" />
```

The logo should now display automatically in the header. 