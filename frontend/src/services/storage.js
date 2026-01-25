/**
 * Storage utility that uses Capacitor Preferences for mobile (persistent)
 * and falls back to localStorage for web browsers.
 * 
 * WHY: localStorage in Capacitor Android WebViews is NOT persistent.
 * It can be cleared by OS, force closes, or WebView updates.
 * Capacitor Preferences uses native SharedPreferences which IS persistent.
 */
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

export const Storage = {
    async get(key) {
        if (isNative) {
            const { value } = await Preferences.get({ key });
            return value;
        }
        return localStorage.getItem(key);
    },

    async set(key, value) {
        if (isNative) {
            await Preferences.set({ key, value });
        } else {
            localStorage.setItem(key, value);
        }
    },

    async remove(key) {
        if (isNative) {
            await Preferences.remove({ key });
        } else {
            localStorage.removeItem(key);
        }
    },

    async clear() {
        if (isNative) {
            await Preferences.clear();
        } else {
            localStorage.clear();
        }
    }
};

export default Storage;
