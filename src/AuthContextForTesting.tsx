import {
    AccessHelper,
    AccessHelperWithOrg,
    AuthenticationInfo,
    OrgHelper,
    OrgIdToOrgMemberInfo,
    OrgIdToOrgMemberInfoClass,
    OrgMemberInfo,
    OrgMemberInfoClass,
    User,
    UserClass,
} from "@propelauth/javascript"
import React from "react"
import { AuthContext } from "./AuthContext"

// User information that we will hard code within the AuthProvider
export type UserInformationForTesting = {
    user: User
    orgMemberInfos: OrgMemberInfo[]
    accessToken?: string
}

export type AuthProviderForTestingProps = {
    loading?: boolean
    userInformation?: UserInformationForTesting
    activeOrgFn?: () => string | null
    children?: React.ReactNode
}

/**
 * A version of the AuthProvider specifically used for testing. It won't make any external requests, but will
 * instead set up the AuthProvider to act as if the information provided was returned from the API.
 */
export const AuthProviderForTesting = ({
    loading,
    userInformation,
    activeOrgFn,
    children,
}: AuthProviderForTestingProps) => {
    const authInfo = getAuthInfoForTesting(userInformation)
    const activeOrgFnWithDefault = activeOrgFn ? activeOrgFn : () => null
    const contextValue = {
        loading: !!loading,
        authInfo,
        logout: () => Promise.resolve(),
        redirectToLoginPage: () => {},
        redirectToSignupPage: () => {},
        redirectToAccountPage: () => {},
        redirectToOrgPage: () => {},
        redirectToCreateOrgPage: () => {},
        redirectToSetupSAMLPage: () => {},
        getLoginPageUrl: () => "",
        getSignupPageUrl: () => "",
        getAccountPageUrl: () => "",
        getOrgPageUrl: () => "",
        getCreateOrgPageUrl: () => "",
        getSetupSAMLPageUrl: () => "",
        activeOrgFn: activeOrgFnWithDefault,
        refreshAuthInfo: () => Promise.resolve(),
    }

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

function getAuthInfoForTesting(userInformation?: UserInformationForTesting): AuthenticationInfo | null {
    if (!userInformation) {
        return null
    }

    const orgIdToOrgMemberInfo: { [orgId: string]: OrgMemberInfo } = {}
    for (const orgMemberInfo of userInformation.orgMemberInfos) {
        orgIdToOrgMemberInfo[orgMemberInfo.orgId] = orgMemberInfo
    }

    const accessTokenWithDefault =
        userInformation.accessToken === undefined ? "PLACEHOLDER_ACCESS_TOKEN" : userInformation.accessToken

    return {
        accessToken: accessTokenWithDefault,
        expiresAtSeconds: 1701596820,
        orgHelper: getOrgHelper(orgIdToOrgMemberInfo),
        accessHelper: getAccessHelper(orgIdToOrgMemberInfo),
        orgIdToOrgMemberInfo: orgIdToOrgMemberInfo,
        user: userInformation.user,
        userClass: new UserClass(userInformation.user, toOrgIdToUserOrgInfo(orgIdToOrgMemberInfo)),
    }
}

function toOrgIdToUserOrgInfo(orgIdToOrgMemberInfo: OrgIdToOrgMemberInfo): OrgIdToOrgMemberInfoClass {
    const orgIdToUserOrgInfo: OrgIdToOrgMemberInfoClass = {}
    for (const orgMemberInfo of Object.values(orgIdToOrgMemberInfo)) {
        orgIdToUserOrgInfo[orgMemberInfo.orgId] = new OrgMemberInfoClass(
            orgMemberInfo.orgId,
            orgMemberInfo.orgName,
            {},
            orgMemberInfo.urlSafeOrgName,
            orgMemberInfo.userAssignedRole,
            orgMemberInfo.userInheritedRolesPlusCurrentRole,
            orgMemberInfo.userPermissions
        )
    }
    return orgIdToUserOrgInfo
}

// These helpers come from @propelauth/javascript, down the road we may want to export them from that library
//   instead of copying
function getOrgHelper(orgIdToOrgMemberInfo: OrgIdToOrgMemberInfo): OrgHelper {
    return {
        getOrg(orgId: string): OrgMemberInfo | undefined {
            if (Object.prototype.hasOwnProperty.call(orgIdToOrgMemberInfo, orgId)) {
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
        getOrgByName(orgName: string): OrgMemberInfo | undefined {
            for (const orgMemberInfo of Object.values(orgIdToOrgMemberInfo)) {
                if (orgMemberInfo.orgName === orgName || orgMemberInfo.urlSafeOrgName === orgName) {
                    return orgMemberInfo
                }
            }
            return undefined
        },
    }
}

function getAccessHelper(orgIdToOrgMemberInfo: OrgIdToOrgMemberInfo): AccessHelper {
    function isRole(orgId: string, role: string): boolean {
        const orgMemberInfo = orgIdToOrgMemberInfo[orgId]
        if (orgMemberInfo === undefined) {
            return false
        }
        return orgMemberInfo.userAssignedRole === role
    }

    function isAtLeastRole(orgId: string, role: string): boolean {
        const orgMemberInfo = orgIdToOrgMemberInfo[orgId]
        if (orgMemberInfo === undefined) {
            return false
        }
        return orgMemberInfo.userInheritedRolesPlusCurrentRole.includes(role)
    }

    function hasPermission(orgId: string, permission: string): boolean {
        const orgMemberInfo = orgIdToOrgMemberInfo[orgId]
        if (orgMemberInfo === undefined) {
            return false
        }
        return orgMemberInfo.userPermissions.includes(permission)
    }

    function hasAllPermissions(orgId: string, permissions: string[]): boolean {
        const orgMemberInfo = orgIdToOrgMemberInfo[orgId]
        if (orgMemberInfo === undefined) {
            return false
        }
        return permissions.every((permission) => orgMemberInfo.userPermissions.includes(permission))
    }

    function getAccessHelperWithOrgId(orgId: string): AccessHelperWithOrg {
        return {
            isRole(role: string): boolean {
                return isRole(orgId, role)
            },
            isAtLeastRole(role: string): boolean {
                return isAtLeastRole(orgId, role)
            },
            hasPermission(permission: string): boolean {
                return hasPermission(orgId, permission)
            },
            hasAllPermissions(permissions: string[]): boolean {
                return hasAllPermissions(orgId, permissions)
            },
        }
    }

    return {
        isRole,
        isAtLeastRole,
        hasPermission,
        hasAllPermissions,
        getAccessHelperWithOrgId,
    }
}
