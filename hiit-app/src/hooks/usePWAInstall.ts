import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isIOSInstalled = isIOS && (navigator as any).standalone === true;

    setIsInstalled(isStandalone || isIOSInstalled);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Install failed:', error);
      return false;
    }
  };

  const getInstallInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isIPad = /iPad/.test(navigator.userAgent);
    const isIPhone = /iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isMac = /Macintosh|MacIntel|MacPPC|Mac68K/.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isBrave = /Brave/.test(navigator.userAgent) || (navigator as any).brave;
    const isFirefox = /Firefox/.test(navigator.userAgent);

    if (isIPad && isSafari) {
      return {
        platform: 'iPad Safari',
        steps: [
          'Tap the Share button (square with up arrow) in the toolbar',
          'Scroll down and tap "Add to Home Screen"',
          'Choose a name and tap "Add"',
          'The app will appear on your iPad home screen'
        ]
      };
    }

    if (isIPhone && isSafari) {
      return {
        platform: 'iPhone Safari',
        steps: [
          'Tap the Share button (square with up arrow)',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to install the app'
        ]
      };
    }

    if (isMac && isSafari && !isChrome) {
      return {
        platform: 'Safari (Mac)',
        steps: [
          'Click "File" in the menu bar',
          'Select "Add to Dock"',
          'Choose a name and click "Add"',
          'The app will appear in your Dock'
        ]
      };
    }

    if (isAndroid && isChrome) {
      return {
        platform: 'Chrome (Android)',
        steps: [
          'Tap the three dots menu (⋮) in the top right',
          'Select "Add to Home screen"',
          'Choose a name and tap "Add"',
          'The app will appear on your home screen'
        ]
      };
    }

    if (isAndroid && isBrave) {
      return {
        platform: 'Brave Browser (Android)',
        steps: [
          'Tap the three dots menu (⋮) in the top right',
          'Select "Add to Home screen"',
          'Choose a name and tap "Add"',
          'The app will appear on your home screen'
        ]
      };
    }

    if (isAndroid && isFirefox) {
      return {
        platform: 'Firefox (Android)',
        steps: [
          'Tap the three dots menu (⋮) in the top right',
          'Select "Install"',
          'Tap "Add to Home Screen"',
          'The app will appear on your home screen'
        ]
      };
    }

    if (isBrave && !isMobile) {
      return {
        platform: 'Brave Browser',
        steps: [
          'Click the sandwich menu (☰) in the top right',
          'Select "Save and share"',
          'Choose "Install page as app"',
          'Click "Install" in the dialog'
        ]
      };
    }

    if (isChrome && !isMobile) {
      return {
        platform: 'Chrome',
        steps: [
          'Click the three dots menu (⋮) in the top right',
          'Select "Cast, save and share"',
          'Choose "Install page as app"',
          'Click "Install" in the dialog'
        ]
      };
    }

    if (isFirefox && !isMobile) {
      return {
        platform: 'Firefox',
        steps: [
          'Click the menu (☰) in the top right',
          'Select "Install"',
          'Click "Add" to install the app'
        ]
      };
    }

    return {
      platform: 'Your Browser',
      steps: [
        'Look for an install option in your browser menu',
        'Or check the address bar for an install icon',
        'Follow the prompts to add to home screen'
      ]
    };
  };

  return {
    isInstallable,
    isInstalled,
    installApp,
    getInstallInstructions
  };
};