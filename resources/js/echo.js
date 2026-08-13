import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

const wsHost = import.meta.env.VITE_REVERB_HOST && import.meta.env.VITE_REVERB_HOST !== 'yourdomain.com'
    ? import.meta.env.VITE_REVERB_HOST
    : window.location.hostname;

const isEncrypted = window.location.protocol === 'https:';
const defaultPort = isEncrypted ? 443 : 80;
const port = window.location.port || defaultPort;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'y5saqbxn2m2crojjnea6',
    wsHost: wsHost,
    wsPort: import.meta.env.VITE_REVERB_PORT ? parseInt(import.meta.env.VITE_REVERB_PORT) : port,
    wssPort: import.meta.env.VITE_REVERB_PORT ? parseInt(import.meta.env.VITE_REVERB_PORT) : port,
    forceTLS: import.meta.env.VITE_REVERB_SCHEME ? import.meta.env.VITE_REVERB_SCHEME === 'https' : isEncrypted,
    enabledTransports: ['ws', 'wss'],
});


export default window.Echo;
