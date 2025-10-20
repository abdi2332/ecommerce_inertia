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

        console.log('Inertia props:', props); // 

        root.render(
     <StockProvider>
        <CartProvider
          user={props.initialPage.props.auth.user} 
          initialCart={props.initialPage.props.cart}        // from Laravel Inertia::share
          identifier={props.initialPage.props.identifier}     // from Laravel session
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
