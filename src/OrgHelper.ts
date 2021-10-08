import { OrgIdToOrgMemberInfo, OrgMemberInfo } from "@propelauth/javascript"

export type OrgHelper = {
    getOrgs: () => OrgMemberInfo[]
    getOrgIds: () => string[]
    getOrg: (orgId: string) => OrgMemberInfo | undefined

    getSelectedOrg: (inferDefault?: boolean) => OrgMemberInfo | undefined
    selectOrg: (orgId: string) => void
    getNotSelectedOrgs: (inferDefault?: boolean) => OrgMemberInfo[]
}

export function getOrgHelper(
    orgIdToOrgMemberInfo: OrgIdToOrgMemberInfo,
    selectOrgId: (orgId: string) => void,
    userSelectedOrgId: string | null
): OrgHelper {
    return {
        getOrg(orgId: string): OrgMemberInfo | undefined {
            if (orgIdToOrgMemberInfo.hasOwnProperty(orgId)) {
                return orgIdToOrgMemberInfo[orgId]
            } else {
                return undefined
            }
        },
        getOrgIds(): string[] {
            return Object.keys(orgIdToOrgMemberInfo)
        },
        getOrgs(): OrgMemberInfo[] {
            return Object.values(orgIdToOrgMemberInfo)
        },
        getSelectedOrg(inferDefault?: boolean): OrgMemberInfo | undefined {
            // default for inferDefault is true
            inferDefault = inferDefault === undefined ? true : inferDefault

            // if the user has selected an org already, return it
            if (userSelectedOrgId && orgIdToOrgMemberInfo.hasOwnProperty(userSelectedOrgId)) {
                return orgIdToOrgMemberInfo[userSelectedOrgId]
            } else if (!inferDefault) {
                return undefined
            }

            // otherwise, infer it from local storage
            const previouslySelectedOrgId = loadOrgSelectionFromLocalStorage()
            if (previouslySelectedOrgId && orgIdToOrgMemberInfo.hasOwnProperty(previouslySelectedOrgId)) {
                return orgIdToOrgMemberInfo[previouslySelectedOrgId]
            }

            // if the user has never selected one before, select one deterministically by name
            let alphabeticallyFirstOrgName = undefined
            let alphabeticallyFirstOrg = undefined
            for (let org of this.getOrgs()) {
                if (!alphabeticallyFirstOrgName || org.orgName < alphabeticallyFirstOrgName) {
                    alphabeticallyFirstOrgName = org.orgName
                    alphabeticallyFirstOrg = org
                }
            }
            return alphabeticallyFirstOrg
        },
        selectOrg(orgId: string): void {
            selectOrgId(orgId)
            saveOrgSelectionToLocalStorage(orgId)
        },
        getNotSelectedOrgs(inferDefault?: boolean): OrgMemberInfo[] {
            const selectedOrg = this.getSelectedOrg(inferDefault)
            if (selectedOrg) {
                return this.getOrgs().filter((org) => org.orgId !== selectedOrg.orgId)
            } else {
                return this.getOrgs()
            }
        },
    }
}

export const ORG_SELECTION_LOCAL_STORAGE_KEY = "__last_selected_org"

function saveOrgSelectionToLocalStorage(orgId: string) {
    if (localStorage) {
        localStorage.setItem(ORG_SELECTION_LOCAL_STORAGE_KEY, orgId)
    }
}

function loadOrgSelectionFromLocalStorage(): string | null {
    if (localStorage) {
        return localStorage.getItem(ORG_SELECTION_LOCAL_STORAGE_KEY)
    }
    return null
}
