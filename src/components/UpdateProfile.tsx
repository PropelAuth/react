import { UpdatePasswordRequest } from "@propel-auth-fern/fe_v2-client/resources"
import React, { FormEvent, ReactNode, useState } from "react"
import { ElementAppearance } from "../AppearanceProvider"
import { Alert, AlertProps } from "../elements/Alert"
import { Button, ButtonProps } from "../elements/Button"
import { Container, ContainerProps } from "../elements/Container"
import { Input, InputProps } from "../elements/Input"
import { Label, LabelProps } from "../elements/Label"
import { Modal, ModalProps } from "../elements/Modal"
import { Paragraph, ParagraphProps } from "../elements/Paragraph"
import { useApi } from "../useApi"
import { useConfig } from "../useConfig"
import { useRedirectFunctions } from "../useRedirectFunctions"
import {
    BAD_REQUEST_UPDATE_EMAIL,
    BAD_REQUEST_UPDATE_PASSWORD,
    BAD_REQUEST_UPDATE_USERNAME,
    NOT_FOUND_UPDATE_EMAIL,
    NOT_FOUND_UPDATE_NAME,
    NOT_FOUND_UPDATE_PASSWORD,
    NOT_FOUND_UPDATE_USERNAME,
    TOO_MANY_REQUESTS,
    UNEXPECTED_ERROR,
    UPDATE_NAME_SUCCESS,
    UPDATE_USERNAME_SUCCESS,
    X_CSRF_TOKEN,
} from "./constants"

export type UpdateProfileProps = {
    appearance?: UpdateProfileAppearance
}

export type UpdateProfileAppearance = {
    options?: {
        emailLabel?: ReactNode
        updateEmailButtonContent?: ReactNode
        firstNameLabel?: ReactNode
        lastNameLabel?: ReactNode
        updateNameButtonContent?: ReactNode
        usernameLabel?: ReactNode
        updateUsernameButtonContent?: ReactNode
        oldPasswordLabel?: ReactNode
        newPasswordLabel?: ReactNode
        updatePasswordButtonContent?: ReactNode
    }
    elements?: {
        Container?: ElementAppearance<ContainerProps>
        EmailLabel?: ElementAppearance<LabelProps>
        EmailInput?: ElementAppearance<InputProps>
        SubmitEmailButton?: ElementAppearance<ButtonProps>
        EmailModal?: ElementAppearance<ModalProps>
        EmailModalText?: ElementAppearance<ParagraphProps>
        EmailModalCloseButton?: ElementAppearance<ButtonProps>
        FirstNameLabel?: ElementAppearance<LabelProps>
        FirstNameInput?: ElementAppearance<InputProps>
        LastNameLabel?: ElementAppearance<LabelProps>
        LastNameInput?: ElementAppearance<InputProps>
        SubmitNameButton?: ElementAppearance<ButtonProps>
        UsernameLabel?: ElementAppearance<LabelProps>
        UsernameInput?: ElementAppearance<InputProps>
        SubmitUsernameButton?: ElementAppearance<ButtonProps>
        OldPasswordLabel?: ElementAppearance<LabelProps>
        OldPasswordInput?: ElementAppearance<InputProps>
        NewPasswordLabel?: ElementAppearance<LabelProps>
        NewPasswordInput?: ElementAppearance<InputProps>
        SubmitPasswordButton?: ElementAppearance<ButtonProps>
        SuccessMessage?: ElementAppearance<AlertProps>
        ErrorMessage?: ElementAppearance<AlertProps>
    }
}

export const UpdateProfile = ({ appearance }: UpdateProfileProps) => {
    const { config } = useConfig()
    return (
        <div data-contain="component">
            <Container appearance={appearance?.elements?.Container}>
                <UpdateEmail appearance={appearance} />
                {config && config.requireUsersToSetName && <UpdateName appearance={appearance} />}
                {config && config.requireUsersToSetUsername && <UpdateUsername appearance={appearance} />}
                <UpdatePassword appearance={appearance} />
            </Container>
        </div>
    )
}

export type UpdateEmailProps = {
    appearance?: UpdateProfileAppearance
}

export const UpdateEmail = ({ appearance }: UpdateEmailProps) => {
    const { userApi } = useApi()
    const [email, setEmail] = useState("") // get from useAuthInfo
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | undefined>(undefined)
    const [showConfirmationModal, setShowConfirmationModal] = useState(false)

    async function handleSubmit(event: FormEvent) {
        try {
            event.preventDefault()
            setLoading(true)
            const res = await userApi.updateEmail({ newEmail: email, xCsrfToken: X_CSRF_TOKEN })
            if (res.ok) {
                setShowConfirmationModal(true)
            } else {
                res.error._visit({
                    notFoundUpdateEmail: () => setError(NOT_FOUND_UPDATE_EMAIL),
                    badRequestUpdateEmail: () => setError(BAD_REQUEST_UPDATE_EMAIL),
                    tooManyRequests: () => setError(TOO_MANY_REQUESTS),
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
        <div data-contain="section">
            <form onSubmit={handleSubmit}>
                <div>
                    <Label htmlFor={"email"} appearance={appearance?.elements?.EmailLabel}>
                        {appearance?.options?.emailLabel || "Email"}
                    </Label>
                    <Input
                        id={"email"}
                        type={"email"}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        appearance={appearance?.elements?.EmailInput}
                    />
                </div>
                <Button loading={loading} appearance={appearance?.elements?.SubmitEmailButton}>
                    {appearance?.options?.updateEmailButtonContent || "Update Email"}
                </Button>
                {error && (
                    <Alert type={"error"} appearance={appearance?.elements?.ErrorMessage}>
                        {error}
                    </Alert>
                )}
            </form>
            <Modal
                show={showConfirmationModal}
                setShow={setShowConfirmationModal}
                appearance={appearance?.elements?.EmailModal}
            >
                <Paragraph appearance={appearance?.elements?.EmailModalText}>
                    {`We sent a confirmation email to ${email}. Please check your inbox to verify your email.`}
                </Paragraph>
                <Button
                    onClick={() => setShowConfirmationModal(false)}
                    appearance={appearance?.elements?.EmailModalCloseButton}
                >
                    Ok
                </Button>
            </Modal>
        </div>
    )
}

export type UpdateNameProps = {
    appearance?: UpdateProfileAppearance
}

export const UpdateName = ({ appearance }: UpdateNameProps) => {
    const { userApi } = useApi()
    const { redirectToLoginPage } = useRedirectFunctions()
    const [firstName, setFirstName] = useState("") // GET FROM METADATA
    const [lastName, setLastName] = useState("") // GET FROM METADATA
    const [loading, setLoading] = useState(false)
    const [firstNameError, setFirstNameError] = useState<string | undefined>(undefined)
    const [lastNameError, setLastNameError] = useState<string | undefined>(undefined)
    const [error, setError] = useState<string | undefined>(undefined)
    const [success, setSuccess] = useState<string | undefined>(undefined)

    function clearErrors() {
        setError(undefined)
        setFirstNameError(undefined)
        setLastNameError(undefined)
    }

    async function handleSubmit(event: FormEvent) {
        try {
            event.preventDefault()
            setLoading(true)
            clearErrors()
            const res = await userApi.updateName({ firstName, lastName, xCsrfToken: X_CSRF_TOKEN })
            if (res.ok) {
                setSuccess(UPDATE_NAME_SUCCESS)
            } else {
                res.error._visit({
                    unauthorized: redirectToLoginPage,
                    badRequestUpdateName: (err) => {
                        setFirstNameError(err.firstName?.join(", "))
                        setLastNameError(err.lastName?.join(", "))
                    },
                    notFoundUpdateName: () => setError(NOT_FOUND_UPDATE_NAME),
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
        <div data-contain="section">
            <form onSubmit={handleSubmit}>
                <div>
                    <Label htmlFor={"first_name"} appearance={appearance?.elements?.FirstNameLabel}>
                        {appearance?.options?.firstNameLabel || "First name"}
                    </Label>
                    <Input
                        id={"first_name"}
                        type={"text"}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        appearance={appearance?.elements?.FirstNameInput}
                    />
                    {firstNameError && (
                        <Alert type={"error"} appearance={appearance?.elements?.ErrorMessage}>
                            {firstNameError}
                        </Alert>
                    )}
                </div>
                <div>
                    <Label htmlFor={"last_name"} appearance={appearance?.elements?.LastNameLabel}>
                        {appearance?.options?.lastNameLabel || "Last name"}
                    </Label>
                    <Input
                        id={"last_name"}
                        type={"text"}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        appearance={appearance?.elements?.LastNameInput}
                    />
                    {lastNameError && (
                        <Alert type={"error"} appearance={appearance?.elements?.ErrorMessage}>
                            {lastNameError}
                        </Alert>
                    )}
                </div>
                <Button loading={loading} appearance={appearance?.elements?.SubmitNameButton}>
                    {appearance?.options?.updateNameButtonContent || "Update Name"}
                </Button>
                {success && (
                    <Alert type={"success"} appearance={appearance?.elements?.SuccessMessage}>
                        {success}
                    </Alert>
                )}
                {error && (
                    <Alert type={"error"} appearance={appearance?.elements?.ErrorMessage}>
                        {error}
                    </Alert>
                )}
            </form>
        </div>
    )
}

export type UpdateUsernameProps = {
    appearance?: UpdateProfileAppearance
}

export const UpdateUsername = ({ appearance }: UpdateUsernameProps) => {
    const { userApi } = useApi()
    const { redirectToLoginPage } = useRedirectFunctions()
    const [username, setUsername] = useState("") // get from user metadata
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | undefined>(undefined)
    const [success, setSuccess] = useState<string | undefined>(undefined)

    async function handleSubmit(event: FormEvent) {
        try {
            event.preventDefault()
            setLoading(true)
            const res = await userApi.updateUsername({ username, xCsrfToken: X_CSRF_TOKEN })
            if (res.ok) {
                setSuccess(UPDATE_USERNAME_SUCCESS)
            } else {
                res.error._visit({
                    unauthorized: redirectToLoginPage,
                    notFoundUpdateUsername: () => setError(NOT_FOUND_UPDATE_USERNAME),
                    badRequestUpdateUsername: () => setError(BAD_REQUEST_UPDATE_USERNAME),
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
        <div data-contain="section">
            <form onSubmit={handleSubmit}>
                <div>
                    <Label htmlFor={"username"}>{appearance?.options?.usernameLabel || "Username"}</Label>
                    <Input
                        id={"username"}
                        type={"text"}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <Button loading={loading}>
                    {appearance?.options?.updateUsernameButtonContent || "Update Username"}
                </Button>
                {success && <Alert type={"success"}>{success}</Alert>}
                {error && <Alert type={"error"}>{error}</Alert>}
            </form>
        </div>
    )
}

export type UpdatePasswordProps = {
    appearance?: UpdateProfileAppearance
}

export const UpdatePassword = ({ appearance }: UpdatePasswordProps) => {
    const { userApi } = useApi()
    const { redirectToLoginPage } = useRedirectFunctions()
    const [hasPassword, setHasPassword] = useState(true) // get from user metadata
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | undefined>(undefined)
    const callToAction = hasPassword ? "Update Password" : "Set Password"
    const passwordLabel = hasPassword ? "New password" : "Password"

    async function handleSubmit(event: FormEvent) {
        try {
            event.preventDefault()
            setLoading(true)
            let options: UpdatePasswordRequest = { password: newPassword, xCsrfToken: X_CSRF_TOKEN }
            if (hasPassword) {
                options.currentPassword = oldPassword
            }
            const res = await userApi.updatePassword(options)
            if (res.ok) {
                setOldPassword("")
                setNewPassword("")
                setHasPassword(true)
            } else {
                res.error._visit({
                    unauthorized: redirectToLoginPage,
                    notFoundUpdatePassword: () => setError(NOT_FOUND_UPDATE_PASSWORD),
                    badRequestUpdatePassword: () => setError(BAD_REQUEST_UPDATE_PASSWORD),
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
        <div data-contain="section">
            <form onSubmit={handleSubmit}>
                {hasPassword && (
                    <div>
                        <Label htmlFor={"old_password"} appearance={appearance?.elements?.OldPasswordLabel}>
                            {appearance?.options?.oldPasswordLabel || "Old password"}
                        </Label>
                        <Input
                            type={"password"}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            appearance={appearance?.elements?.OldPasswordInput}
                        />
                    </div>
                )}
                <div>
                    <Label htmlFor={"new_password"} appearance={appearance?.elements?.NewPasswordLabel}>
                        {appearance?.options?.newPasswordLabel || passwordLabel}
                    </Label>
                    <Input
                        type={"password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        appearance={appearance?.elements?.NewPasswordInput}
                    />
                </div>
                <Button loading={loading} appearance={appearance?.elements?.SubmitPasswordButton}>
                    {appearance?.options?.updatePasswordButtonContent || callToAction}
                </Button>
                {error && (
                    <Alert type={"error"} appearance={appearance?.elements?.ErrorMessage}>
                        {error}
                    </Alert>
                )}
            </form>
        </div>
    )
}
