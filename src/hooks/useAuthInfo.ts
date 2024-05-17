import { AccessHelper, AccessTokenForActiveOrg, OrgHelper, User, UserClass } from "@propelauth/javascript"
import { useContext } from "react"
import { AuthContext } from "../AuthContext"

export type UseAuthInfoLoading = {
    loading: true
    isLoggedIn: undefined
    accessToken: undefined
    user: undefined
    userClass: undefined
    orgHelper: undefined
    accessHelper: undefined
    isImpersonating: undefined
    impersonatorUserId: undefined
    refreshAuthInfo: () => Promise<void>
    getAccessTokenForOrg: (orgId: string) => Promise<AccessTokenForActiveOrg>
    accessTokenExpiresAtSeconds: undefined
}

export type UseAuthInfoLoggedInProps = {
    loading: false
    isLoggedIn: true
    accessToken: string
    user: User
    userClass: UserClass
    orgHelper: OrgHelper
    accessHelper: AccessHelper
    isImpersonating: boolean
    impersonatorUserId?: string
    refreshAuthInfo: () => Promise<void>
    getAccessTokenForOrg: (orgId: string) => Promise<AccessTokenForActiveOrg>
    accessTokenExpiresAtSeconds: number
}

export type UseAuthInfoNotLoggedInProps = {
    loading: false
    isLoggedIn: false
    accessToken: null
    user: null
    userClass: null
    orgHelper: null
    accessHelper: null
    isImpersonating: false
    impersonatorUserId: undefined
    refreshAuthInfo: () => Promise<void>
    getAccessTokenForOrg: (orgId: string) => Promise<AccessTokenForActiveOrg>
    accessTokenExpiresAtSeconds: undefined
}

export type UseAuthInfoProps = UseAuthInfoLoading | UseAuthInfoLoggedInProps | UseAuthInfoNotLoggedInProps

export function useAuthInfo(): UseAuthInfoProps {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuthInfo must be used within an AuthProvider or RequiredAuthProvider")
    }

    const { loading, authInfo, refreshAuthInfo, getAccessTokenForOrg } = context
    if (loading) {
        return {
            loading: true,
            isLoggedIn: undefined,
            accessToken: undefined,
            orgHelper: undefined,
            accessHelper: undefined,
            user: undefined,
            userClass: undefined,
            isImpersonating: undefined,
            impersonatorUserId: undefined,
            refreshAuthInfo,
            getAccessTokenForOrg,
            accessTokenExpiresAtSeconds: undefined,
        }
    } else if (authInfo && authInfo.accessToken) {
        return {
            loading: false,
            isLoggedIn: true,
            accessToken: authInfo.accessToken,
            orgHelper: authInfo.orgHelper,
            accessHelper: authInfo.accessHelper,
            user: authInfo.user,
            userClass: authInfo.userClass,
            isImpersonating: !!authInfo.impersonatorUserId,
            impersonatorUserId: authInfo.impersonatorUserId,
            refreshAuthInfo,
            getAccessTokenForOrg,
            accessTokenExpiresAtSeconds: authInfo.expiresAtSeconds,
        }
    }
    return {
        loading: false,
        isLoggedIn: false,
        accessToken: null,
        user: null,
        userClass: null,
        orgHelper: null,
        accessHelper: null,
        isImpersonating: false,
        impersonatorUserId: undefined,
        refreshAuthInfo,
        getAccessTokenForOrg,
        accessTokenExpiresAtSeconds: undefined,
    }
}
