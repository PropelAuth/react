import { getActiveOrgId, setActiveOrgId as setActiveOrgIdCookie } from "@propelauth/javascript"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../AuthContext"

const DEPRECATED_ORG_SELECTION_LOCAL_STORAGE_KEY = "__last_selected_org"
const ACTIVE_ORG_ID_LOCAL_STORAGE_KEY = "__ACTIVE_ORG_ID"

interface ActiveOrg {
    activeOrgId?: string
    setActiveOrgId: (orgId: string) => void
}

export function useActiveOrg(): ActiveOrg | undefined {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useActiveOrg must be used within an AuthProvider or RequiredAuthProvider")
    }

    const [activeOrgIdState, setActiveOrgIdState] = useState<string | undefined>(getActiveOrgId())

    // If a cookie exists for the active org on first load, set it in local storage.
    useEffect(() => {
        const isLocalStorageNotSet = activeOrgIdState && !localStorage.getItem(ACTIVE_ORG_ID_LOCAL_STORAGE_KEY)
        if (isLocalStorageNotSet) {
            localStorage.setItem(ACTIVE_ORG_ID_LOCAL_STORAGE_KEY, Date.now().toString())
        }
    }, [activeOrgIdState])

    const handleLocalStorageChange = () => {
        setActiveOrgIdState(getActiveOrgId())
    }

    useEffect(() => {
        window.addEventListener("storage", handleLocalStorageChange)

        return () => {
            window.removeEventListener("storage", handleLocalStorageChange)
        }
    }, [])

    const { loading, authInfo } = context
    if (loading) {
        return undefined
    }
    if (!authInfo) {
        return undefined
    }

    const setActiveOrgId = (orgId: string) => {
        setActiveOrgIdCookie(orgId)
        setActiveOrgIdState(orgId)
        localStorage.setItem(ACTIVE_ORG_ID_LOCAL_STORAGE_KEY, Date.now().toString())
    }

    return { activeOrgId: activeOrgIdState, setActiveOrgId }
}

/**
 * @deprecated Use `useActiveOrg` instead.
 */
export function saveOrgSelectionToLocalStorage(orgIdOrName: string) {
    if (localStorage) {
        localStorage.setItem(DEPRECATED_ORG_SELECTION_LOCAL_STORAGE_KEY, orgIdOrName)
    }
}

/**
 * @deprecated Use `useActiveOrg` instead.
 */
export function loadOrgSelectionFromLocalStorage(): string | null {
    if (localStorage) {
        return localStorage.getItem(DEPRECATED_ORG_SELECTION_LOCAL_STORAGE_KEY)
    }
    return null
}
