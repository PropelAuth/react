import { PropelAuthFeV2 } from "@propel-auth-fern/fe_v2-client"
import React, { ReactNode, SyntheticEvent, useState } from "react"
import { ElementAppearance } from "../AppearanceProvider"
import { Alert, AlertProps } from "../elements/Alert"
import { Button, ButtonProps } from "../elements/Button"
import { Container, ContainerProps } from "../elements/Container"
import { H3, H3Props } from "../elements/H3"
import { Image, ImageProps } from "../elements/Image"
import { Input, InputProps } from "../elements/Input"
import { Label, LabelProps } from "../elements/Label"
import { Paragraph, ParagraphProps } from "../elements/Paragraph"
import { useApi } from "../useApi"
import { useRedirectFunctions } from "../useRedirectFunctions"
import { withConfig, WithConfigProps } from "../withConfig"
import { BAD_REQUEST, COMPLETE_ACCOUNT_TEXT, UNEXPECTED_ERROR, X_CSRF_TOKEN } from "./constants"

export type CompleteAccountAppearance = {
    options?: {
        displayLogo?: boolean
        submitButtonText?: ReactNode
    }
    elements?: {
        Container?: ElementAppearance<ContainerProps>
        Logo?: ElementAppearance<ImageProps>
        Header?: ElementAppearance<H3Props>
        Content?: ElementAppearance<ParagraphProps>
        FirstNameLabel?: ElementAppearance<LabelProps>
        FirstNameInput?: ElementAppearance<InputProps>
        LastNameLabel?: ElementAppearance<LabelProps>
        LastNameInput?: ElementAppearance<InputProps>
        UsernameLabel?: ElementAppearance<LabelProps>
        UsernameInput?: ElementAppearance<InputProps>
        SubmitButton?: ElementAppearance<ButtonProps>
        ErrorMessage?: ElementAppearance<AlertProps>
    }
}

type UserMetadataProps = {
    onStepCompleted: VoidFunction
    appearance?: CompleteAccountAppearance
} & WithConfigProps

const CompleteAccount = ({ onStepCompleted, appearance, config }: UserMetadataProps) => {
    const { userApi, loginApi } = useApi()
    const [loading, setLoading] = useState(false)
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [username, setUsername] = useState("")
    const [firstNameError, setFirstNameError] = useState<string | undefined>(undefined)
    const [lastNameError, setLastNameError] = useState<string | undefined>(undefined)
    const [usernameError, setUsernameError] = useState<string | undefined>(undefined)
    const [error, setError] = useState<string | undefined>(undefined)
    const { redirectToLoginPage } = useRedirectFunctions()

    const clearErrors = () => {
        setFirstNameError(undefined)
        setLastNameError(undefined)
        setUsernameError(undefined)
        setError(undefined)
    }

    async function updateMetadata(e: SyntheticEvent) {
        try {
            e.preventDefault()
            clearErrors()
            setLoading(true)
            const options: PropelAuthFeV2.UpdateUserFacingMetadataRequest = { xCsrfToken: X_CSRF_TOKEN }
            if (config && config.requireUsersToSetName) {
                options.firstName = firstName
                options.lastName = lastName
            }
            if (config && config.requireUsersToSetUsername) {
                options.username = username
            }
            const response = await userApi.updateMetadata(options)
            if (response.ok) {
                const status = await loginApi.fetchLoginState()
                if (status.ok) {
                    onStepCompleted()
                } else {
                    setError(UNEXPECTED_ERROR)
                }
            } else {
                response.error._visit({
                    unauthorized: redirectToLoginPage,
                    badRequestUpdateMetadata: (err) => {
                        if (err.firstName || err.lastName || err.username) {
                            if (err.firstName) {
                                setFirstNameError(err.firstName.join(", "))
                            }
                            if (err.lastName) {
                                setLastNameError(err.lastName.join(", "))
                            }
                            if (err.username) {
                                setUsernameError(err.username.join(", "))
                            }
                        } else {
                            setError(BAD_REQUEST)
                        }
                    },
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
        <div data-contain="component">
            <Container appearance={appearance?.elements?.Container}>
                {appearance?.options?.displayLogo && (
                    <div data-contain="logo">
                        <Image
                            src={config.logoUrl}
                            alt={config.siteDisplayName}
                            appearance={appearance?.elements?.Logo}
                        />
                    </div>
                )}
                <div data-contain="header">
                    <H3 appearance={appearance?.elements?.Header}>Complete your account</H3>
                </div>
                <div data-contain="content">
                    <Paragraph appearance={appearance?.elements?.Content}>{COMPLETE_ACCOUNT_TEXT}</Paragraph>
                </div>
                <div data-contain="form">
                    <form onSubmit={updateMetadata}>
                        {config.requireUsersToSetName && (
                            <>
                                <div>
                                    <Label htmlFor="first_name" appearance={appearance?.elements?.FirstNameLabel}>
                                        First name
                                    </Label>
                                    <Input
                                        id={"first_name"}
                                        type={"text"}
                                        value={firstName}
                                        placeholder={"First name"}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        appearance={appearance?.elements?.FirstNameInput}
                                    />
                                    {firstNameError && (
                                        <Alert appearance={appearance?.elements?.ErrorMessage} type={"error"}>
                                            {firstNameError}
                                        </Alert>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="last_name" appearance={appearance?.elements?.LastNameLabel}>
                                        Last name
                                    </Label>
                                    <Input
                                        id={"last_name"}
                                        type={"text"}
                                        value={lastName}
                                        placeholder={"Last name"}
                                        onChange={(e) => setLastName(e.target.value)}
                                        appearance={appearance?.elements?.LastNameInput}
                                    />
                                    {lastNameError && (
                                        <Alert appearance={appearance?.elements?.ErrorMessage} type={"error"}>
                                            {lastNameError}
                                        </Alert>
                                    )}
                                </div>
                            </>
                        )}
                        {config.requireUsersToSetUsername && (
                            <div>
                                <Label htmlFor="username" appearance={appearance?.elements?.UsernameLabel}>
                                    Username
                                </Label>
                                <Input
                                    id={"username"}
                                    type={"text"}
                                    value={username}
                                    placeholder={"Username"}
                                    onChange={(e) => setUsername(e.target.value)}
                                    appearance={appearance?.elements?.UsernameInput}
                                />
                                {usernameError && (
                                    <Alert appearance={appearance?.elements?.ErrorMessage} type={"error"}>
                                        {usernameError}
                                    </Alert>
                                )}
                            </div>
                        )}
                        <Button loading={loading} appearance={appearance?.elements?.SubmitButton}>
                            {appearance?.options?.submitButtonText || "Continue"}
                        </Button>
                        {error && (
                            <Alert appearance={appearance?.elements?.ErrorMessage} type={"error"}>
                                {error}
                            </Alert>
                        )}
                    </form>
                </div>
            </Container>
        </div>
    )
}

export default withConfig(CompleteAccount)
