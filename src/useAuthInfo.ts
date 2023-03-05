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
}

export type UseAuthInfoLoggedInProps = {
    loading: false
    isLoggedIn: true
    accessToken: string
    user: User
    orgHelper: OrgHelper
    accessHelper: AccessHelper
}

export type UseAuthInfoNotLoggedInProps = {
    loading: false
    isLoggedIn: false
    accessToken: null
    user: null
    orgHelper: null
    accessHelper: null
}

export type UseAuthInfoProps = UseAuthInfoLoading | UseAuthInfoLoggedInProps | UseAuthInfoNotLoggedInProps

export function useAuthInfo(): UseAuthInfoProps {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuthInfo must be used within an AuthProvider or RequiredAuthProvider")
    }

    const { loading, authInfo } = context
    if (loading) {
        return {
            loading: true,
            isLoggedIn: undefined,
            accessToken: undefined,
            orgHelper: undefined,
            accessHelper: undefined,
            user: undefined,
        }
    } else if (authInfo && authInfo.accessToken) {
        return {
            loading: false,
            isLoggedIn: true,
            accessToken: authInfo.accessToken,
            orgHelper: authInfo.orgHelper,
            accessHelper: authInfo.accessHelper,
            user: authInfo.user,
        }
    }
    return {
        loading: false,
        isLoggedIn: false,
        accessToken: null,
        user: null,
        orgHelper: null,
        accessHelper: null,
    }
}
