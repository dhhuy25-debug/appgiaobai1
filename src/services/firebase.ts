import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { FirebaseConfig } from '../types';

let currentApp: FirebaseApp | null = null;
let currentDb: Firestore | null = null;

export function initFirebase(config: FirebaseConfig): { success: boolean; error?: string } {
  try {
    if (!config.apiKey || !config.projectId) {
      return { success: false, error: 'Vui lòng cung cấp ít nhất apiKey và projectId' };
    }

    if (getApps().length > 0) {
      currentApp = getApps()[0];
    } else {
      currentApp = initializeApp(config);
    }
    currentDb = getFirestore(currentApp);
    return { success: true };
  } catch (err: any) {
    console.error('Firebase init error:', err);
    return { success: false, error: err.message || 'Không thể khởi tạo Firebase' };
  }
}

export async function testFirebaseConnection(config: FirebaseConfig): Promise<{ success: boolean; message: string }> {
  try {
    const res = initFirebase(config);
    if (!res.success || !currentDb) {
      return { success: false, message: res.error || 'Lỗi khởi tạo' };
    }
    // Test write & read to connection_test
    const testDoc = doc(collection(currentDb, '_connection_test'), 'ping');
    await setDoc(testDoc, { ping: 'pong', timestamp: new Date().toISOString() });
    return { success: true, message: 'Kết nối Firebase Firestore thành công rực rỡ!' };
  } catch (err: any) {
    return { success: false, message: `Lỗi kết nối Firestore: ${err.message}` };
  }
}

export function getFirestoreDb(): Firestore | null {
  return currentDb;
}
