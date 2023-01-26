import React, { ReactNode, SyntheticEvent, useState } from "react"
import { ElementAppearance } from "../AppearanceProvider"
import { Alert, AlertProps } from "../elements/Alert"
import { AnchorButton } from "../elements/AnchorButton"
import { Button, ButtonProps } from "../elements/Button"
import { Container, ContainerProps } from "../elements/Container"
import { H3, H3Props } from "../elements/H3"
import { Image, ImageProps } from "../elements/Image"
import { Input, InputProps } from "../elements/Input"
import { Label, LabelProps } from "../elements/Label"
import { Paragraph, ParagraphProps } from "../elements/Paragraph"
import { useApi } from "../useApi"
import { withConfig, WithConfigProps } from "../withConfig"
import {
    BAD_REQUEST,
    LOGIN_PASSWORDLESS_NOT_SUPPORTED,
    PASSWORDLESS_LOGIN_SUBMITTED,
    PASSWORDLESS_LOGIN_SUBMITTED_PUBLIC,
    UNEXPECTED_ERROR,
    X_CSRF_TOKEN,
} from "./constants"

export type LoginPasswordlessAppearance = {
    options?: {
        displayLogo?: boolean
        submitButtonText?: ReactNode
    }
    elements?: {
        Container?: ElementAppearance<ContainerProps>
        Logo?: ElementAppearance<ImageProps>
        Header?: ElementAppearance<H3Props>
        Content?: ElementAppearance<ParagraphProps>
        EmailLabel?: ElementAppearance<LabelProps>
        EmailInput?: ElementAppearance<InputProps>
        SubmitButton?: ElementAppearance<ButtonProps>
        RedirectToLoginLink?: ElementAppearance<ButtonProps>
        SuccessMessage?: ElementAppearance<ParagraphProps>
        ErrorMessage?: ElementAppearance<AlertProps>
    }
}

export type LoginPasswordlessProps = {
    onRedirectToLogin?: VoidFunction
    appearance?: LoginPasswordlessAppearance
} & WithConfigProps

const LoginPasswordless = ({ onRedirectToLogin, appearance, config }: LoginPasswordlessProps) => {
    const { loginApi } = useApi()
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [emailError, setEmailError] = useState<string | undefined>(undefined)
    const [error, setError] = useState<string | undefined>(undefined)
    const [submitted, setSubmitted] = useState(false)

    const clearErrors = () => {
        setEmailError(undefined)
        setError(undefined)
    }

    async function loginPasswordless(e: SyntheticEvent) {
        try {
            e.preventDefault()
            clearErrors()
            setLoading(true)
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

    if (submitted) {
        return (
            <div data-contain="component">
                <Container appearance={appearance?.elements?.Container}>
                    {config.allowPublicSignups ? (
                        <Paragraph appearance={appearance?.elements?.SuccessMessage}>
                            {PASSWORDLESS_LOGIN_SUBMITTED_PUBLIC}
                        </Paragraph>
                    ) : (
                        <Paragraph appearance={appearance?.elements?.SuccessMessage}>
                            {PASSWORDLESS_LOGIN_SUBMITTED}
                        </Paragraph>
                    )}
                </Container>
            </div>
        )
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
                    <H3 appearance={appearance?.elements?.Header}>{`Sign in with Magic Link`}</H3>
                </div>
                <div data-contain="content">
                    <Paragraph appearance={appearance?.elements?.Content}>
                        Enter your email address below. You'll receive a link that will log you in.
                    </Paragraph>
                </div>

                <div data-contain="form">
                    <form onSubmit={loginPasswordless}>
                        <div>
                            <Label htmlFor="email" appearance={appearance?.elements?.EmailLabel}>{`Email`}</Label>
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
                        <Button loading={loading} appearance={appearance?.elements?.SubmitButton} type="submit">
                            {appearance?.options?.submitButtonText || "Continue"}
                        </Button>
                        {error && (
                            <Alert appearance={appearance?.elements?.ErrorMessage} type={"error"}>
                                {error}
                            </Alert>
                        )}
                    </form>
                </div>
                {onRedirectToLogin && (
                    <div data-contain="link">
                        <AnchorButton
                            onClick={onRedirectToLogin}
                            appearance={appearance?.elements?.RedirectToLoginLink}
                        >
                            {`Back to login`}
                        </AnchorButton>
                    </div>
                )}
            </Container>
        </div>
    )
}

export default withConfig(LoginPasswordless)
