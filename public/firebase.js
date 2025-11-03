
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAvfx2p3F85yHSWvz_jJUUvRH_-zy31h2s",
  authDomain: "firbaseecommerc.firebaseapp.com",
  projectId: "firbaseecommerc",
  storageBucket: "firbaseecommerc.firebasestorage.app",
  messagingSenderId: "112393761279",
  appId: "1:112393761279:web:c0fea15799f6d60e8777ca",
  measurementId: "G-V75N161BMC"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
