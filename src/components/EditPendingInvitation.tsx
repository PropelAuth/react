import React, { useState } from "react"
import { Alert } from "../elements/Alert"
import { Button } from "../elements/Button"
import { H3 } from "../elements/H3"
import { useApi } from "../useApi"
import { FORBIDDEN, NOT_FOUND_REVOKE_USER_INVITATION, UNAUTHORIZED, UNEXPECTED_ERROR, X_CSRF_TOKEN } from "./constants"
import { OrgAppearance, UserOrInvitation } from "./ManageOrg"

export type EditPendingInvitationProps = {
    orgId: string
    user: UserOrInvitation
    onClose: VoidFunction
    removeInvitation: (email: string) => void
    appearance?: OrgAppearance
}

export const EditPendingInvitation = ({
    orgId,
    user,
    onClose,
    removeInvitation,
    appearance,
}: EditPendingInvitationProps) => {
    const { orgUserApi } = useApi()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | undefined>(undefined)

    async function revokeInvitation() {
        try {
            setLoading(true)
            setError(undefined)
            const options = { email: user.email, orgId, xCsrfToken: X_CSRF_TOKEN }
            const response = await orgUserApi.revokeUserInvitation(options)
            if (response.ok) {
                removeInvitation(user.email)
                onClose()
            } else {
                response.error._visit({
                    notFoundRevokeUserInvitation: () => setError(NOT_FOUND_REVOKE_USER_INVITATION),
                    forbiddenRevokeUserInvitation: () => setError(FORBIDDEN),
                    unauthorized: () => setError(UNAUTHORIZED),
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
                <H3 appearance={appearance?.elements?.EditUserModalHeader}>Edit {user.email}</H3>
            </div>
            <Button
                loading={loading}
                onClick={revokeInvitation}
                appearance={appearance?.elements?.RevokeInvitationButton}
            >
                Revoke Invitation
            </Button>
            {error && (
                <Alert type={"error"} appearance={appearance?.elements?.ErrorMessage}>
                    {error}
                </Alert>
            )}
        </div>
    )
}
