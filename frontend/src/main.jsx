import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { WeatherProvider } from './context/WeatherContext';
import { AuthProvider } from './context/AuthContext';
import { Auth0Provider } from '@auth0/auth0-react';
import './styles/index.css';

const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN || 'dev-weather-analytics.us.auth0.com';
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID || 'dummy-client-id';
const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE || 'https://weather-analytics-api.local';

const root = ReactDOM.createRoot(document.getElementById('root'));

const AppWrapper = (
  <React.StrictMode>
    {auth0ClientId && auth0ClientId !== 'dummy-client-id' ? (
      <Auth0Provider
        domain={auth0Domain}
        clientId={auth0ClientId}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: auth0Audience
        }}
      >
        <AuthProvider>
          <ThemeProvider>
            <WeatherProvider>
              <App />
            </WeatherProvider>
          </ThemeProvider>
        </AuthProvider>
      </Auth0Provider>
    ) : (
      <AuthProvider>
        <ThemeProvider>
          <WeatherProvider>
            <App />
          </WeatherProvider>
        </ThemeProvider>
      </AuthProvider>
    )}
  </React.StrictMode>
);

root.render(AppWrapper);
