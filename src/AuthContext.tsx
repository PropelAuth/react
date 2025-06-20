import {
    AccessTokenForActiveOrg,
    AuthenticationInfo,
    RedirectToAccountOptions,
    RedirectToCreateOrgOptions,
    RedirectToLoginOptions,
    RedirectToOrgPageOptions,
    RedirectToSetupSAMLPageOptions,
    RedirectToSignupOptions,
    OrgMemberInfoClass
} from "@propelauth/javascript"
import React, { useCallback, useEffect, useReducer, useState } from "react"
import { loadOrgSelectionFromLocalStorage } from "./hooks/useActiveOrg"
import { useClientRef, useClientRefCallback } from "./useClientRef"

export interface Tokens {
    getAccessTokenForOrg: (orgId: string) => Promise<AccessTokenForActiveOrg>
    getAccessToken: () => Promise<string | undefined>
}

export interface InternalAuthState {
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

    authUrl: string

    tokens: Tokens

    activeOrg: OrgMemberInfoClass | undefined
    setActiveOrg: (orgId: string) => Promise<boolean>

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
    minSecondsBeforeRefresh?: number
    useLocalStorageForActiveOrg?: boolean
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
    } else if (_state?.authInfo?.accessToken !== action.authInfo?.accessToken) {
        return {
            loading: false,
            authInfo: action.authInfo,
        }
    } else {
        return _state
    }
}

const ACTIVE_ORG_KEY = 'activeOrgId';

const getStoredActiveOrgId = (): string | null => {
    try {
        return localStorage.getItem(ACTIVE_ORG_KEY);
    } catch (error) {
        console.warn('Failed to read from localStorage:', error);
        return null;
    }
};

const setStoredActiveOrgId = (orgId: string): void => {
    try {
        localStorage.setItem(ACTIVE_ORG_KEY, orgId);
    } catch (error) {
        console.warn('Failed to write to localStorage:', error);
    }
};

const removeStoredActiveOrgId = (): void => {
    try {
        localStorage.removeItem(ACTIVE_ORG_KEY);
    } catch (error) {
        console.warn('Failed to remove from localStorage:', error);
    }
};

const useLocalStorageSync = (key: string): string | null => {
    const [value, setValue] = useState<string | null>(() => {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.warn('Failed to read from localStorage:', error);
            return null;
        }
    });

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === key) {
                setValue(e.newValue);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [key]);

    return value;
};

export const AuthProvider = (props: AuthProviderProps) => {
    const {
        authUrl,
        minSecondsBeforeRefresh,
        getActiveOrgFn: deprecatedGetActiveOrgFn,
        children,
        defaultDisplayWhileLoading,
        defaultDisplayIfLoggedOut,
        useLocalStorageForActiveOrg
    } = props
    const storedActiveOrgId = useLocalStorageSync(ACTIVE_ORG_KEY);
    const [authInfoState, dispatch] = useReducer(authInfoStateReducer, initialAuthInfoState)
    const [activeOrg, setActiveOrgState] = useState<OrgMemberInfoClass | undefined>();
    const { clientRef, accessTokenChangeCounter } = useClientRef({
        authUrl,
        minSecondsBeforeRefresh,
    })

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

    // Re-render when stored active org is updated
    useEffect(() => {
        if (storedActiveOrgId && useLocalStorageForActiveOrg) {
            setActiveOrg(storedActiveOrgId)
        }
    }, [storedActiveOrgId])

    // Deprecation warning
    useEffect(() => {
        if (deprecatedGetActiveOrgFn) {
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

    const getAccessTokenForOrg = useClientRefCallback(clientRef, (client) => client.getAccessTokenForOrg)
    const getAccessToken = useClientRefCallback(clientRef, (client) => {
        return async () => {
            const authInfo = await client.getAuthenticationInfoOrNull()
            return authInfo?.accessToken
        }
    })

    const refreshAuthInfo = useCallback(async () => {
        if (clientRef.current === null) {
            return
        }

        const client = clientRef.current.client
        const authInfo = await client.getAuthenticationInfoOrNull(true)
        dispatch({ authInfo })
    }, [dispatch])


    const setActiveOrg = async (orgId: string) => {
        if (authInfoState.authInfo === null) {
            return false
        }

        const authInfo = authInfoState.authInfo
        const userClass = authInfo?.userClass

        if (userClass.getOrg(orgId)) {
            if (useLocalStorageForActiveOrg) {
                setStoredActiveOrgId(orgId);
            }
            setActiveOrgState(userClass.getOrg(orgId));
            return true
        } else {
            if (useLocalStorageForActiveOrg) {
                removeStoredActiveOrgId();
            }
            setActiveOrgState(undefined);
            return false
        }
    };

    const getActiveOrg = () => {
        if (authInfoState.authInfo === null) {
            return undefined
        }

        const authInfo = authInfoState.authInfo
        const userClass = authInfo?.userClass

        if (!activeOrg && useLocalStorageForActiveOrg) {
            const activeOrgIdFromLocalStorage = getStoredActiveOrgId()
            if (activeOrgIdFromLocalStorage) {
                return userClass.getOrg(activeOrgIdFromLocalStorage)
            }
        }
        
        if (activeOrg && userClass.getOrg(activeOrg.orgId)) {
            return activeOrg
        } else {
            return undefined
        }
    }

    

    // TODO: Remove this, as both `getActiveOrgFn` and `loadOrgSelectionFromLocalStorage` are deprecated.
    const deprecatedActiveOrgFn = deprecatedGetActiveOrgFn || loadOrgSelectionFromLocalStorage

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
        authUrl,
        refreshAuthInfo,
        activeOrg: getActiveOrg(),
        setActiveOrg,
        tokens: {
            getAccessTokenForOrg,
            getAccessToken,
        },
    }
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
