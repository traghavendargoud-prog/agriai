import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  doc, 
  getDocFromServer, 
  memoryLocalCache,
  memoryLruGarbageCollector
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Firestore with settings optimized for AI Studio container environment
export const db = initializeFirestore(app, {
  databaseId: firebaseConfig.firestoreDatabaseId || '(default)',
  experimentalForceLongPolling: true,
  useFetchStreams: false,
  host: 'firestore.googleapis.com',
  ssl: true,
  localCache: memoryLocalCache({
    garbageCollector: memoryLruGarbageCollector()
  })
});
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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      // Specifically use getDocFromServer to force a network request and bypass cache
      await getDocFromServer(doc(db, 'test', 'connection'));
      console.log("Firestore connection verified successfully.");
      return; // Success, exit the loop
    } catch (error) {
      console.error(`Firestore connectivity test attempt ${i + 1} failed:`, error);
      
      const isOffline = error instanceof Error && error.message.includes('offline');
      const isUnavailable = error instanceof Error && error.message.includes('unavailable');

      if (i < retries - 1) {
        console.log("Retrying in 2 seconds...");
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        if (isOffline) {
          console.error("Firestore remains offline after retries. This typically happens due to regional network proxy issues or strict iframe constraints.");
        } else if (isUnavailable) {
          console.error("The Firestore backend is unreachable. Verify project status and database ID.");
        }
      }
    }
  }
}

testConnection();
