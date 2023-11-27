import {
    AuthenticationInfo,
    createClient,
    RedirectToLoginOptions,
    RedirectToSignupOptions,
} from "@propelauth/javascript"
import React, { useCallback, useEffect, useMemo, useReducer, useState } from "react"

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

    refreshAuthInfo: () => Promise<void>
    defaultDisplayWhileLoading?: React.ReactElement
    defaultDisplayIfLoggedOut?: React.ReactElement
}

export type AuthProviderProps = {
    authUrl: string
    defaultDisplayWhileLoading?: React.ReactElement
    defaultDisplayIfLoggedOut?: React.ReactElement
    // getActiveOrgFn is deprecated. Users should use useActiveOrg instead.
    getActiveOrgFn?: () => string | null
    children?: React.ReactNode
}

export interface RequiredAuthProviderProps
    extends Omit<AuthProviderProps, "defaultDisplayWhileLoading" | "defaultDisplayIfLoggedOut"> {
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
    const [accessTokenChangeCounter, setAccessTokenChangeCounter] = useState(0)

    // Create a client and register an observer that triggers when the user logs in or out
    const client = useMemo(() => {
        const client = createClient({ authUrl: props.authUrl, enableBackgroundTokenRefresh: true })
        client.addAccessTokenChangeObserver(() => setAccessTokenChangeCounter((x) => x + 1))
        return client
    }, [props.authUrl])

    // On unmount, destroy the client
    useEffect(() => {
        if (props.getActiveOrgFn) {
            console.warn("The getActiveOrgFn prop is deprecated. Please use useActiveOrg instead.")
        }
        return () => {
            client.destroy()
        }
    }, [])

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
                // Important errors are logged in the client library
            }
        }

        refreshToken()
        return () => {
            didCancel = true
        }
    }, [client, accessTokenChangeCounter])

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

    const { defaultDisplayWhileLoading, defaultDisplayIfLoggedOut } = props
    const value = {
        loading: authInfoState.loading,
        authInfo: authInfoState.authInfo,
        logout,
        defaultDisplayWhileLoading,
        defaultDisplayIfLoggedOut,
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
        refreshAuthInfo,
    }
    return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
}
