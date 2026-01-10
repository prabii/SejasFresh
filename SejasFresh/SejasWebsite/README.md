# 🥩 Sejas Fresh - Landing Page Website

A stunning, modern landing page for Sejas Fresh meat delivery app built with React, TypeScript, and Vite.

## ✨ Features

- **Modern Design**: Beautiful gradient backgrounds, smooth animations, and responsive layout
- **APK Download**: Direct download link to the Expo build APK
- **Feature Showcase**: Highlights all key app features
- **Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **Fast Performance**: Optimized with Vite for lightning-fast loading
- **SEO Friendly**: Proper meta tags and semantic HTML

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
SejasWebsite/
├── src/
│   ├── App.tsx          # Main app component
│   ├── App.css          # Styles
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html           # HTML template
└── package.json         # Dependencies
```

## 🎨 Features

### Sections

1. **Hero Section**: Eye-catching hero with gradient background and call-to-action
2. **Features Section**: Showcases 6 key app features
3. **Download Section**: Prominent APK download button with phone mockup
4. **Footer**: Links and company information

### Design Elements

- Gradient orbs for dynamic background
- Smooth animations and transitions
- Modern card-based layouts
- Responsive grid system
- Professional color scheme

## 🔗 APK Download

The website includes a download button that **directly downloads the APK file** when clicked.

### Setting Up Direct APK Download

You have three options:

#### Option 1: Direct APK URL (Recommended)
If you have the APK hosted somewhere (GitHub Releases, Google Drive, Dropbox, etc.), update the `DIRECT_APK_URL` in `src/App.tsx`:

```typescript
const DIRECT_APK_URL = 'https://your-hosted-apk-url.com/app.apk'
```

**Examples:**
- GitHub Releases: `https://github.com/username/repo/releases/download/v1.0/SejasFresh.apk`
- Google Drive: `https://drive.google.com/uc?export=download&id=FILE_ID`
- Dropbox: `https://www.dropbox.com/s/xxxxx/app.apk?dl=1` (add `?dl=1` for direct download)

#### Option 2: Host APK in Website
1. Place your APK file in the `public` folder: `public/SejasFresh.apk`
2. Update `DIRECT_APK_URL` in `src/App.tsx`:
   ```typescript
   const DIRECT_APK_URL = '/SejasFresh.apk'
   ```

#### Option 3: Expo Build Download
Use the Expo build download endpoint (already configured):
```typescript
const DIRECT_APK_URL = 'https://expo.dev/.../download/android'
```

**Note:** The download button will trigger a direct download. If the browser blocks it, it will also open the Expo build page as a fallback.

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Deploy automatically

### Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify

### Other Platforms

The `dist` folder after `npm run build` can be deployed to any static hosting service:
- GitHub Pages
- AWS S3
- Firebase Hosting
- Any CDN

## 🎯 Customization

### Update APK Download Link

Edit `src/App.tsx` and update the `EXPO_BUILD_URL` constant:

```typescript
const EXPO_BUILD_URL = 'your-expo-build-url-here'
```

### Change Colors

Edit CSS variables in `src/App.css`:

```css
:root {
  --primary-red: #D13635;
  /* Update other colors as needed */
}
```

### Modify Content

Edit the `features` array and text content in `src/App.tsx`.

## 📱 Responsive Breakpoints

- Mobile: < 480px
- Tablet: 481px - 768px
- Desktop: > 768px

## 🛠️ Tech Stack

- **React 19**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **CSS3**: Modern styling with animations

## 📄 License

© 2025 Sejas Fresh. All rights reserved.
