import {
    PublicClientApplication,
    type AccountInfo,
    type RedirectRequest
} from '@azure/msal-browser'
import { reactive } from 'vue'

export const msalConfig = {
    auth: {
        clientId: '8cc68b3d-1bf0-4cf6-8fef-919155d070fd',
        authority: 'https://login.microsoftonline.com/c43e7c8d-cd4f-4ed9-9c64-997be2af905e',
        redirectUri: window.location.origin, // Replace with your actual redirect URI
        postLogoutUri: window.location.origin
    },
    cache: {
        cacheLocation: 'sessionStorage', // This configures where your cache will be stored
        storeAuthStateInCookie: false
    }
}
export const graphScopes: RedirectRequest = {
    scopes: ['user.read', 'openid', 'profile']
}
export const state = reactive({
    isAuthenticated: false,
    user: null as AccountInfo | null
})

export const msalInstance = new PublicClientApplication(msalConfig)
