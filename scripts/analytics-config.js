import { initializeApp, getApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export const firebaseConfig = {
  apiKey: 'AIzaSyDSwnuab0yqf6UPcePQSNPXXndwHz-DAjw',
  authDomain: 'xd-database.firebaseapp.com',
  projectId: 'xd-database',
  storageBucket: 'xd-database.firebasestorage.app',
  messagingSenderId: '204951222864',
  appId: '1:204951222864:web:f8c2fb4e00f39896636f55'
};

export const ANALYTICS_COLLECTIONS = Object.freeze({
  summary: 'site_analytics',
  daily: 'analytics_daily',
  countries: 'analytics_countries',
  cities: 'analytics_cities',
  referrers: 'analytics_referrers',
  devices: 'analytics_devices',
  browsers: 'analytics_browsers',
  operatingSystems: 'analytics_os',
  pages: 'analytics_pages'
});

export function getAnalyticsDb() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getFirestore(app);
}
