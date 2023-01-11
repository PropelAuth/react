import React, { FormEvent, useState } from "react"
import { Alert } from "../elements/Alert"
import { Button } from "../elements/Button"
import { H3 } from "../elements/H3"
import { Label } from "../elements/Label"
import { Select } from "../elements/Select"
import { useApi } from "../useApi"
import { useRedirectFunctions } from "../useRedirectFunctions"
import {
    BAD_REQUEST,
    FORBIDDEN,
    NOT_FOUND_CHANGE_ROLE,
    NOT_FOUND_REMOVE_USER,
    UNEXPECTED_ERROR,
    X_CSRF_TOKEN,
} from "./constants"
import { OrgAppearance, User } from "./ManageOrg"

export type EditOrgUserProps = {
    orgId: string
    user: User
    onClose: VoidFunction
    setUserRole: (userId: string, role: string) => void
    removeUser: (userId: string) => void
    appearance?: OrgAppearance
}

export const EditOrgUser = ({ orgId, user, onClose, setUserRole, removeUser, appearance }: EditOrgUserProps) => {
    const { orgUserApi } = useApi()
    const { redirectToLoginPage } = useRedirectFunctions()
    const [role, setRole] = useState(user.role)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | undefined>(undefined)
    const changeRoleDisabled = !user.possibleRoles || user.possibleRoles.length === 0

    function getRoleOptions() {
        if (user.possibleRoles && user.possibleRoles.length > 0) {
            return user.possibleRoles.map((role) => {
                return { label: role, value: role }
            })
        } else {
            return [{ label: role, value: role }]
        }
    }

    async function handleRoleChange(e: FormEvent) {
        try {
            e.preventDefault()
            setLoading(true)
            setError(undefined)
            const options = { role, orgId, userId: user.userId, xCsrfToken: X_CSRF_TOKEN }
            const response = await orgUserApi.changeRole(options)
            if (response.ok) {
                setUserRole(user.userId, role)
                onClose()
            } else {
                response.error._visit({
                    unauthorized: redirectToLoginPage,
                    badChangeRoleRequest: (err) => setError(err.role?.join(", ") || BAD_REQUEST),
                    notFoundChangeRole: () => setError(NOT_FOUND_CHANGE_ROLE),
                    forbiddenErrorChangeRole: () => setError(FORBIDDEN),
                    _other: () => setError(UNEXPECTED_ERROR),
                })
            }
        } catch (e) {
            setError(UNEXPECTED_ERROR)
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    async function handleRemoveUser() {
        try {
            setLoading(true)
            setError(undefined)
            const options = { orgId, userId: user.userId, xCsrfToken: X_CSRF_TOKEN }
            const response = await orgUserApi.removeUser(options)
            if (response.ok) {
                removeUser(user.userId)
                onClose()
            } else {
                response.error._visit({
                    notFoundRemoveUser: () => setError(NOT_FOUND_REMOVE_USER),
                    forbiddenRemoveUser: () => setError(FORBIDDEN),
                    unauthorized: redirectToLoginPage,
                    _other: () => setError(UNEXPECTED_ERROR),
                })
            }
        } catch (e) {
            setError(UNEXPECTED_ERROR)
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div data-contain="modal">
            <div data-contain="header">
                <H3 appearance={appearance?.elements?.EditUserModalHeader}>
                    {appearance?.options?.editUserModalHeaderContent || `Edit ${user.email}`}
                </H3>
            </div>
            <div data-contain="form">
                <form onSubmit={handleRoleChange}>
                    <Label htmlFor={"change_role"} appearance={appearance?.elements?.ChangeRoleLabel}>
                        {appearance?.options?.changeRoleLabel || "Change role"}
                    </Label>
                    <Select
                        id={"change_role"}
                        options={getRoleOptions()}
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        disabled={changeRoleDisabled}
                        appearance={appearance?.elements?.ChangeRoleSelect}
                    />
                    <Button
                        loading={loading}
                        disabled={user.role === role}
                        appearance={appearance?.elements?.ChangeRoleButton}
                    >
                        {appearance?.options?.changeRoleButtonContent || "Save"}
                    </Button>
                </form>
            </div>
            {user.canBeDeleted && (
                <Button
                    loading={loading}
                    onClick={handleRemoveUser}
                    appearance={appearance?.elements?.RemoveUserButton}
                >
                    {appearance?.options?.removeUserButtonContent || "Remove user"}
                </Button>
            )}
            {error && (
                <Alert type={"error"} appearance={appearance?.elements?.ErrorMessage}>
                    {error}
                </Alert>
            )}
        </div>
    )
}
