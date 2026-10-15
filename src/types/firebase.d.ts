declare module 'firebase/app' {
  export interface FirebaseApp {
    name: string;
    options: Record<string, any>;
  }
  export function initializeApp(config: Record<string, any>): FirebaseApp;
  export function getApps(): FirebaseApp[];
}

declare module 'firebase/auth' {
  export interface Auth {
    currentUser: any;
  }
  export function getAuth(app?: any): Auth;
}

declare module 'firebase/firestore' {
  export interface Firestore {
    type: string;
  }
  export function getFirestore(app?: any): Firestore;
}

