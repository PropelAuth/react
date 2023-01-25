import { AccessHelper, OrgHelper } from "@propelauth/javascript"
import { useContext } from "react"
import { AuthContext } from "./AuthContext"
import { useAuthInfo } from "./useAuthInfo"

export type UseOrgHelperLoading = {
    loading: true
    orgHelper: null
}

export type UseOrgHelperLoaded = {
    loading: false
    orgHelper: OrgHelper | null
}

export type UseOrgHelper = UseOrgHelperLoading | UseOrgHelperLoaded

export function useOrgHelper(): UseOrgHelper {
    const authInfo = useAuthInfo()

    if (authInfo.loading) {
        return {
            loading: true,
            orgHelper: null,
        }
    } else if (authInfo.isLoggedIn) {
        return {
            loading: false,
            orgHelper: authInfo.orgHelper,
        }
    } else {
        return {
            loading: false,
            orgHelper: null,
        }
    }
}

export type UseAccessHelperLoading = {
    loading: true
    accessHelper: null
}

export type UseAccessHelperLoaded = {
    loading: false
    accessHelper: AccessHelper | null
}

export type UseAccessHelper = UseAccessHelperLoading | UseAccessHelperLoaded

export function useAccessHelper(): UseAccessHelper {
    const authInfo = useAuthInfo()

    if (authInfo.loading) {
        return {
            loading: true,
            accessHelper: null,
        }
    } else if (authInfo.isLoggedIn) {
        return {
            loading: false,
            accessHelper: authInfo.accessHelper,
        }
    } else {
        return {
            loading: false,
            accessHelper: null,
        }
    }
}

export function useAuthUrl() {
    const context = useContext(AuthContext)

    if (context === undefined) {
        throw new Error("useAuthInfo must be used within an AuthProvider or RequiredAuthProvider")
    }

    return { authUrl: context.authUrl }
}

export function useAuthRefresh() {
    const context = useContext(AuthContext)

    if (context === undefined) {
        throw new Error("useAuthRefresh must be used within an AuthProvider or RequiredAuthProvider")
    }

    return { refreshAuth: () => context.setLoggedInChangeCounter((x) => x + 1) }
}
