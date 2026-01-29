import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyARuvrD5HsyCEkddAyXWJ9tQ923uS7ATqU",
  authDomain: "rescuegrid-6cd35.firebaseapp.com",
  projectId: "rescuegrid-6cd35",
  storageBucket: "rescuegrid-6cd35.appspot.com",
  messagingSenderId: "790196929508",
  appId: "1:790196929508:web:45bcb17d4a3dc939dc3df1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
