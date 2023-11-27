import { getActiveOrgId, setActiveOrgId as setActiveOrgIdCookie } from "@propelauth/javascript"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../AuthContext"

const ORG_SELECTION_LOCAL_STORAGE_KEY = "__last_selected_org"
const ACTIVE_ORG_ID_LOCAL_STORAGE_KEY = "__ACTIVE_ORG_ID"

export function useActiveOrg() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useActiveOrg must be used within an AuthProvider or RequiredAuthProvider")
    }
    const [activeOrgIdState, setActiveOrgIdState] = useState<string | undefined>(getActiveOrgId())

    const handleLocalStorageChange = () => {
        setActiveOrgIdState(localStorage.getItem(ACTIVE_ORG_ID_LOCAL_STORAGE_KEY) ?? undefined)
    }

    const setActiveOrgId = (orgId: string) => {
        setActiveOrgIdCookie(orgId)
        setActiveOrgIdState(orgId)
        localStorage.setItem(ACTIVE_ORG_ID_LOCAL_STORAGE_KEY, orgId)
    }

    // If a cookie exists for the active org on first load, set it in local storage.
    useEffect(() => {
        const isLocalStorageNotSet = activeOrgIdState && !localStorage.getItem(ACTIVE_ORG_ID_LOCAL_STORAGE_KEY)
        if (isLocalStorageNotSet) {
            localStorage.setItem(ACTIVE_ORG_ID_LOCAL_STORAGE_KEY, activeOrgIdState)
        }
    }, [activeOrgIdState])

    useEffect(() => {
        window.addEventListener("storage", handleLocalStorageChange)

        return () => {
            window.removeEventListener("storage", handleLocalStorageChange)
        }
    }, [])

    return { activeOrgId: activeOrgIdState, setActiveOrgId }
}

/**
 * @deprecated Use useActiveOrg instead.
 */
export function saveOrgSelectionToLocalStorage(orgIdOrName: string) {
    if (localStorage) {
        localStorage.setItem(ORG_SELECTION_LOCAL_STORAGE_KEY, orgIdOrName)
    }
}

/**
 * @deprecated Use useActiveOrg instead.
 */
export function loadOrgSelectionFromLocalStorage(): string | null {
    if (localStorage) {
        return localStorage.getItem(ORG_SELECTION_LOCAL_STORAGE_KEY)
    }
    return null
}
