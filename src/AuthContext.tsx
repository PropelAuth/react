import { AuthenticationInfo, createClient } from "@propelauth/javascript"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import useSWR, { useSWRConfig } from "swr"

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

export const AuthContext = React.createContext<InternalAuthState | undefined>(undefined)

export const AuthProvider = (props: AuthProviderProps) => {
    const [userSelectedOrgId, setUserSelectedOrgId] = useState<string | null>(null)
    const { mutate } = useSWRConfig()

    const triggerRefreshAuthentication = useCallback(async () => {
        return await mutate(props.authUrl)
    }, [props.authUrl])

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

    const { data: authInfo, error } = useSWR(
        client ? props.authUrl : null,
        () => client.getAuthenticationInfoOrNull(true),
        {
            refreshInterval: 10 * 60 * 1000,
            refreshWhenHidden: true,
            revalidateOnMount: true,
        }
    )

    const logout = useCallback(client.logout, [client])
    const redirectToLoginPage = useCallback(client.redirectToLoginPage, [client])
    const redirectToSignupPage = useCallback(client.redirectToSignupPage, [client])
    const redirectToAccountPage = useCallback(client.redirectToAccountPage, [client])
    const redirectToOrgPage = useCallback(client.redirectToOrgPage, [client])
    const redirectToCreateOrgPage = useCallback(client.redirectToCreateOrgPage, [client])
    const loading = authInfo === undefined && !error

    const value = {
        loading,
        triggerRefreshAuthentication,
        authInfo: authInfo || null,
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
