/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore on specific DB ID and exported clients
export const db = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

/**
 * Custom Firestore handler throwing formatted JSON string on failure
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Detailed log: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validate immediate connection capability according to the core skill instructions
 */
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or networks.");
    }
  }
}

testConnection();

export const signInAsDemoAdmin = async (isBangla: boolean = true) => {
  const email = 'demo.admin@damagarasmdhs.edu.bd';
  const password = 'demoAdminPassword123';
  const name = isBangla ? 'আবু বকর (সমন্বয়ক)' : 'Abu Bakar (Academic Coordinator)';
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const adminRecordRef = doc(db, 'admins', user.uid);
    await setDoc(adminRecordRef, {
      uid: user.uid,
      name: name,
      email: email,
      role: 'admin',
      registeredAt: new Date().toISOString(),
      verified: true
    }, { merge: true });
    
    localStorage.setItem('demo_user_role', 'admin');
    return user;
  } catch (err: any) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.message?.includes('invalid-credential')) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: name });
      
      const adminRecordRef = doc(db, 'admins', user.uid);
      await setDoc(adminRecordRef, {
        uid: user.uid,
        name: name,
        email: email,
        role: 'admin',
        registeredAt: new Date().toISOString(),
        verified: true
      });
      
      localStorage.setItem('demo_user_role', 'admin');
      return user;
    } else {
      throw err;
    }
  }
};

export const signInAsDemoStudent = async (isBangla: boolean = true) => {
  const email = 'demo.student@example.com';
  const password = 'demoStudentPassword123';
  const name = isBangla ? 'তাসনিম রহমান' : 'Tasnim Rahman';
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    localStorage.setItem('demo_user_role', 'student');
    localStorage.setItem('demo_user', JSON.stringify({
      uid: user.uid,
      displayName: name,
      email: email,
      role: 'student',
      studentId: 'DSMD-101'
    }));
    return user;
  } catch (err: any) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.message?.includes('invalid-credential')) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: name });
      
      localStorage.setItem('demo_user_role', 'student');
      localStorage.setItem('demo_user', JSON.stringify({
        uid: user.uid,
        displayName: name,
        email: email,
        role: 'student',
        studentId: 'DSMD-101'
      }));
      return user;
    } else {
      throw err;
    }
  }
};
