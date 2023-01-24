import React, { ReactNode, useState } from "react"
import { ElementAppearance } from "../AppearanceProvider"
import { Alert, AlertProps } from "../elements/Alert"
import { Button, ButtonProps } from "../elements/Button"
import { Container, ContainerProps } from "../elements/Container"
import { H3, H3Props } from "../elements/H3"
import { Image, ImageProps } from "../elements/Image"
import { Paragraph, ParagraphProps } from "../elements/Paragraph"
import { useApi } from "../useApi"
import { useRedirectFunctions } from "../useRedirectFunctions"
import { withConfig, WithConfigProps } from "../withConfig"
import {
    CONFIRM_EMAIL_MESSAGE,
    RATE_LIMIT_EMAIL_CONFIRMATION,
    RESEND_CONFIRM_EMAIL_MESSAGE,
    UNEXPECTED_ERROR,
    X_CSRF_TOKEN,
} from "./constants"

export type ConfirmEmailAppearance = {
    options?: {
        displayLogo?: boolean
        resendConfirmationButtonText?: ReactNode
    }
    elements?: {
        Container?: ElementAppearance<ContainerProps>
        Logo?: ElementAppearance<ImageProps>
        Header?: ElementAppearance<H3Props>
        ConfirmationText?: ElementAppearance<ParagraphProps>
        ResendConfirmationButton?: ElementAppearance<ButtonProps>
        SuccessMessage?: ElementAppearance<AlertProps>
        ErrorMessage?: ElementAppearance<AlertProps>
    }
}
type ConfirmEmailProps = {
    appearance?: ConfirmEmailAppearance
    testMode?: boolean
} & WithConfigProps

const ConfirmEmail = ({ appearance, testMode, config }: ConfirmEmailProps) => {
    const { userApi } = useApi()
    const [loading, setLoading] = useState(false)
    const [resent, setResent] = useState(false)
    const [error, setError] = useState<string | undefined>(undefined)
    const { redirectToLoginPage } = useRedirectFunctions()

    async function handleClick() {
        if (testMode) {
            alert(
                "You are currently in test mode. Remove the `overrideCurrentScreenForTesting` prop to resend email confirmaion."
            )
            return
        }

        try {
            setError(undefined)
            setLoading(true)
            const response = await userApi.resendEmailConfirmation({ xCsrfToken: X_CSRF_TOKEN })
            if (response.ok) {
                setResent(true)
            } else {
                response.error._visit({
                    tooManyRequests: () => setError(RATE_LIMIT_EMAIL_CONFIRMATION),
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
                    <H3 appearance={appearance?.elements?.Header}>Confirm your email</H3>
                </div>
                <div data-contain="text">
                    <Paragraph appearance={appearance?.elements?.ConfirmationText}>{CONFIRM_EMAIL_MESSAGE}</Paragraph>
                    {resent ? (
                        <Alert appearance={appearance?.elements?.SuccessMessage} type={"success"}>
                            {RESEND_CONFIRM_EMAIL_MESSAGE}
                        </Alert>
                    ) : (
                        <Button
                            loading={loading}
                            onClick={handleClick}
                            appearance={appearance?.elements?.ResendConfirmationButton}
                        >
                            {appearance?.options?.resendConfirmationButtonText || `Resend Confirmation Email`}
                        </Button>
                    )}
                    {error && (
                        <Alert appearance={appearance?.elements?.ErrorMessage} type={"error"}>
                            {error}
                        </Alert>
                    )}
                </div>
            </Container>
        </div>
    )
}

export default withConfig(ConfirmEmail)
