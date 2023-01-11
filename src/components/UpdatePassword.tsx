import { UpdatePasswordRequest } from "@propel-auth-fern/fe_v2-sdk/resources"
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
import { Config } from "../useConfig"
import { useRedirectFunctions } from "../useRedirectFunctions"
import { BAD_REQUEST, NOT_FOUND_UPDATE_PASSWORD, UNEXPECTED_ERROR } from "./constants"

export type UpdatePasswordProps = {
    config: Config | null
    getLoginState: VoidFunction
    appearance?: UpdatePasswordAppearance
}

export type UpdatePasswordAppearance = {
    options?: {
        headerContent?: ReactNode
        displayLogo?: boolean
        passwordLabel?: ReactNode
        SubmitButtonContent?: ReactNode
    }
    elements?: {
        Container?: ElementAppearance<ContainerProps>
        Header?: ElementAppearance<H3Props>
        Logo?: ElementAppearance<ImageProps>
        PasswordInput?: ElementAppearance<InputProps>
        PasswordLabel?: ElementAppearance<LabelProps>
        SubmitButton?: ElementAppearance<ButtonProps>
        ErrorMessage?: ElementAppearance<AlertProps>
    }
}

export const UpdatePassword = ({ config, getLoginState, appearance }: UpdatePasswordProps) => {
    const { userApi, loginApi } = useApi()
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | undefined>(undefined)
    const { redirectToLoginPage } = useRedirectFunctions()

    async function handleSubmit(event: FormEvent) {
        try {
            event.preventDefault()
            setLoading(true)
            let options: UpdatePasswordRequest = { password }
            const res = await userApi.updatePassword(options)
            if (res.ok) {
                const status = await loginApi.fetchLoginState()
                if (status.ok) {
                    getLoginState()
                } else {
                    setError(UNEXPECTED_ERROR)
                }
            } else {
                res.error._visit({
                    notFoundUpdatePassword: () => setError(NOT_FOUND_UPDATE_PASSWORD),
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
                {appearance?.options?.displayLogo && config && (
                    <div data-contain="logo">
                        <Image
                            src={config.logoUrl}
                            alt={config.siteDisplayName}
                            appearance={appearance?.elements?.Logo}
                        />
                    </div>
                )}
                <div data-contain="header">
                    <H3 appearance={appearance?.elements?.Header}>
                        {appearance?.options?.headerContent || "Update your password"}
                    </H3>
                </div>
                <div data-contain="form">
                    <form onSubmit={handleSubmit}>
                        <div>
                            <Label htmlFor={"new_password"} appearance={appearance?.elements?.PasswordLabel}>
                                {appearance?.options?.passwordLabel || "Password"}
                            </Label>
                            <Input
                                type={"password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                appearance={appearance?.elements?.PasswordInput}
                            />
                        </div>
                        <Button loading={loading} appearance={appearance?.elements?.SubmitButton}>
                            {appearance?.options?.SubmitButtonContent || "Continue"}
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
