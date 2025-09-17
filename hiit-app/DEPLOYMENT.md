# HIIT App Deployment Guide

## How It Works Without a Server

This HIIT app is built as a **Progressive Web App (PWA)** using React + Vite. It's completely **static** - no server required!

### What happens during deployment:
1. **Build Process**: `npm run build` creates optimized static files (HTML, CSS, JS)
2. **Static Hosting**: GitHub Pages serves these files like any website
3. **PWA Features**: Service worker enables offline functionality and app-like behavior
4. **Mobile Installation**: Users can "install" it on phones like a native app

## 🚀 Deploy to GitHub Pages (FREE)

### Step 1: Push to GitHub
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial HIIT app commit"

# Create GitHub repository and push
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/hiit-app.git
git push -u origin main
```

### Step 2: Enable GitHub Pages
1. Go to your repository settings
2. Scroll to "Pages" section
3. Under "Source", select "GitHub Actions"
4. The deployment workflow will run automatically

### Step 3: Access Your App
- Your app will be available at: `https://YOUR-USERNAME.github.io/hiit-app/`
- Wait 2-3 minutes for first deployment

## 📱 Install on Phone

### iPhone (Safari):
1. Open the app URL in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Choose app name and tap "Add"
5. App icon appears on home screen - works offline!

### Android (Chrome):
1. Open the app URL in Chrome
2. Tap the three-dot menu (⋮)
3. Tap "Add to Home Screen" or "Install App"
4. Confirm installation
5. App appears in app drawer and home screen

## ✨ PWA Features Included

- **Offline Functionality**: Works without internet after first visit
- **App-like Experience**: No browser bars when installed
- **Dark Theme**: Athletic HIIT aesthetic
- **Responsive Design**: Works on all screen sizes
- **Fast Loading**: Optimized static assets
- **Local Storage**: Equipment preferences and workout history saved locally

## 🔧 Alternative Free Hosting Options

### Netlify (Alternative to GitHub Pages)
1. Build the app: `npm run build`
2. Drag and drop the `dist` folder to [netlify.com/drop](https://app.netlify.com/drop)
3. Get instant URL like `https://amazing-name-123.netlify.app`

### Vercel (Alternative to GitHub Pages)
1. Install Vercel CLI: `npm install -g vercel`
2. Run: `vercel --prod`
3. Follow prompts to deploy

## 📊 How Users Experience It

1. **Visit URL**: App loads like any website
2. **Install Prompt**: Browser suggests "Add to Home Screen"
3. **Offline Access**: Works completely offline after first visit
4. **Data Persistence**: Equipment settings and workout history saved locally
5. **Updates**: Automatically updates when you push new code

## 🛠️ Development vs Production

- **Development** (`npm run dev`): Live server for development
- **Production** (`npm run build`): Creates static files for hosting
- **No Backend**: All data stored in browser's local storage
- **No Database**: Equipment and workout data embedded in app

## 🔄 Updating the App

1. Make changes to code
2. Push to GitHub: `git push`
3. GitHub Actions automatically rebuilds and deploys
4. Users get updates next time they visit

The app is designed to be shared easily - just send the GitHub Pages URL to family members and they can install it on their phones!