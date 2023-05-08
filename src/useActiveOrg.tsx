import { useContext, useEffect, useState } from "react"
import { AuthContext } from "./AuthContext"
import { emitter } from "./eventEmitter"

const ORG_SELECTION_LOCAL_STORAGE_KEY = "__last_selected_org"
const SET_ACTIVE_ORG_EVENT = "activeOrg"
interface ActiveOrgEventData {
    orgIdOrName: string
}

export function useActiveOrg() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useActiveOrg must be used within an AuthProvider or RequiredAuthProvider")
    }

    if (context.loading || !context.authInfo || !context.authInfo.orgHelper) {
        return null
    }

    const [proposedActiveOrgIdOrName, setProposedActiveOrgIdOrName] = useState(context.activeOrgFn())

    useEffect(() => {
        const listener = emitter.addListener(SET_ACTIVE_ORG_EVENT, (data: ActiveOrgEventData) => {
            setProposedActiveOrgIdOrName(data.orgIdOrName)
        })

        return () => {
            listener.remove()
        }
    }, [])

    if (!proposedActiveOrgIdOrName) {
        return null
    }

    const orgHelper = context.authInfo.orgHelper
    return orgHelper.getOrg(proposedActiveOrgIdOrName) || orgHelper.getOrgByName(proposedActiveOrgIdOrName)
}

export function saveOrgSelectionToLocalStorage(orgIdOrName: string) {
    if (localStorage) {
        const eventData: ActiveOrgEventData = { orgIdOrName }
        emitter.emit(SET_ACTIVE_ORG_EVENT, eventData)
        localStorage.setItem(ORG_SELECTION_LOCAL_STORAGE_KEY, orgIdOrName)
    }
}

export function loadOrgSelectionFromLocalStorage(): string | null {
    if (localStorage) {
        return localStorage.getItem(ORG_SELECTION_LOCAL_STORAGE_KEY)
    }
    return null
}
