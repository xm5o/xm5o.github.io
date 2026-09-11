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

// Keep analytics inside the same Firestore document used by the original,
// already-authorized site counter. No per-visitor documents are created.
export const ANALYTICS_DOCS = Object.freeze({
  summary: Object.freeze({
    collection: 'visitor_stats',
    document: 'main'
  })
});

export function getAnalyticsDb() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getFirestore(app);
}
