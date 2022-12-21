import React, { useState } from "react"
import { Alert } from "../elements/Alert"
import { Button } from "../elements/Button"
import { H3 } from "../elements/H3"
import { useApi } from "../useApi"
import {
    BAD_REQUEST_INVITE_USER,
    FORBIDDEN,
    NOT_FOUND_INVITE_USER,
    NOT_FOUND_REVOKE_USER_INVITATION,
    UNAUTHORIZED,
    UNEXPECTED_ERROR,
} from "./constants"
import { threeDaysFromNow } from "./helpers"
import { Invitation, OrgAppearance, UserOrInvitation } from "./ManageOrg"

export type EditExpiredInvitationProps = {
    orgId: string
    user: UserOrInvitation
    onClose: VoidFunction
    addInvitation: (invitation: Invitation) => void
    removeInvitation: (email: string) => void
    appearance?: OrgAppearance
}

export const EditExpiredInvitation = ({
    orgId,
    user,
    onClose,
    addInvitation,
    removeInvitation,
    appearance,
}: EditExpiredInvitationProps) => {
    const { orgUserApi } = useApi()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | undefined>(undefined)

    async function deleteInvitation() {
        try {
            setLoading(true)
            setError(undefined)
            const options = { email: user.email, orgId }
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

    async function resendInvitation() {
        try {
            setLoading(true)
            setError(undefined)
            const options = { email: user.email, orgId }
            const response = await orgUserApi.revokeUserInvitation(options)
            if (response.ok) {
                removeInvitation(user.email)
                const inviteOptions = { role: user.role, ...options }
                const invite = await orgUserApi.inviteUser(inviteOptions)
                if (invite.ok) {
                    addInvitation({
                        email: user.email,
                        role: user.role,
                        expiresAtSeconds: threeDaysFromNow(),
                    })
                    onClose()
                } else {
                    invite.error._visit({
                        notFoundInviteUser: () => setError(NOT_FOUND_INVITE_USER),
                        badRequestInviteUser: () => setError(BAD_REQUEST_INVITE_USER),
                        unauthorized: () => setError(UNAUTHORIZED),
                        _other: () => setError(UNEXPECTED_ERROR),
                    })
                }
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
                <H3 appearance={appearance?.elements?.EditUserModalHeader}>
                    {appearance?.options?.editUserModalHeaderContent || `Edit ${user.email}`}
                </H3>
            </div>
            <Button
                loading={loading}
                onClick={resendInvitation}
                appearance={appearance?.elements?.ResendInvitationButton}
            >
                {appearance?.options?.resendInvitationButtonContent || "Resend Invitation"}
            </Button>
            <Button
                loading={loading}
                onClick={deleteInvitation}
                appearance={appearance?.elements?.DeleteInvitationButton}
            >
                {appearance?.options?.deleteInvitationButtonContent || "Delete Invitation"}
            </Button>
            {error && (
                <Alert type={"error"} appearance={appearance?.elements?.ErrorMessage}>
                    {error}
                </Alert>
            )}
        </div>
    )
}