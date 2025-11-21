import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig, loginRequest } from './msalConfig';

// Initialize the MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Initialize the instance (required for v2+)
msalInstance.initialize().then(() => {
  console.log("MSAL instance initialized successfully.");
}).catch(err => {
  console.error("Failed to initialize MSAL:", err);
});

export { msalInstance, loginRequest };