import { AccessHelper, OrgHelper, User } from "@propelauth/javascript"
import { useContext } from "react"
import { AuthContext } from "./AuthContext"

export type UseAuthInfoLoading = {
    loading: true
    isLoggedIn: undefined
    accessToken: undefined
    user: undefined
    orgHelper: undefined
    accessHelper: undefined
    refreshAuthInfo: () => Promise<void>
}

export type UseAuthInfoLoggedInProps = {
    loading: false
    isLoggedIn: true
    accessToken: string
    user: User
    orgHelper: OrgHelper
    accessHelper: AccessHelper
    refreshAuthInfo: () => Promise<void>
}

export type UseAuthInfoNotLoggedInProps = {
    loading: false
    isLoggedIn: false
    accessToken: null
    user: null
    orgHelper: null
    accessHelper: null
    refreshAuthInfo: () => Promise<void>
}

export type UseAuthInfoProps = UseAuthInfoLoading | UseAuthInfoLoggedInProps | UseAuthInfoNotLoggedInProps

export function useAuthInfo(): UseAuthInfoProps {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuthInfo must be used within an AuthProvider or RequiredAuthProvider")
    }

    const { loading, authInfo, refreshAuthInfo } = context
    if (loading) {
        return {
            loading: true,
            isLoggedIn: undefined,
            accessToken: undefined,
            orgHelper: undefined,
            accessHelper: undefined,
            user: undefined,
            refreshAuthInfo,
        }
    } else if (authInfo && authInfo.accessToken) {
        return {
            loading: false,
            isLoggedIn: true,
            accessToken: authInfo.accessToken,
            orgHelper: authInfo.orgHelper,
            accessHelper: authInfo.accessHelper,
            user: authInfo.user,
            refreshAuthInfo,
        }
    }
    return {
        loading: false,
        isLoggedIn: false,
        accessToken: null,
        user: null,
        orgHelper: null,
        accessHelper: null,
        refreshAuthInfo,
    }
}
