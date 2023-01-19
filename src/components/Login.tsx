import React, { ReactNode, SyntheticEvent, useState } from "react"
import { ElementAppearance } from "../AppearanceProvider"
import { Alert, AlertProps } from "../elements/Alert"
import { Button, ButtonProps } from "../elements/Button"
import { Container, ContainerProps } from "../elements/Container"
import { DividerProps } from "../elements/Divider"
import { H3, H3Props } from "../elements/H3"
import { Image, ImageProps } from "../elements/Image"
import { Input, InputProps } from "../elements/Input"
import { Label } from "../elements/Label"
import { ProgressProps } from "../elements/Progress"
import { useApi } from "../useApi"
import { withConfig, WithConfigProps } from "../withConfig"
import { BAD_REQUEST, NO_ACCOUNT_FOUND_WITH_CREDENTIALS, UNEXPECTED_ERROR, X_CSRF_TOKEN } from "./constants"
import { OrDivider } from "./OrDivider"
import { SignInOptions } from "./SignInOptions"

export type LoginAppearance = {
    options?: {
        headerContent?: ReactNode
        displayLogo?: boolean
        divider?: ReactNode | boolean
        disableLabels?: boolean
        emailLabel?: ReactNode
        passwordLabel?: ReactNode
        submitButtonContent?: ReactNode
        signupButtonContent?: ReactNode
        forgotPasswordButtonContent?: ReactNode
        redirectToSignupFunction?: VoidFunction
        redirectToForgotPasswordFunction?: VoidFunction
        redirectToLoginPasswordlessFunction?: VoidFunction
    }
    elements?: {
        Progress?: ElementAppearance<ProgressProps>
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

type LoginProps = {
    onStepCompleted: VoidFunction
    appearance?: LoginAppearance
} & WithConfigProps

const Login = ({ onStepCompleted, appearance, config }: LoginProps) => {
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
        try {
            e.preventDefault()
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
                {appearance?.options?.displayLogo !== false && config && (
                    <div data-contain="logo">
                        <Image
                            src={config.logoUrl}
                            alt={config.siteDisplayName}
                            appearance={appearance?.elements?.Logo}
                        />
                    </div>
                )}
                <div data-contain="header">
                    <H3 appearance={appearance?.elements?.Header}>{appearance?.options?.headerContent || "Welcome"}</H3>
                </div>
                {config && (config.hasPasswordlessLogin || config.hasAnyNonPasswordLogin) && (
                    <SignInOptions
                        config={config}
                        onRedirectToLoginPasswordless={appearance?.options?.redirectToLoginPasswordlessFunction}
                        buttonAppearance={appearance?.elements?.SocialButton}
                    />
                )}
                {config &&
                    config.hasPasswordLogin &&
                    config.hasAnyNonPasswordLogin &&
                    appearance?.options?.divider !== false && (
                        <OrDivider appearance={appearance?.elements?.Divider} options={appearance?.options?.divider} />
                    )}
                {config && config.hasPasswordLogin && (
                    <div data-contain="form">
                        <form onSubmit={login}>
                            <div>
                                {!appearance?.options?.disableLabels && (
                                    <Label htmlFor="email">{appearance?.options?.emailLabel || "Email"}</Label>
                                )}
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
                                {!appearance?.options?.disableLabels && (
                                    <Label htmlFor="password">{appearance?.options?.passwordLabel || "Password"}</Label>
                                )}
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
                            <Button appearance={appearance?.elements?.SubmitButton} loading={loading}>
                                {appearance?.options?.submitButtonContent || "Log In"}
                            </Button>
                            {error && (
                                <Alert appearance={appearance?.elements?.ErrorMessage} type={"error"}>
                                    {error}
                                </Alert>
                            )}
                        </form>
                    </div>
                )}
                {(appearance?.options?.redirectToSignupFunction ||
                    appearance?.options?.redirectToForgotPasswordFunction) && (
                    <div data-contain="links">
                        {appearance?.options?.redirectToSignupFunction && (
                            <Button
                                onClick={appearance?.options?.redirectToSignupFunction}
                                appearance={appearance?.elements?.SignupButton}
                            >
                                {appearance?.options?.signupButtonContent || "Sign Up"}
                            </Button>
                        )}
                        {appearance?.options?.redirectToForgotPasswordFunction && (
                            <Button
                                onClick={appearance?.options?.redirectToForgotPasswordFunction}
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
}

export default withConfig(Login)
