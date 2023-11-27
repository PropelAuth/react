import { getActiveOrgId, setActiveOrgId } from "@propelauth/javascript"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../AuthContext"

const ORG_SELECTION_LOCAL_STORAGE_KEY = "__last_selected_org"

export function useActiveOrg() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useActiveOrg must be used within an AuthProvider or RequiredAuthProvider")
    }
    const [activeOrgIdState, setActiveOrgIdState] = useState<string | undefined>(getActiveOrgId())

    useEffect(() => {
        const intervalId = setInterval(() => {
            const currentCookieValue = getActiveOrgId()
            if (currentCookieValue !== activeOrgIdState) {
                setActiveOrgIdState(currentCookieValue)
            }
            // TODO: What should this value be?
        }, 500)

        return () => {
            clearInterval(intervalId)
        }
    }, [activeOrgIdState])

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
