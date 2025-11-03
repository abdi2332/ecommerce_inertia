import '../css/app.css';
import './bootstrap';
import { StockProvider } from './Pages/components/StockProvider';
import { CartProvider } from './Pages/components/CartProvider';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

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

async function registerFCM(user, csrfToken) {
  if (!user) return;
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    const token = await getToken(messaging, {
      vapidKey: 'BLPNxHNQO_Kpf_jaqxhMqVt1IUIWGm740NHe6lfnEMIeugqcyqCliQWx6YunC9Evzx70VrabOKp0ck5NCjvHq5g', // replace with Firebase Web Push key
    });
    console.log('FCM Token:', token);
    if (token) {
      await fetch('/api/save-fcm-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({ token }),
      });
    }
  }
}

createInertiaApp({
  title: (title) => `${title} - ${appName}`,
  resolve: (name) =>
    resolvePageComponent(
      `./Pages/${name}.jsx`,
      import.meta.glob('./Pages/**/*.jsx'),
    ),
  setup({ el, App, props }) {
    const root = createRoot(el);
    console.log('Inertia props:',  props.initialPage.props); // 
    root.render(
      <StockProvider>
        <CartProvider
          user={props.initialPage.props.auth.user}
          initialCart={props.initialPage.props.cart}
          identifier={props.initialPage.props.identifier}
        >
          <ToastContainer position="top-right" autoClose={1500} />
          <App {...props} />
        </CartProvider>
      </StockProvider>
    );

    registerFCM(props.initialPage.props.auth.user, props.initialPage.props.csrfToken);
  },
  progress: { color: '#4B5563' },
});
