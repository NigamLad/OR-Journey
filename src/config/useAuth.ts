import axios from 'axios'
import { msalInstance, state, graphScopes } from './msalConfig'
import { InteractionType, type PopupRequest, type PublicClientApplication, type RedirectRequest } from '@azure/msal-browser'

export function msalService() {
    
    const initialize = async () => {
        try {
            await msalInstance.initialize() // Call the initialize function
        } catch (error) {
            console.log('Initialization error', error)
        }
    }

    const login = async () => {
        try {
            // Check if MSAL is initialized before using it
            if (!msalInstance) {
                throw new Error('MSAL not initialized. Call initializeMsal() before using MSAL API.')
            }
            await msalInstance.loginRedirect()
            state.isAuthenticated = true
        } catch (error) {
            console.error('Login error:', error)
        }
    }

    const logout = () => {
        if (!msalInstance) {
            throw new Error('MSAL not initialized. Call initializeMsal() before using MSAL API.')
        }
        msalInstance.logoutRedirect()
        state.isAuthenticated = false
        state.user = null
    }

    const handleRedirect = async () => {
        try {
            await msalInstance.handleRedirectPromise()
            state.isAuthenticated = msalInstance.getAllAccounts().length > 0
            state.user = msalInstance.getAllAccounts()[0]
        } catch (error) {
            console.error('Redirect error:', error)
        }
    }

    const getToken = async (): Promise<string> => {
        if (!msalInstance) {
            throw new Error('MSAL not initialized. Call initializeMsal() before using MSAL API.')
        }
        try {
            const accounts = msalInstance.getAllAccounts()
            if (accounts.length === 0) {
                throw new Error('No accounts found. Please login first.')
            }
            const silentRequest = {
                scopes: graphScopes["scopes"],
                account: accounts[0]
            }
            const silentResponse = await msalInstance.acquireTokenSilent(silentRequest)
            return silentResponse.accessToken
        } catch (error) {
            console.error('Silent token acquisition error:', error)
        }
        return ""
    }

    const registerAuthorizationHeaderInterceptor = () => {
        axios.interceptors.request.use(async (config) => {
            const accessToken = await getToken()
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`
            }
            return config
        })
    }

    // async function isAuthenticated(instance: PublicClientApplication, interactionType: InteractionType, loginRequest: PopupRequest|RedirectRequest): Promise<boolean> {    
    //     // If your application uses redirects for interaction, handleRedirectPromise must be called and awaited on each page load before determining if a user is signed in or not  
    //     return instance.handleRedirectPromise().then(() => {
    //         const accounts = instance.getAllAccounts();
    //         if (accounts.length > 0) {
    //             return true;
    //         }
      
    //         // User is not signed in and attempting to access protected route. Sign them in.
    //         if (interactionType === InteractionType.Redirect) {
    //             return instance.loginRedirect(loginRequest).then(() => {
    //                 return true;
    //             }).catch(() => {
    //                 return false;
    //             });
    //         }
      
    //         return false;
    //     }).catch(() => {
    //         return false;
    //     });
    //   }
      

    return {
        initialize,
        login,
        logout,
        handleRedirect,
        getToken,
        registerAuthorizationHeaderInterceptor,
        // isAuthenticated
    }
}
