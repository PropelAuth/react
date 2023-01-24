import React, { MouseEvent, ReactNode, SyntheticEvent, useState } from "react"
import { ElementAppearance } from "../AppearanceProvider"
import { Alert, AlertProps } from "../elements/Alert"
import { AnchorButton } from "../elements/AnchorButton"
import { Button, ButtonProps } from "../elements/Button"
import { Container, ContainerProps } from "../elements/Container"
import { H3, H3Props } from "../elements/H3"
import { Image, ImageProps } from "../elements/Image"
import { Input, InputProps } from "../elements/Input"
import { Label, LabelProps } from "../elements/Label"
import { useApi } from "../useApi"
import { withConfig, WithConfigProps } from "../withConfig"
import { BAD_REQUEST, FORBIDDEN, NOT_FOUND_MFA_VERIFY, UNEXPECTED_ERROR, X_CSRF_TOKEN } from "./constants"

export type VerifyMfaAppearance = {
    options?: {
        displayLogo?: boolean
        submitButtonText?: ReactNode
    }
    elements?: {
        Container?: ElementAppearance<ContainerProps>
        Logo?: ElementAppearance<ImageProps>
        Header?: ElementAppearance<H3Props>
        CodeLabel?: ElementAppearance<LabelProps>
        CodeInput?: ElementAppearance<InputProps>
        SubmitButton?: ElementAppearance<ButtonProps>
        CodeOrBackupToggle?: ElementAppearance<ButtonProps>
        ErrorMessage?: ElementAppearance<AlertProps>
    }
}

type VerifyMfaProps = {
    onStepCompleted: VoidFunction
    appearance?: VerifyMfaAppearance
} & WithConfigProps

const VerifyMfa = ({ onStepCompleted, appearance, config }: VerifyMfaProps) => {
    const { mfaApi } = useApi()
    const [loading, setLoading] = useState(false)
    const [code, setCode] = useState("")
    const [useBackupCode, setUseBackupCode] = useState(false)
    const [error, setError] = useState<string | undefined>(undefined)

    const codeLabel = `Enter the 6 digit code generated by your authenticator app:`
    const backupCodeLabel = `Enter an unused backup code:`
    const inputLabel = useBackupCode ? backupCodeLabel : codeLabel

    const codeButtonText = `Enter a code from your authenticator app`
    const backupCodeButtonText = `Lost your device? Enter a backup code`
    const buttonText = useBackupCode ? codeButtonText : backupCodeButtonText

    function toggleCodeType(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault()
        setError(undefined)
        setCode("")
        setUseBackupCode(!useBackupCode)
    }

    async function verifyMfa(e: SyntheticEvent) {
        try {
            e.preventDefault()
            setError(undefined)
            setLoading(true)
            if (useBackupCode) {
                const backupResponse = await mfaApi.mfaVerifyBackup({ code, xCsrfToken: X_CSRF_TOKEN })
                if (backupResponse.ok) {
                    onStepCompleted()
                } else {
                    backupResponse.error._visit({
                        badRequestMfaVerify: (err) => setError(err.code?.join(", ") || BAD_REQUEST),
                        notFoundMfaVerify: () => setError(NOT_FOUND_MFA_VERIFY),
                        forbiddenMfaVerify: () => setError(FORBIDDEN),
                        _other: () => setError(UNEXPECTED_ERROR),
                    })
                }
            } else {
                const codeResponse = await mfaApi.mfaVerify({ code, xCsrfToken: X_CSRF_TOKEN })
                if (codeResponse.ok) {
                    onStepCompleted()
                } else {
                    codeResponse.error._visit({
                        badRequestMfaVerify: (err) => setError(err.code?.join(", ") || BAD_REQUEST),
                        notFoundMfaVerify: () => setError(NOT_FOUND_MFA_VERIFY),
                        forbiddenMfaVerify: () => setError(FORBIDDEN),
                        _other: () => setError(UNEXPECTED_ERROR),
                    })
                }
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
                    <H3 appearance={appearance?.elements?.Header}>
                        {`Verify with ${useBackupCode ? "your backup code" : "2FA"}`}
                    </H3>
                </div>
                <div data-contain="form">
                    <form onSubmit={verifyMfa}>
                        <div>
                            <Label htmlFor={"code"} appearance={appearance?.elements?.CodeLabel}>
                                {inputLabel}
                            </Label>
                            <Input
                                id={"code"}
                                type={useBackupCode ? "text" : "number"}
                                placeholder={"123456"}
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                appearance={appearance?.elements?.CodeInput}
                            />
                        </div>
                        <Button loading={loading} appearance={appearance?.elements?.SubmitButton}>
                            {appearance?.options?.submitButtonText || "Submit"}
                        </Button>
                        {error && (
                            <Alert appearance={appearance?.elements?.ErrorMessage} type={"error"}>
                                {error}
                            </Alert>
                        )}
                    </form>
                </div>
                <div data-contain="link">
                    <AnchorButton onClick={toggleCodeType} appearance={appearance?.elements?.CodeOrBackupToggle}>
                        {buttonText}
                    </AnchorButton>
                </div>
            </Container>
        </div>
    )
}

export default withConfig(VerifyMfa)
