import { PropelAuthFeV2 } from "@propel-auth-fern/fe_v2-client"
import React, { FormEvent, ReactNode, useState } from "react"
import { ElementAppearance } from "../AppearanceProvider"
import { Alert, AlertProps } from "../elements/Alert"
import { Button, ButtonProps } from "../elements/Button"
import { Container, ContainerProps } from "../elements/Container"
import { H3, H3Props } from "../elements/H3"
import { Image, ImageProps } from "../elements/Image"
import { Input, InputProps } from "../elements/Input"
import { Label, LabelProps } from "../elements/Label"
import { useApi } from "../useApi"
import { useRedirectFunctions } from "../useRedirectFunctions"
import { withConfig, WithConfigProps } from "../withConfig"
import { BAD_REQUEST, INCORRECT_PASSWORD, UNEXPECTED_ERROR, X_CSRF_TOKEN } from "./constants"

export type UpdatePasswordAppearance = {
    options?: {
        displayLogo?: boolean
        SubmitButtonText?: ReactNode
    }
    elements?: {
        Container?: ElementAppearance<ContainerProps>
        Header?: ElementAppearance<H3Props>
        Logo?: ElementAppearance<ImageProps>
        PasswordLabel?: ElementAppearance<LabelProps>
        PasswordInput?: ElementAppearance<InputProps>
        SubmitButton?: ElementAppearance<ButtonProps>
        ErrorMessage?: ElementAppearance<AlertProps>
    }
}

type UpdatePasswordProps = {
    onStepCompleted: VoidFunction
    appearance?: UpdatePasswordAppearance
    testMode?: boolean
} & WithConfigProps

const UpdatePassword = ({ onStepCompleted, appearance, testMode, config }: UpdatePasswordProps) => {
    const { userApi, loginApi } = useApi()
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | undefined>(undefined)
    const { redirectToLoginPage } = useRedirectFunctions()

    async function handleSubmit(event: FormEvent) {
        event.preventDefault()

        if (testMode) {
            alert(
                "You are currently in test mode. Remove the `overrideCurrentScreenForTesting` prop to update your password."
            )
            return
        }

        try {
            setError(undefined)
            setLoading(true)
            let options: PropelAuthFeV2.UpdatePasswordRequest = { password, xCsrfToken: X_CSRF_TOKEN }
            const res = await userApi.updatePassword(options)
            if (res.ok) {
                const status = await loginApi.fetchLoginState()
                if (status.ok) {
                    onStepCompleted()
                } else {
                    setError(UNEXPECTED_ERROR)
                }
            } else {
                res.error._visit({
                    notFoundUpdatePassword: () => setError(INCORRECT_PASSWORD),
                    badRequestUpdatePassword: (err) => {
                        if (err.currentPassword || err.password) {
                            if (err.currentPassword) {
                                setError(err.currentPassword.join(", "))
                            }
                            if (err.password) {
                                setError(err.password.join(", "))
                            }
                        } else {
                            setError(BAD_REQUEST)
                        }
                    },
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
                    <H3 appearance={appearance?.elements?.Header}>{`Update your password`}</H3>
                </div>
                <div data-contain="form">
                    <form onSubmit={handleSubmit}>
                        <div>
                            <Label htmlFor={"new_password"} appearance={appearance?.elements?.PasswordLabel}>
                                {`Password`}
                            </Label>
                            <Input
                                type={"password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                appearance={appearance?.elements?.PasswordInput}
                            />
                        </div>
                        <Button loading={loading} appearance={appearance?.elements?.SubmitButton}>
                            {appearance?.options?.SubmitButtonText || "Continue"}
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

export default withConfig(UpdatePassword)
