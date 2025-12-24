import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { Sheet } from '../types';
import { DEFAULT_ADMIN_PASS } from '../constants';

const firebaseConfig = {
  apiKey: "AIzaSyBIkUZVVt1apvAu6Lewh8cwWm6NLEY5GoM",
  authDomain: "medical-technology-4b426.firebaseapp.com",
  projectId: "medical-technology-4b426",
  storageBucket: "medical-technology-4b426.firebasestorage.app",
  messagingSenderId: "40369588750",
  appId: "1:40369588750:web:faebb27a98e2ab87088a5f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// --- Helper ---
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

// --- Admin Auth Logic ---

export const getAdminPassword = async (): Promise<string> => {
  try {
    const docRef = doc(db, 'settings', 'admin');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().passwordHash;
    }
  } catch (error) {
    console.error("Error fetching admin password:", error);
  }
  return DEFAULT_ADMIN_PASS;
};

export const setAdminPassword = async (newPassword: string): Promise<void> => {
  try {
    const docRef = doc(db, 'settings', 'admin');
    await setDoc(docRef, { passwordHash: newPassword }, { merge: true });
  } catch (error) {
    console.error("Error setting admin password:", error);
    throw error;
  }
};

// --- Sheet Data Logic ---

export const getSheets = async (): Promise<Sheet[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'sheets'));
    const sheets: Sheet[] = [];
    querySnapshot.forEach((doc) => {
      sheets.push(doc.data() as Sheet);
    });
    // Sort by createdAt descending
    return sheets.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Error fetching sheets:", error);
    return [];
  }
};

export const addSheet = async (sheet: Sheet): Promise<void> => {
  try {
    // Upload image if it exists and is a data URL (new upload)
    if (sheet.imageUrl && sheet.imageUrl.startsWith('data:')) {
       const storageRef = ref(storage, `sheets/${sheet.id}`);
       await uploadString(storageRef, sheet.imageUrl, 'data_url');
       sheet.imageUrl = await getDownloadURL(storageRef);
    }

    await setDoc(doc(db, 'sheets', sheet.id), sheet);
  } catch (error) {
    console.error("Error adding sheet:", error);
    throw error;
  }
};

export const updateSheet = async (updatedSheet: Sheet): Promise<void> => {
  try {
    // If image has changed to a new data URL, upload it
    if (updatedSheet.imageUrl && updatedSheet.imageUrl.startsWith('data:')) {
        const storageRef = ref(storage, `sheets/${updatedSheet.id}`);
        await uploadString(storageRef, updatedSheet.imageUrl, 'data_url');
        updatedSheet.imageUrl = await getDownloadURL(storageRef);
    }

    await updateDoc(doc(db, 'sheets', updatedSheet.id), { ...updatedSheet });
  } catch (error) {
    console.error("Error updating sheet:", error);
    throw error;
  }
};

export const deleteSheet = async (id: string, imageUrl?: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'sheets', id));
    
    // Attempt to delete image if exists
    if (imageUrl) {
      try {
          // Extract path from URL or just try deleting by known path convention
          const storageRef = ref(storage, `sheets/${id}`);
          await deleteObject(storageRef);
      } catch (e) {
          console.warn("Could not delete image or image did not exist:", e);
      }
    }
  } catch (error) {
    console.error("Error deleting sheet:", error);
    throw error;
  }
};

// --- Custom Subjects Logic ---

export const getAllCustomSubjects = async (): Promise<Record<string, string[]>> => {
    try {
        const docRef = doc(db, 'settings', 'customSubjects');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as Record<string, string[]>;
        }
    } catch (error) {
        console.error("Error fetching custom subjects", error);
    }
    return {};
};

export const addCustomSubject = async (year: string, department: string, subject: string): Promise<void> => {
  try {
    const key = `${year}_${department}`;
    const docRef = doc(db, 'settings', 'customSubjects');
    await setDoc(docRef, { [key]: arrayUnion(subject) }, { merge: true });
  } catch (error) {
    console.error("Error adding custom subject:", error);
    throw error;
  }
};

// --- Notification Logic (Mocking FCM for now as it requires Service Worker) ---

export const isSubscribedToTopic = (topic: string): boolean => {
  const subs = JSON.parse(localStorage.getItem('med_app_subs') || '[]');
  return subs.includes(topic);
};

export const subscribeToTopic = (topic: string): void => {
  const subs = JSON.parse(localStorage.getItem('med_app_subs') || '[]');
  if (!subs.includes(topic)) {
    subs.push(topic);
    localStorage.setItem('med_app_subs', JSON.stringify(subs));
    console.log(`[FCM MOCK] Subscribed to ${topic}`);
  }
};
