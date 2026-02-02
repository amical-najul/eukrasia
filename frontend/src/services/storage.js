/**
 * Storage utility that uses Capacitor Preferences for mobile (persistent)
 * and falls back to localStorage for web browsers.
 * 
 * WHY: localStorage in Capacitor Android WebViews is NOT persistent.
 * It can be cleared by OS, force closes, or WebView updates.
 * Capacitor Preferences uses native SharedPreferences which IS persistent.
 * 
 * CRITICAL: isNativePlatform() must be checked at RUNTIME, not at module load,
 * because Capacitor's native bridge may not be ready when the JS bundle first loads.
 */
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

// Helper function to check native platform at runtime
const isNativePlatform = () => {
    const result = Capacitor.isNativePlatform();
    // Debug logging to help diagnose storage issues
    console.log('[Storage] Platform check:', { isNative: result, platform: Capacitor.getPlatform() });
    return result;
};

export const Storage = {
    async get(key) {
        if (isNativePlatform()) {
            const { value } = await Preferences.get({ key });
            console.log(`[Storage] GET (Preferences) ${key}:`, value ? 'found' : 'null');
            return value;
        }
        const value = localStorage.getItem(key);
        console.log(`[Storage] GET (localStorage) ${key}:`, value ? 'found' : 'null');
        return value;
    },

    async set(key, value) {
        if (isNativePlatform()) {
            await Preferences.set({ key, value });
            console.log(`[Storage] SET (Preferences) ${key}`);
        } else {
            localStorage.setItem(key, value);
            console.log(`[Storage] SET (localStorage) ${key}`);
        }
    },

    async remove(key) {
        if (isNativePlatform()) {
            await Preferences.remove({ key });
            console.log(`[Storage] REMOVE (Preferences) ${key}`);
        } else {
            localStorage.removeItem(key);
            console.log(`[Storage] REMOVE (localStorage) ${key}`);
        }
    },

    async clear() {
        if (isNativePlatform()) {
            await Preferences.clear();
            console.log('[Storage] CLEAR (Preferences)');
        } else {
            localStorage.clear();
            console.log('[Storage] CLEAR (localStorage)');
        }
    }
};

export default Storage;

