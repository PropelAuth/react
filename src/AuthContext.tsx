import { AuthenticationInfo, createClient } from "@propelauth/javascript"
import React, { useCallback, useEffect, useMemo, useReducer, useState } from "react"
import { withRequiredAuthInfo } from "./withRequiredAuthInfo"

interface InternalAuthState {
    loading: boolean
    authInfo: AuthenticationInfo | null
    triggerRefreshAuthentication: () => void

    logout: (redirectOnLogout: boolean) => Promise<void>

    userSelectedOrgId: string | null
    selectOrgId: (orgId: string) => void

    redirectToLoginPage: () => void
    redirectToSignupPage: () => void
    redirectToAccountPage: () => void
    redirectToOrgPage: (orgId?: string) => void
    redirectToCreateOrgPage: () => void
}

export type AuthProviderProps = {
    authUrl: string
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
    return {
        loading: false,
        authInfo: action.authInfo,
    }
}

export const AuthProvider = (props: AuthProviderProps) => {
    const [authInfoState, dispatch] = useReducer(authInfoStateReducer, initialAuthInfoState)
    const [heartbeatCounter, setHeartbeatCounter] = useState<number>(0)
    const [userSelectedOrgId, setUserSelectedOrgId] = useState<string | null>(null)

    const triggerRefreshAuthentication = () => setHeartbeatCounter((x) => x + 1)

    // Create client and register observer
    const client = useMemo(() => {
        // Disable background token refresh as we will do it within React instead
        const client = createClient({ authUrl: props.authUrl, enableBackgroundTokenRefresh: false })
        client.addLoggedInChangeObserver(triggerRefreshAuthentication)
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

        refreshToken()
        return () => {
            didCancel = true
        }
    }, [client, heartbeatCounter])

    useEffect(() => {
        const interval = setInterval(triggerRefreshAuthentication, 60000)
        return () => clearInterval(interval)
    }, [])

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
    const value = {
        loading: authInfoState.loading,
        triggerRefreshAuthentication,
        authInfo: authInfoState.authInfo,
        logout,
        userSelectedOrgId,
        selectOrgId: setUserSelectedOrgId,
        redirectToLoginPage,
        redirectToSignupPage,
        redirectToAccountPage,
        redirectToOrgPage,
        redirectToCreateOrgPage,
    }
    return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
}

export const RequiredAuthProvider = (props: RequiredAuthProviderProps) => {
    const WrappedComponent = withRequiredAuthInfo(
        (props: RequiredAuthProviderProps) => {
            return <React.Fragment>{props.children}</React.Fragment>
        },
        {
            displayWhileLoading: props.displayWhileLoading,
            displayIfLoggedOut: props.displayIfLoggedOut,
        }
    )
    return (
        <AuthProvider authUrl={props.authUrl}>
            <WrappedComponent {...props} />
        </AuthProvider>
    )
}

function getMillisUntilTokenExpires(expiresAtSeconds: number): number {
    let millisUntilTokenExpires = expiresAtSeconds * 1000 - Date.now()
    return Math.max(0, millisUntilTokenExpires)
}
