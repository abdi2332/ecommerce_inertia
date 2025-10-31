import '../css/app.css';
import './bootstrap';
import { StockProvider } from './Pages/components/StockProvider';
import { CartProvider } from './Pages/components/CartProvider';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { ToastContainer, toast } from 'react-toastify';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

async function registerFCM(user, csrfToken) {
  if (!user) return; // Only register for logged-in users

  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    const token = await getToken(messaging, {
      vapidKey: 'YOUR_PUBLIC_VAPID_KEY', // from Firebase
    });
    if (token) {
      // Send token to backend
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

    console.log('Inertia props:', props.initialPage.props.cart); // 

    root.render(
      <StockProvider>
        <CartProvider
          user={props.initialPage.props.auth.user}
          initialCart={props.initialPage.props.cart}        // from Laravel Inertia::share
          identifier={props.initialPage.props.identifier}     // from Laravel session
        >
          <ToastContainer position="top-right" autoClose={1500} />
          <App {...props} />
        </CartProvider>
      </StockProvider>
    );

    registerFCM(props.initialPage.props.auth.user, props.initialPage.props.csrfToken);
  },
  progress: {
    color: '#4B5563',
  },
});
