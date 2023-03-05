import {
    AuthenticationInfo,
    createClient,
    RedirectToLoginOptions,
    RedirectToSignupOptions,
} from "@propelauth/javascript"
import React, { useCallback, useEffect, useMemo, useReducer, useState } from "react"
import { loadOrgSelectionFromLocalStorage } from "./useActiveOrg"
import { withRequiredAuthInfo } from "./withRequiredAuthInfo"

interface InternalAuthState {
    loading: boolean
    authInfo: AuthenticationInfo | null

    logout: (redirectOnLogout: boolean) => Promise<void>

    redirectToLoginPage: (options?: RedirectToLoginOptions) => void
    redirectToSignupPage: (options?: RedirectToSignupOptions) => void
    redirectToAccountPage: () => void
    redirectToOrgPage: (orgId?: string) => void
    redirectToCreateOrgPage: () => void
    redirectToSetupSAMLPage: (orgId: string) => void

    getSignupPageUrl(options?: RedirectToSignupOptions): string
    getLoginPageUrl(options?: RedirectToLoginOptions): string
    getAccountPageUrl(): string
    getOrgPageUrl(orgId?: string): string
    getCreateOrgPageUrl(): string
    getSetupSAMLPageUrl(orgId: string): string

    activeOrgFn: () => string | null

    refreshAuthInfo: () => Promise<void>
}

export type AuthProviderProps = {
    authUrl: string
    getActiveOrgFn?: () => string | null
    children?: React.ReactNode
}

export interface RequiredAuthProviderProps extends AuthProviderProps {
    displayWhileLoading?: React.ReactElement
    displayIfLoggedOut?: React.ReactElement
}

export const AuthContext = React.createContext<InternalAuthState | undefined>(undefined)

type AuthInfoState = {
    loading: boolean
    authInfo: AuthenticationInfo | null
}

const initialAuthInfoState: AuthInfoState = {
    loading: true,
    authInfo: null,
}

type AuthInfoStateAction = {
    authInfo: AuthenticationInfo | null
}

function authInfoStateReducer(_state: AuthInfoState, action: AuthInfoStateAction): AuthInfoState {
    if (!action.authInfo) {
        return {
            loading: false,
            authInfo: action.authInfo,
        }
    } else if (_state.loading) {
        return {
            loading: false,
            authInfo: action.authInfo,
        }
    } else if (_state.authInfo && _state.authInfo.accessToken !== action.authInfo.accessToken) {
        return {
            loading: false,
            authInfo: action.authInfo,
        }
    } else {
        return _state
    }
}

export const AuthProvider = (props: AuthProviderProps) => {
    const [authInfoState, dispatch] = useReducer(authInfoStateReducer, initialAuthInfoState)
    const [loggedInChangeCounter, setLoggedInChangeCounter] = useState(0)

    // Create a client and register an observer that triggers when the user logs in or out
    const client = useMemo(() => {
        // Disable background token refresh as we will do it within React instead
        const client = createClient({ authUrl: props.authUrl, enableBackgroundTokenRefresh: false })
        client.addLoggedInChangeObserver(() => setLoggedInChangeCounter((x) => x + 1))
        return client
    }, [props.authUrl])

    // On unmount, destroy the client
    useEffect(() => {
        return () => {
            client.destroy()
        }
    }, [])

    // Periodically refresh the token. The client will only make requests when the authInfo is stale
    // Errors are logged and the token will be invalidated separately
    useEffect(() => {
        let didCancel = false

        async function refreshToken() {
            try {
                const authInfo = await client.getAuthenticationInfoOrNull()
                if (!didCancel) {
                    dispatch({ authInfo })
                }
            } catch (_) {
                // Exceptions are logged in the JS library
            }
        }

        const interval = setInterval(refreshToken, 60000)
        return () => {
            didCancel = true
            clearInterval(interval)
        }
    }, [client])

    // Refresh the token when the user has logged in or out
    useEffect(() => {
        let didCancel = false

        async function refreshToken() {
            try {
                const authInfo = await client.getAuthenticationInfoOrNull()
                if (!didCancel) {
                    dispatch({ authInfo })
                }
            } catch (_) {
                // Exceptions are logged in the JS library
            }
        }

        refreshToken()
        return () => {
            didCancel = true
        }
    }, [client, loggedInChangeCounter])

    // Watchdog timer to make sure that if we hit the expiration we get rid of the token.
    // This should only be triggered if we are unable to get a new token due to an unexpected error/network timeouts.
    const expiresAtSeconds = authInfoState.authInfo ? authInfoState.authInfo.expiresAtSeconds : 0
    useEffect(() => {
        if (!authInfoState.authInfo) {
            return
        }
        const millisUntilTokenExpires = getMillisUntilTokenExpires(authInfoState.authInfo.expiresAtSeconds)
        const timeout = setTimeout(() => {
            dispatch({ authInfo: null })
        }, millisUntilTokenExpires)

        return () => clearTimeout(timeout)
    }, [expiresAtSeconds])

    const logout = useCallback(client.logout, [])
    const redirectToLoginPage = useCallback(client.redirectToLoginPage, [])
    const redirectToSignupPage = useCallback(client.redirectToSignupPage, [])
    const redirectToAccountPage = useCallback(client.redirectToAccountPage, [])
    const redirectToOrgPage = useCallback(client.redirectToOrgPage, [])
    const redirectToCreateOrgPage = useCallback(client.redirectToCreateOrgPage, [])
    const redirectToSetupSAMLPage = useCallback(client.redirectToSetupSAMLPage, [])

    const getLoginPageUrl = useCallback(client.getLoginPageUrl, [])
    const getSignupPageUrl = useCallback(client.getSignupPageUrl, [])
    const getAccountPageUrl = useCallback(client.getAccountPageUrl, [])
    const getOrgPageUrl = useCallback(client.getOrgPageUrl, [])
    const getCreateOrgPageUrl = useCallback(client.getCreateOrgPageUrl, [])
    const getSetupSAMLPageUrl = useCallback(client.getSetupSAMLPageUrl, [])

    const refreshAuthInfo = useCallback(async () => {
        const authInfo = await client.getAuthenticationInfoOrNull(true)
        dispatch({ authInfo })
    }, [dispatch])

    const activeOrgFn = props.getActiveOrgFn || loadOrgSelectionFromLocalStorage
    const value = {
        loading: authInfoState.loading,
        authInfo: authInfoState.authInfo,
        logout,
        redirectToLoginPage,
        redirectToSignupPage,
        redirectToAccountPage,
        redirectToOrgPage,
        redirectToCreateOrgPage,
        redirectToSetupSAMLPage,
        getLoginPageUrl,
        getSignupPageUrl,
        getAccountPageUrl,
        getOrgPageUrl,
        getCreateOrgPageUrl,
        getSetupSAMLPageUrl,
        activeOrgFn,
        refreshAuthInfo,
    }
    return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
}

export const RequiredAuthProvider = (props: RequiredAuthProviderProps) => {
    const { children, displayIfLoggedOut, displayWhileLoading, ...sharedProps } = props
    const WrappedComponent = withRequiredAuthInfo(
        () => {
            return <React.Fragment>{children}</React.Fragment>
        },
        {
            displayWhileLoading: displayWhileLoading,
            displayIfLoggedOut: displayIfLoggedOut,
        }
    )
    return (
        <AuthProvider {...sharedProps}>
            <WrappedComponent />
        </AuthProvider>
    )
}

function getMillisUntilTokenExpires(expiresAtSeconds: number): number {
    let millisUntilTokenExpires = expiresAtSeconds * 1000 - Date.now()
    return Math.max(0, millisUntilTokenExpires)
}
