import { LoginStateEnum } from "@propel-auth-fern/fe_v2-client/resources"
import React, { ReactNode, SyntheticEvent, useEffect, useState } from "react"
import { ElementAppearance } from "../AppearanceProvider"
import { Alert, AlertProps } from "../elements/Alert"
import { Button, ButtonProps } from "../elements/Button"
import { Container, ContainerProps } from "../elements/Container"
import { DividerProps } from "../elements/Divider"
import { H3, H3Props } from "../elements/H3"
import { Image, ImageProps } from "../elements/Image"
import { Input, InputProps } from "../elements/Input"
import { Label } from "../elements/Label"
import { useApi } from "../useApi"
import { useConfig } from "../useConfig"
import { ConfirmEmail, ConfirmEmailAppearance } from "./ConfirmEmail"
import { BAD_REQUEST_LOGIN, UNEXPECTED_ERROR } from "./constants"
import { CreateOrg, CreateOrgAppearance } from "./CreateOrg"
import { SignInDivider } from "./SignInDivider"
import { SignInOptions } from "./SignInOptions"
import { UserMetadata, UserMetadataAppearance } from "./UserMetadata"
import { Verify, VerifyAppearance } from "./Verify"

export type LoginProps = {
    onSuccess: VoidFunction
    onRedirectToSignup?: VoidFunction
    onRedirectToForgotPassword?: VoidFunction
    presetEmail?: string
    appearance?: LoginAppearance
    confirmEmailAppearance?: ConfirmEmailAppearance
    verifyAppearance?: VerifyAppearance
    userMetadataAppearance?: UserMetadataAppearance
    createOrgAppearance?: CreateOrgAppearance
}

export type LoginAppearance = {
    options?: {
        headerContent?: ReactNode
        displayLogo?: boolean
        divider?: ReactNode | boolean
        emailLabel?: ReactNode
        passwordLabel?: ReactNode
        submitButtonContent?: ReactNode
        signupButtonContent?: ReactNode
        forgotPasswordButtonContent?: ReactNode
    }
    elements?: {
        Container?: ElementAppearance<ContainerProps>
        Logo?: ElementAppearance<ImageProps>
        Header?: ElementAppearance<H3Props>
        Divider?: ElementAppearance<DividerProps>
        EmailInput?: ElementAppearance<InputProps>
        PasswordInput?: ElementAppearance<InputProps>
        SocialButton?: ElementAppearance<ButtonProps>
        SubmitButton?: ElementAppearance<ButtonProps>
        SignupButton?: ElementAppearance<ButtonProps>
        ForgotPasswordButton?: ElementAppearance<ButtonProps>
        ErrorMessage?: ElementAppearance<AlertProps>
    }
}

export const Login = ({
    onSuccess,
    onRedirectToSignup,
    onRedirectToForgotPassword,
    presetEmail,
    appearance,
    confirmEmailAppearance,
    verifyAppearance,
    userMetadataAppearance,
    createOrgAppearance,
}: LoginProps) => {
    const { config } = useConfig()
    const [step, setStep] = useState<LoginStateEnum>(LoginStateEnum.LoginRequired)
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState(presetEmail || "")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | undefined>(undefined)
    const { loginApi } = useApi()

    const login = async (e: SyntheticEvent) => {
        try {
            e.preventDefault()
            setLoading(true)
            setError(undefined)
            const options = { email, password }
            const response = await loginApi.login(options)
            if (response.ok) {
                setStep(response.body)
            } else {
                response.error._visit({
                    badRequestLogin: () => setError(BAD_REQUEST_LOGIN),
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

    const setCurrentStep = async () => {
        try {
            const response = await loginApi.loginState()
            if (response.ok) {
                setStep(response.body.loginState)
            } else {
                throw new Error("Failed to fetch login state")
            }
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        if (step === LoginStateEnum.Finished) {
            onSuccess()
        }
    }, [step, onSuccess])

    switch (step) {
        case LoginStateEnum.LoginRequired:
            return (
                <div data-contain="component">
                    <Container appearance={appearance?.elements?.Container}>
                        {appearance?.options?.displayLogo !== false && config && (
                            <div data-contain="logo">
                                <Image
                                    src={config.logo_url}
                                    alt={config.site_display_name}
                                    appearance={appearance?.elements?.Logo}
                                />
                            </div>
                        )}
                        <div data-contain="header">
                            <H3 appearance={appearance?.elements?.Header}>
                                {appearance?.options?.headerContent || "Welcome"}
                            </H3>
                        </div>
                        {config && (config.has_passwordless_login || config.has_any_social_login) && (
                            <SignInOptions buttonAppearance={appearance?.elements?.SocialButton} config={config} />
                        )}
                        {config &&
                            config.has_password_login &&
                            config.has_any_social_login &&
                            appearance?.options?.divider !== false && (
                                <SignInDivider
                                    appearance={appearance?.elements?.Divider}
                                    options={appearance?.options?.divider}
                                />
                            )}
                        {config && config.has_password_login && (
                            <div data-contain="form">
                                <form onSubmit={login}>
                                    <div>
                                        <Label htmlFor="email">{appearance?.options?.emailLabel || "Email"}</Label>
                                        <Input
                                            required
                                            id="email"
                                            type="email"
                                            value={email}
                                            readOnly={!!presetEmail}
                                            onChange={(e) => setEmail(e.target.value)}
                                            appearance={appearance?.elements?.EmailInput}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="password">
                                            {appearance?.options?.passwordLabel || "Password"}
                                        </Label>
                                        <Input
                                            required
                                            type="password"
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            appearance={appearance?.elements?.PasswordInput}
                                        />
                                    </div>
                                    <Button appearance={appearance?.elements?.SubmitButton} loading={loading}>
                                        {appearance?.options?.submitButtonContent || "Login"}
                                    </Button>
                                    {error && (
                                        <Alert appearance={appearance?.elements?.ErrorMessage} type={"error"}>
                                            {error}
                                        </Alert>
                                    )}
                                </form>
                            </div>
                        )}
                        {(onRedirectToSignup || onRedirectToForgotPassword) && (
                            <div data-contain="links">
                                {onRedirectToSignup && (
                                    <Button
                                        onClick={onRedirectToSignup}
                                        appearance={appearance?.elements?.SignupButton}
                                    >
                                        {appearance?.options?.signupButtonContent || "Sign Up"}
                                    </Button>
                                )}
                                {onRedirectToForgotPassword && (
                                    <Button
                                        onClick={onRedirectToForgotPassword}
                                        appearance={appearance?.elements?.ForgotPasswordButton}
                                    >
                                        {appearance?.options?.forgotPasswordButtonContent || "Forgot Password"}
                                    </Button>
                                )}
                            </div>
                        )}
                    </Container>
                </div>
            )

        case LoginStateEnum.ConfirmEmailRequired:
            return <ConfirmEmail appearance={confirmEmailAppearance} />

        case LoginStateEnum.TwoFactorRequired:
            return <Verify setStep={setStep} appearance={verifyAppearance} />

        case LoginStateEnum.UserMetadataRequired:
            return <UserMetadata setStep={setStep} config={config} appearance={userMetadataAppearance} />

        case LoginStateEnum.OrgCreationRequired:
            return <CreateOrg onOrgCreated={setCurrentStep} config={config} appearance={createOrgAppearance} />

        default:
            return <span>{UNEXPECTED_ERROR}</span>
    }
}