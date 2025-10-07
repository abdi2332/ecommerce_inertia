import '../css/app.css';
import './bootstrap';
import { StockProvider } from './Pages/components/StockProvider';
import { CartProvider } from './Pages/components/CartProvider';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

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
          initialCart={props.initialPage.props.cart}        // from Laravel Inertia::share
          sessionId={props.initialPage.props.sessionId}     // from Laravel session
        >
          <App {...props} />
        </CartProvider>
      </StockProvider>
    );
    },
    progress: {
        color: '#4B5563',
    },
});
