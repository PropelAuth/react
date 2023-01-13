import React, { ReactNode, SyntheticEvent, useState } from "react"
import { ElementAppearance } from "../AppearanceProvider"
import { Alert, AlertProps } from "../elements/Alert"
import { Button, ButtonProps } from "../elements/Button"
import { Container, ContainerProps } from "../elements/Container"
import { H3, H3Props } from "../elements/H3"
import { Image, ImageProps } from "../elements/Image"
import { Input, InputProps } from "../elements/Input"
import { Label, LabelProps } from "../elements/Label"
import { Paragraph } from "../elements/Paragraph"
import { Progress, ProgressProps } from "../elements/Progress"
import { useApi } from "../useApi"
import { useConfig } from "../useConfig"
import {
    BAD_REQUEST,
    LOGIN_PASSWORDLESS_NOT_SUPPORTED,
    PASSWORDLESS_LOGIN_SUBMITTED,
    PASSWORDLESS_LOGIN_SUBMITTED_PUBLIC,
    UNEXPECTED_ERROR,
    X_CSRF_TOKEN,
} from "./constants"

export type LoginPasswordlessProps = {
    appearance?: LoginPasswordlessAppearance
}

export type LoginPasswordlessAppearance = {
    options?: {
        headerContent?: ReactNode
        displayLogo?: boolean
        emailLabel?: ReactNode
        submitButtonContent?: ReactNode
        successMessage?: ReactNode
    }
    elements?: {
        Progress?: ElementAppearance<ProgressProps>
        Container?: ElementAppearance<ContainerProps>
        Logo?: ElementAppearance<ImageProps>
        Header?: ElementAppearance<H3Props>
        EmailLabel?: ElementAppearance<LabelProps>
        EmailInput?: ElementAppearance<InputProps>
        SubmitButton?: ElementAppearance<ButtonProps>
        ErrorMessage?: ElementAppearance<AlertProps>
    }
}

export const LoginPasswordless = ({ appearance }: LoginPasswordlessProps) => {
    const { loginApi } = useApi()
    const { configLoading, config } = useConfig()
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [emailError, setEmailError] = useState<string | undefined>(undefined)
    const [error, setError] = useState<string | undefined>(undefined)
    const [submitted, setSubmitted] = useState(false)

    async function loginPasswordless(e: SyntheticEvent) {
        try {
            e.preventDefault()
            setLoading(true)
            setError(undefined)
            const response = await loginApi.sendMagicLinkLogin({
                email,
                createIfDoesntExist: true,
                xCsrfToken: X_CSRF_TOKEN,
            })
            if (response.ok) {
                setSubmitted(true)
            } else {
                response.error._visit({
                    badRequestLoginPasswordless: (err) => {
                        if (err.email || err.error) {
                            if (err.email) {
                                setEmailError(err.email.join(", "))
                            }
                            if (err.error) {
                                setError(err.error.join(", "))
                            }
                        } else {
                            setError(BAD_REQUEST)
                        }
                    },
                    loginPasswordlessNotSupported: () => setError(LOGIN_PASSWORDLESS_NOT_SUPPORTED),
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

    if (configLoading) {
        return (
            <div data-contain="component">
                <Container appearance={appearance?.elements?.Container}>
                    <Progress appearance={appearance?.elements?.Progress} />
                </Container>
            </div>
        )
    } else if (submitted) {
        return (
            <div data-contain="component">
                <Container appearance={appearance?.elements?.Container}>
                    {config && config.allowPublicSignups ? (
                        <Paragraph>
                            {appearance?.options?.successMessage || PASSWORDLESS_LOGIN_SUBMITTED_PUBLIC}
                        </Paragraph>
                    ) : (
                        <Paragraph>{appearance?.options?.successMessage || PASSWORDLESS_LOGIN_SUBMITTED}</Paragraph>
                    )}
                </Container>
            </div>
        )
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
                        {appearance?.options?.headerContent || "Passwordless Login"}
                    </H3>
                </div>
                <div data-contain="form">
                    <form onSubmit={loginPasswordless}>
                        <div>
                            <Label htmlFor="email">{appearance?.options?.emailLabel || "Email"}</Label>
                            <Input
                                required
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                appearance={appearance?.elements?.EmailInput}
                            />
                            {emailError && (
                                <Alert appearance={appearance?.elements?.ErrorMessage} type={"error"}>
                                    {emailError}
                                </Alert>
                            )}
                        </div>
                        <Button appearance={appearance?.elements?.SubmitButton} loading={loading}>
                            {appearance?.options?.submitButtonContent || "Continue"}
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
