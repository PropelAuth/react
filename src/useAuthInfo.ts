import { User } from "@propelauth/javascript"
import { useContext } from "react"
import { AuthContext } from "./AuthContext"
import { getOrgHelper, OrgHelper } from "./OrgHelper"

export type UseAuthInfoLoading = {
    loading: true
}

export type UseAuthInfoLoggedInProps = {
    loading: false
    isLoggedIn: true
    accessToken: string
    user: User
    orgHelper: OrgHelper
}

export type UseAuthInfoNotLoggedInProps = {
    loading: false
    isLoggedIn: false
    accessToken: null
    user: null
    orgHelper: null
}

export type UseAuthInfoProps = UseAuthInfoLoading | UseAuthInfoLoggedInProps | UseAuthInfoNotLoggedInProps

export function useAuthInfo(): UseAuthInfoProps {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuthInfo must be used within an AuthProvider")
    }

    const { loading, authInfo, selectOrgId, userSelectedOrgId } = context
    if (loading) {
        return {
            loading: true,
        }
    } else if (authInfo && authInfo.accessToken) {
        const orgHelper = getOrgHelper(authInfo.orgIdToOrgMemberInfo || {}, selectOrgId, userSelectedOrgId)
        return {
            loading: false,
            isLoggedIn: true,
            accessToken: authInfo.accessToken,
            orgHelper: orgHelper,
            user: authInfo.user,
        }
    }
    return {
        loading: false,
        isLoggedIn: false,
        accessToken: null,
        orgHelper: null,
        user: null,
    }
}
