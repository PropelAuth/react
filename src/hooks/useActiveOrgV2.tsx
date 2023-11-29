import { getActiveOrgId, OrgMemberInfoClass, setActiveOrgId as setActiveOrgIdCookie } from "@propelauth/javascript"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../AuthContext"

const ACTIVE_ORG_ID_LOCAL_STORAGE_KEY = "__ACTIVE_ORG_ID"

interface ActiveOrg {
    activeOrg?: OrgMemberInfoClass
    setActiveOrgId: (orgId: string) => void
    loading: boolean
}

export function useActiveOrgV2(): ActiveOrg {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useActiveOrgV2 must be used within an AuthProvider or RequiredAuthProvider")
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

    const setActiveOrgId = (orgId: string) => {
        const isUserInOrg = authInfo?.userClass.getOrg(orgId)
        if (!isUserInOrg) {
            throw new Error(`User "${authInfo?.userClass.userId}" is not in Org "${orgId}"`)
        }
        setActiveOrgIdCookie(orgId)
        setActiveOrgIdState(orgId)
        localStorage.setItem(ACTIVE_ORG_ID_LOCAL_STORAGE_KEY, Date.now().toString())
    }

    const { loading, authInfo } = context
    if (loading) {
        return {
            loading,
            activeOrg: undefined,
            setActiveOrgId,
        }
    }
    if (!authInfo) {
        return {
            loading: false,
            activeOrg: undefined,
            setActiveOrgId,
        }
    }

    const activeOrg = authInfo.userClass.getOrg(activeOrgIdState || "")

    return { activeOrg, setActiveOrgId, loading: false }
}
