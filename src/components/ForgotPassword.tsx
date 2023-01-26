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
    FORGOT_PASSWORD_MESSAGE,
    FORGOT_PASSWORD_SUCCESS,
    LOGIN_PASSWORDLESS_NOT_SUPPORTED,
    MAGIC_LINK_SUCCESS,
    PASSWORDLESS_MESSAGE,
    UNEXPECTED_ERROR,
    X_CSRF_TOKEN,
} from "./constants"

export type ForgotPasswordAppearance = {
    options?: {
        displayLogo?: boolean
        resetPasswordButtonText?: ReactNode
        magicLinkButtonText?: ReactNode
    }
    elements?: {
        Container?: ElementAppearance<ContainerProps>
        Logo?: ElementAppearance<ImageProps>
        Header?: ElementAppearance<H3Props>
        SuccessMessage?: ElementAppearance<ParagraphProps>
        InstructionsText?: ElementAppearance<ParagraphProps>
        EmailLabel?: ElementAppearance<LabelProps>
        EmailInput?: ElementAppearance<InputProps>
        PasswordInput?: ElementAppearance<InputProps>
        SubmitButton?: ElementAppearance<ButtonProps>
        MagicLinkButton?: ElementAppearance<ButtonProps>
        RedirectToLoginLink?: ElementAppearance<ButtonProps>
        ErrorMessage?: ElementAppearance<AlertProps>
    }
}

export type ForgotPasswordProps = {
    onRedirectToLogin?: VoidFunction
    appearance?: ForgotPasswordAppearance
} & WithConfigProps

const ForgotPassword = ({ onRedirectToLogin, appearance, config }: ForgotPasswordProps) => {
    const { loginApi } = useApi()
    const [email, setEmail] = useState("")
    const [emailError, setEmailError] = useState<string | undefined>(undefined)
    const [error, setError] = useState<string | undefined>(undefined)
    const [passwordResetLoading, setPasswordResetLoading] = useState(false)
    const [magicLinkLoading, setMagicLinkLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined)

    const clearErrors = () => {
        setEmailError(undefined)
        setError(undefined)
    }

    async function submitForgotPassword(e: SyntheticEvent) {
        try {
            e.preventDefault()
            clearErrors()
            setPasswordResetLoading(true)
            const response = await loginApi.forgotPassword({ email, xCsrfToken: X_CSRF_TOKEN })
            if (response.ok) {
                setSuccessMessage(FORGOT_PASSWORD_SUCCESS)
            } else {
                response.error._visit({
                    badRequestForgotPassword: (err) => setError(err.email?.join(", ") || BAD_REQUEST),
                    _other: () => setError(UNEXPECTED_ERROR),
                })
            }
        } catch (e) {
            setError(UNEXPECTED_ERROR)
            console.error(e)
        } finally {
            setPasswordResetLoading(false)
        }
    }

    async function submitMagicLink(e: SyntheticEvent) {
        try {
            e.preventDefault()
            clearErrors()
            setMagicLinkLoading(true)
            const response = await loginApi.sendMagicLinkLogin({
                email,
                createIfDoesntExist: false,
                xCsrfToken: X_CSRF_TOKEN,
            })
            if (response.ok) {
                setSuccessMessage(MAGIC_LINK_SUCCESS)
            } else {
                response.error._visit({
                    loginPasswordlessNotSupported: () => setError(LOGIN_PASSWORDLESS_NOT_SUPPORTED),
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
                    _other: () => setError(UNEXPECTED_ERROR),
                })
            }
        } catch (e) {
            setError(UNEXPECTED_ERROR)
            console.error(e)
        } finally {
            setMagicLinkLoading(false)
        }
    }

    if (successMessage) {
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
                        <H3 appearance={appearance?.elements?.Header}>{`Forgot Password`}</H3>
                    </div>
                    <div data-contain="content">
                        <Paragraph appearance={appearance?.elements?.SuccessMessage}>{successMessage}</Paragraph>
                    </div>
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
                    <H3 appearance={appearance?.elements?.Header}>{`Forgot Password`}</H3>
                </div>
                <div data-contain="content">
                    {config.hasPasswordLogin ? (
                        <Paragraph appearance={appearance?.elements?.InstructionsText}>
                            {PASSWORDLESS_MESSAGE}
                        </Paragraph>
                    ) : (
                        <Paragraph appearance={appearance?.elements?.InstructionsText}>
                            {FORGOT_PASSWORD_MESSAGE}
                        </Paragraph>
                    )}
                </div>
                <div data-contain="form">
                    <form onSubmit={submitForgotPassword}>
                        <div>
                            <Label htmlFor="email" appearance={appearance?.elements?.EmailLabel}>
                                {`Email`}
                            </Label>
                            <Input
                                required
                                id={"email"}
                                type={"email"}
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

                        <Button
                            loading={passwordResetLoading}
                            appearance={appearance?.elements?.SubmitButton}
                            type="submit"
                        >
                            {appearance?.options?.resetPasswordButtonText || "Reset Password"}
                        </Button>
                    </form>
                </div>
                {config.hasPasswordlessLogin && (
                    <div data-contain="form">
                        <Button
                            loading={magicLinkLoading}
                            onClick={submitMagicLink}
                            appearance={appearance?.elements?.MagicLinkButton}
                        >
                            {appearance?.options?.magicLinkButtonText || "Send Magic Link"}
                        </Button>
                    </div>
                )}
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
                {error && (
                    <Alert appearance={appearance?.elements?.ErrorMessage} type={"error"}>
                        {error}
                    </Alert>
                )}
            </Container>
        </div>
    )
}

export default withConfig(ForgotPassword)
