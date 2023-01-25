import React, { ReactNode, SyntheticEvent, useState } from "react"
import { ElementAppearance } from "../AppearanceProvider"
import { Alert, AlertProps } from "../elements/Alert"
import { AnchorButton } from "../elements/AnchorButton"
import { Button, ButtonProps } from "../elements/Button"
import { Container, ContainerProps } from "../elements/Container"
import { DividerProps } from "../elements/Divider"
import { H3, H3Props } from "../elements/H3"
import { Image, ImageProps } from "../elements/Image"
import { Input, InputProps } from "../elements/Input"
import { Label, LabelProps } from "../elements/Label"
import { ProgressProps } from "../elements/Progress"
import { useApi } from "../useApi"
import { withConfig, WithConfigProps } from "../withConfig"
import { BAD_REQUEST, NO_ACCOUNT_FOUND_WITH_CREDENTIALS, UNEXPECTED_ERROR, X_CSRF_TOKEN } from "./constants"
import { OrDivider } from "./OrDivider"
import { SignInOptions } from "./SignInOptions"

export type LoginAppearance = {
    options?: {
        displayLogo?: boolean
        divider?: ReactNode | boolean
        submitButtonText?: ReactNode
    }
    elements?: {
        Progress?: ElementAppearance<ProgressProps>
        Container?: ElementAppearance<ContainerProps>
        Logo?: ElementAppearance<ImageProps>
        Header?: ElementAppearance<H3Props>
        Divider?: ElementAppearance<DividerProps>
        EmailLabel?: ElementAppearance<LabelProps>
        EmailInput?: ElementAppearance<InputProps>
        PasswordLabel?: ElementAppearance<LabelProps>
        PasswordInput?: ElementAppearance<InputProps>
        SocialButton?: ElementAppearance<ButtonProps>
        SubmitButton?: ElementAppearance<ButtonProps>
        RedirectToSignupLink?: ElementAppearance<ButtonProps>
        RedirectToForgotPasswordLink?: ElementAppearance<ButtonProps>
        RedirectToPasswordlessLoginButton?: ElementAppearance<ButtonProps>
        RedirectToSSOLoginButton?: ElementAppearance<ButtonProps>
        ErrorMessage?: ElementAppearance<AlertProps>
    }
}

type LoginProps = {
    onStepCompleted: VoidFunction
    onRedirectToSignup?: VoidFunction
    onRedirectToForgotPassword?: VoidFunction
    onRedirectToPasswordlessLogin?: VoidFunction
    onRedirectToSSOLogin?: VoidFunction
    appearance?: LoginAppearance
    testMode?: boolean
} & WithConfigProps

const Login = ({
    onStepCompleted,
    onRedirectToSignup,
    onRedirectToForgotPassword,
    onRedirectToPasswordlessLogin,
    onRedirectToSSOLogin,
    appearance,
    testMode,
    config,
}: LoginProps) => {
    const { loginApi } = useApi()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [emailError, setEmailError] = useState<string | undefined>(undefined)
    const [passwordError, setPasswordError] = useState<string | undefined>(undefined)
    const [error, setError] = useState<string | undefined>(undefined)

    const clearErrors = () => {
        setEmailError(undefined)
        setPasswordError(undefined)
        setError(undefined)
    }

    const login = async (e: SyntheticEvent) => {
        e.preventDefault()

        if (testMode) {
            alert("You are currently in test mode. Remove the `overrideCurrentScreenForTesting` prop to log in.")
            return
        }

        try {
            setLoading(true)
            clearErrors()
            const options = { email, password, xCsrfToken: X_CSRF_TOKEN }
            const response = await loginApi.login(options)
            if (response.ok) {
                onStepCompleted()
            } else {
                response.error._visit({
                    noAccountFoundWithCredentials: () => setError(NO_ACCOUNT_FOUND_WITH_CREDENTIALS),
                    badRequestLogin: (err) => {
                        if (err.email || err.error || err.password) {
                            if (err.email) {
                                setEmailError(err.email.join(", "))
                            }
                            if (err.error) {
                                setError(err.error.join(", "))
                            }
                            if (err.password) {
                                setPasswordError(err.password.join(", "))
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
                {appearance?.options?.displayLogo !== false && (
                    <div data-contain="logo">
                        <Image
                            src={config.logoUrl}
                            alt={config.siteDisplayName}
                            appearance={appearance?.elements?.Logo}
                        />
                    </div>
                )}
                <div data-contain="header">
                    <H3 appearance={appearance?.elements?.Header}>{`Welcome`}</H3>
                </div>
                {(config.hasPasswordlessLogin || config.hasAnyNonPasswordLogin) && (
                    <SignInOptions
                        config={config}
                        onRedirectToPasswordlessLogin={onRedirectToPasswordlessLogin}
                        onRedirectToSSOLogin={onRedirectToSSOLogin}
                        appearance={appearance}
                    />
                )}
                {config.hasPasswordLogin && config.hasAnyNonPasswordLogin && appearance?.options?.divider !== false && (
                    <OrDivider appearance={appearance?.elements?.Divider} options={appearance?.options?.divider} />
                )}
                {config.hasPasswordLogin && (
                    <div data-contain="form">
                        <form onSubmit={login}>
                            <div>
                                <Label htmlFor="email" appearance={appearance?.elements?.EmailLabel}>
                                    {`Email`}
                                </Label>
                                <Input
                                    required
                                    id="email"
                                    type="email"
                                    placeholder="Email"
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
                            <div>
                                <Label
                                    htmlFor="password"
                                    appearance={appearance?.elements?.PasswordLabel}
                                >{`Password`}</Label>
                                <Input
                                    required
                                    type="password"
                                    id="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    appearance={appearance?.elements?.PasswordInput}
                                />
                                {passwordError && (
                                    <Alert appearance={appearance?.elements?.ErrorMessage} type={"error"}>
                                        {passwordError}
                                    </Alert>
                                )}
                            </div>
                            <Button loading={loading} appearance={appearance?.elements?.SubmitButton} type="submit">
                                {appearance?.options?.submitButtonText || "Log In"}
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
                            <AnchorButton
                                onClick={onRedirectToSignup}
                                appearance={appearance?.elements?.RedirectToSignupLink}
                            >
                                {`No account? Sign up`}
                            </AnchorButton>
                        )}
                        {onRedirectToForgotPassword && (
                            <AnchorButton
                                onClick={onRedirectToForgotPassword}
                                appearance={appearance?.elements?.RedirectToForgotPasswordLink}
                            >
                                {`Forgot Password?`}
                            </AnchorButton>
                        )}
                    </div>
                )}
            </Container>
        </div>
    )
}

export default withConfig(Login)
