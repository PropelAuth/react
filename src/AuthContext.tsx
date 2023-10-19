import {
    AuthenticationInfo,
    createClient,
    RedirectToLoginOptions,
    RedirectToSignupOptions,
} from "@propelauth/javascript"
import React, { useCallback, useEffect, useMemo, useReducer, useState } from "react"
import { loadOrgSelectionFromLocalStorage } from "./useActiveOrg"
import { WithLoggedInAuthInfoProps } from "./withAuthInfo"
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
    defaultDisplayWhileLoading?: React.ReactElement
    defaultDisplayIfLoggedOut?: React.ReactElement
}

export type AuthProviderProps = {
    authUrl: string
    defaultDisplayWhileLoading?: React.ReactElement
    defaultDisplayIfLoggedOut?: React.ReactElement
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
            } catch (e) {
                console.log("Failed to refresh token", e)
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
                // Important errors are logged in the client library
            }
        }

        refreshToken()
        return () => {
            didCancel = true
        }
    }, [client, loggedInChangeCounter])

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
        activeOrgFn,
        refreshAuthInfo,
    }
    return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
}

const RequiredAuthWrappedComponent = withRequiredAuthInfo(
    ({ children }: { children: React.ReactNode } & WithLoggedInAuthInfoProps) => <>{children}</>
)

export const RequiredAuthProvider = (props: RequiredAuthProviderProps) => {
    const { children, displayIfLoggedOut, displayWhileLoading, ...sharedProps } = props

    return (
        <AuthProvider
            {...sharedProps}
            defaultDisplayIfLoggedOut={displayIfLoggedOut}
            defaultDisplayWhileLoading={displayWhileLoading}
        >
            <RequiredAuthWrappedComponent>{children}</RequiredAuthWrappedComponent>
        </AuthProvider>
    )
}
