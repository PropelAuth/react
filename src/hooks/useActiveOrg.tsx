import { useContext } from "react"
import { AuthContext } from "../AuthContext"

const DEPRECATED_ORG_SELECTION_LOCAL_STORAGE_KEY = "__last_selected_org"

/**
 * @deprecated This hook is deprecated and no longer supported.
 */
export function useActiveOrg() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useActiveOrg must be used within an AuthProvider or RequiredAuthProvider")
    }

    if (context.loading || !context.authInfo || !context.authInfo.orgHelper) {
        return null
    }

    const proposedActiveOrgIdOrName = context.activeOrgFn()
    if (!proposedActiveOrgIdOrName) {
        return null
    }

    const orgHelper = context.authInfo.orgHelper
    return orgHelper.getOrg(proposedActiveOrgIdOrName) || orgHelper.getOrgByName(proposedActiveOrgIdOrName)
}

export function saveOrgSelectionToLocalStorage(orgIdOrName: string) {
    if (localStorage) {
        localStorage.setItem(DEPRECATED_ORG_SELECTION_LOCAL_STORAGE_KEY, orgIdOrName)
    }
}

export function loadOrgSelectionFromLocalStorage(): string | null {
    if (localStorage) {
        return localStorage.getItem(DEPRECATED_ORG_SELECTION_LOCAL_STORAGE_KEY)
    }
    return null
}
