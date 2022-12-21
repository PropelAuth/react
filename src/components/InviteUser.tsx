import React, { FormEvent, ReactNode, useState } from "react"
import { ElementAppearance } from "../AppearanceProvider"
import { Alert, AlertProps } from "../elements/Alert"
import { Button, ButtonProps } from "../elements/Button"
import { Container, ContainerProps } from "../elements/Container"
import { H3, H3Props } from "../elements/H3"
import { Input, InputProps } from "../elements/Input"
import { Label, LabelProps } from "../elements/Label"
import { Select, SelectProps } from "../elements/Select"
import { useApi } from "../useApi"
import { BAD_REQUEST_INVITE_USER, NOT_FOUND_INVITE_USER, UNAUTHORIZED, UNEXPECTED_ERROR } from "./constants"
import { threeDaysFromNow } from "./helpers"
import { Invitation, useSelectedOrg } from "./ManageOrg"

export type InviteUserProps = {
    orgId: string
    onSuccess: (invitation: Invitation) => void
    appearance?: InviteUserAppearance
}

export type InviteUserAppearance = {
    options?: {
        headerContent?: ReactNode
        emailLabel?: ReactNode
        roleLabel?: ReactNode
        submitButtonContent?: ReactNode
    }
    elements?: {
        Container?: ElementAppearance<ContainerProps>
        Header?: ElementAppearance<H3Props>
        EmailLabel?: ElementAppearance<LabelProps>
        EmailInput?: ElementAppearance<InputProps>
        RoleLabel?: ElementAppearance<LabelProps>
        RoleSelect?: ElementAppearance<SelectProps>
        SubmitButton?: ElementAppearance<ButtonProps>
        ErrorMessage?: ElementAppearance<AlertProps>
    }
}

export const InviteUser = ({ orgId, onSuccess, appearance }: InviteUserProps) => {
    const { orgUserApi } = useApi()
    const { inviteePossibleRoles } = useSelectedOrg({ orgId })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | undefined>(undefined)
    const [email, setEmail] = useState("")
    const [role, setRole] = useState("")
    const disabled = !email

    async function handleSubmit(e: FormEvent) {
        try {
            e.preventDefault()
            setLoading(true)
            setError(undefined)
            const options = { email, role, orgId }
            const response = await orgUserApi.inviteUser(options)
            if (response.ok) {
                onSuccess({ email, role, expiresAtSeconds: threeDaysFromNow() })
            } else {
                response.error._visit({
                    notFoundInviteUser: () => setError(NOT_FOUND_INVITE_USER),
                    badRequestInviteUser: () => setError(BAD_REQUEST_INVITE_USER),
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

    if (!inviteePossibleRoles || inviteePossibleRoles.length === 0) {
        return (
            <div data-contain="component">
                <Container appearance={appearance?.elements?.Container}>
                    <span>You do not have permission to invite other users</span>
                </Container>
            </div>
        )
    }

    return (
        <div data-contain="component">
            <Container appearance={appearance?.elements?.Container}>
                <div data-contain="header">
                    <H3 appearance={appearance?.elements?.Header}>
                        {appearance?.options?.headerContent || "Invite User"}
                    </H3>
                </div>
                <div data-contain="form">
                    <form onSubmit={handleSubmit}>
                        <div>
                            <Label htmlFor={"email"} appearance={appearance?.elements?.EmailLabel}>
                                {appearance?.options?.emailLabel || "Email"}
                            </Label>
                            <Input
                                type={"email"}
                                id={"email"}
                                placeholder={"Email"}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                appearance={appearance?.elements?.EmailInput}
                            />
                        </div>
                        <div>
                            <Label htmlFor={"role"} appearance={appearance?.elements?.RoleLabel}>
                                {appearance?.options?.roleLabel || "Role"}
                            </Label>
                            <Select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                options={inviteePossibleRoles.map((role) => {
                                    return { label: role, value: role }
                                })}
                                appearance={appearance?.elements?.RoleSelect}
                            />
                        </div>
                        <Button loading={loading} disabled={disabled} appearance={appearance?.elements?.SubmitButton}>
                            {appearance?.options?.submitButtonContent || "Invite User"}
                        </Button>
                        {error && (
                            <Alert type={"error"} appearance={appearance?.elements?.ErrorMessage}>
                                {error}
                            </Alert>
                        )}
                    </form>
                </div>
            </Container>
        </div>
    )
}
