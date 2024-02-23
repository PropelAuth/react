import {
    AuthenticationInfo,
    RedirectToAccountOptions,
    RedirectToCreateOrgOptions,
    RedirectToLoginOptions,
    RedirectToOrgPageOptions,
    RedirectToSetupSAMLPageOptions,
    RedirectToSignupOptions,
} from "@propelauth/javascript"
import React, { useCallback, useEffect, useReducer } from "react"
import { loadOrgSelectionFromLocalStorage } from "./hooks/useActiveOrg"
import { useClientRef, useClientRefCallback } from "./useClientRef"

interface InternalAuthState {
    loading: boolean
    authInfo: AuthenticationInfo | null

    logout: (redirectOnLogout: boolean) => Promise<void>
    activeOrgFn: () => string | null

    redirectToLoginPage: (options?: RedirectToLoginOptions) => void
    redirectToSignupPage: (options?: RedirectToSignupOptions) => void
    redirectToAccountPage: (options?: RedirectToAccountOptions) => void
    redirectToOrgPage: (orgId?: string, options?: RedirectToOrgPageOptions) => void
    redirectToCreateOrgPage: (options?: RedirectToCreateOrgOptions) => void
    redirectToSetupSAMLPage: (orgId: string, options?: RedirectToSetupSAMLPageOptions) => void

    getSignupPageUrl(options?: RedirectToSignupOptions): string
    getLoginPageUrl(options?: RedirectToLoginOptions): string
    getAccountPageUrl(options?: RedirectToAccountOptions): string
    getOrgPageUrl(orgId?: string, options?: RedirectToOrgPageOptions): string
    getCreateOrgPageUrl(options?: RedirectToCreateOrgOptions): string
    getSetupSAMLPageUrl(orgId: string, options?: RedirectToSetupSAMLPageOptions): string

    refreshAuthInfo: () => Promise<void>
    defaultDisplayWhileLoading?: React.ReactElement
    defaultDisplayIfLoggedOut?: React.ReactElement
}

export type AuthProviderProps = {
    authUrl: string
    defaultDisplayWhileLoading?: React.ReactElement
    defaultDisplayIfLoggedOut?: React.ReactElement
    /**
     * getActiveOrgFn is deprecated. Use `useActiveOrgV2` instead.
     */
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
    const { clientRef, accessTokenChangeCounter } = useClientRef({ authUrl: props.authUrl })

    // Refresh the token when the user has logged in or out
    useEffect(() => {
        let didCancel = false

        async function refreshToken() {
            const client = clientRef.current?.client
            if (!client) {
                return
            }

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
    }, [accessTokenChangeCounter])

    // Deprecation warning
    useEffect(() => {
        if (props.getActiveOrgFn) {
            console.warn("The `getActiveOrgFn` prop is deprecated.")
        }
    }, [])

    const logout = useClientRefCallback(clientRef, (client) => client.logout)
    const redirectToLoginPage = useClientRefCallback(clientRef, (client) => client.redirectToLoginPage)
    const redirectToSignupPage = useClientRefCallback(clientRef, (client) => client.redirectToSignupPage)
    const redirectToAccountPage = useClientRefCallback(clientRef, (client) => client.redirectToAccountPage)
    const redirectToOrgPage = useClientRefCallback(clientRef, (client) => client.redirectToOrgPage)
    const redirectToCreateOrgPage = useClientRefCallback(clientRef, (client) => client.redirectToCreateOrgPage)
    const redirectToSetupSAMLPage = useClientRefCallback(clientRef, (client) => client.redirectToSetupSAMLPage)

    const getLoginPageUrl = useClientRefCallback(clientRef, (client) => client.getLoginPageUrl)
    const getSignupPageUrl = useClientRefCallback(clientRef, (client) => client.getSignupPageUrl)
    const getAccountPageUrl = useClientRefCallback(clientRef, (client) => client.getAccountPageUrl)
    const getOrgPageUrl = useClientRefCallback(clientRef, (client) => client.getOrgPageUrl)
    const getCreateOrgPageUrl = useClientRefCallback(clientRef, (client) => client.getCreateOrgPageUrl)
    const getSetupSAMLPageUrl = useClientRefCallback(clientRef, (client) => client.getSetupSAMLPageUrl)

    const refreshAuthInfo = useCallback(async () => {
        if (clientRef.current === null) {
            return
        }

        const client = clientRef.current.client
        const authInfo = await client.getAuthenticationInfoOrNull(true)
        dispatch({ authInfo })
    }, [dispatch])

    // TODO: Remove this, as both `getActiveOrgFn` and `loadOrgSelectionFromLocalStorage` are deprecated.
    const deprecatedActiveOrgFn = props.getActiveOrgFn || loadOrgSelectionFromLocalStorage

    const { defaultDisplayWhileLoading, defaultDisplayIfLoggedOut } = props
    const value: InternalAuthState = {
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
        activeOrgFn: deprecatedActiveOrgFn,
        getSignupPageUrl,
        getAccountPageUrl,
        getOrgPageUrl,
        getCreateOrgPageUrl,
        getSetupSAMLPageUrl,
        refreshAuthInfo,
    }
    return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
}
