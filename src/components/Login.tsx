import { PropelAuthFeV2 } from "@propel-auth-fern/fe_v2-client"
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
import { Progress, ProgressProps } from "../elements/Progress"
import { useApi } from "../useApi"
import { useConfig } from "../useConfig"
import { ConfirmEmail, ConfirmEmailAppearance } from "./ConfirmEmail"
import { BAD_REQUEST, NO_ACCOUNT_FOUND_WITH_CREDENTIALS, UNEXPECTED_ERROR, X_CSRF_TOKEN } from "./constants"
import { CreateOrg, CreateOrgAppearance } from "./CreateOrg"
import { SignInDivider } from "./SignInDivider"
import { SignInOptions } from "./SignInOptions"
import { UpdatePassword, UpdatePasswordAppearance } from "./UpdatePassword"
import { UserMetadata, UserMetadataAppearance } from "./UserMetadata"
import { Verify, VerifyAppearance } from "./Verify"

export type LoginProps = {
    onSuccess: VoidFunction
    onRedirectToSignup?: VoidFunction
    onRedirectToForgotPassword?: VoidFunction
    presetEmail?: string
    appearance?: LoginAppearance &
        ConfirmEmailAppearance &
        VerifyAppearance &
        UserMetadataAppearance &
        UpdatePasswordAppearance &
        CreateOrgAppearance
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

export const Login = ({
    onSuccess,
    onRedirectToSignup,
    onRedirectToForgotPassword,
    presetEmail,
    appearance,
}: LoginProps) => {
    const { config } = useConfig()
    const { loginApi } = useApi()
    const { loginStateLoading, loginStateError, loginState, getLoginState } = useLoginState()
    const [email, setEmail] = useState(presetEmail || "")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [emailError, setEmailError] = useState<string | undefined>(undefined)
    const [passwordError, setPasswordError] = useState<string | undefined>(undefined)
    const [error, setError] = useState<string | undefined>(undefined)

    const login = async (e: SyntheticEvent) => {
        try {
            e.preventDefault()
            setLoading(true)
            setError(undefined)
            const options = { email, password, xCsrfToken: X_CSRF_TOKEN }
            const response = await loginApi.login(options)
            if (response.ok) {
                getLoginState()
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

    useEffect(() => {
        if (loginState === PropelAuthFeV2.LoginStateEnum.Finished) {
            onSuccess()
        }
    }, [loginState, onSuccess])

    if (loginStateLoading) {
        return (
            <div data-contain="component">
                <Container appearance={appearance?.elements?.Container}>
                    <Progress appearance={appearance?.elements?.Progress} />
                </Container>
            </div>
        )
    } else if (loginStateError) {
        return (
            <div data-contain="component">
                <Container appearance={appearance?.elements?.Container}>
                    <Progress appearance={appearance?.elements?.Progress} />
                </Container>
            </div>
        )
    }

    switch (loginState) {
        case PropelAuthFeV2.LoginStateEnum.LoginRequired:
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
                            <H3 appearance={appearance?.elements?.Header}>
                                {appearance?.options?.headerContent || "Welcome"}
                            </H3>
                        </div>
                        {config && (config.hasPasswordlessLogin || config.hasAnyNonPasswordLogin) && (
                            <SignInOptions buttonAppearance={appearance?.elements?.SocialButton} config={config} />
                        )}
                        {config &&
                            config.hasPasswordLogin &&
                            config.hasAnyNonPasswordLogin &&
                            appearance?.options?.divider !== false && (
                                <SignInDivider
                                    appearance={appearance?.elements?.Divider}
                                    options={appearance?.options?.divider}
                                />
                            )}
                        {config && config.hasPasswordLogin && (
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
                                        {emailError && (
                                            <Alert appearance={appearance?.elements?.ErrorMessage} type={"error"}>
                                                {emailError}
                                            </Alert>
                                        )}
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
                                        {passwordError && (
                                            <Alert appearance={appearance?.elements?.ErrorMessage} type={"error"}>
                                                {passwordError}
                                            </Alert>
                                        )}
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

        case PropelAuthFeV2.LoginStateEnum.ConfirmEmailRequired:
            return <ConfirmEmail appearance={appearance} />

        case PropelAuthFeV2.LoginStateEnum.TwoFactorRequired:
            return <Verify getLoginState={getLoginState} appearance={appearance} />

        case PropelAuthFeV2.LoginStateEnum.UserMetadataRequired:
            return <UserMetadata getLoginState={getLoginState} config={config} appearance={appearance} />

        case PropelAuthFeV2.LoginStateEnum.UpdatePasswordRequired:
            return <UpdatePassword getLoginState={getLoginState} config={config} appearance={appearance} />

        case PropelAuthFeV2.LoginStateEnum.OrgCreationRequired:
            return <CreateOrg onOrgCreated={getLoginState} appearance={appearance} />

        default:
            return (
                <div data-contain="component">
                    <Container appearance={appearance?.elements?.Container}>
                        <Progress appearance={appearance?.elements?.Progress} />
                    </Container>
                </div>
            )
    }
}

export const useLoginState = () => {
    const { loginApi } = useApi()
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | undefined>(undefined)
    const [loginState, setLoginState] = useState<PropelAuthFeV2.LoginStateEnum | undefined>(undefined)

    useEffect(() => {
        let mounted = true
        setLoading(true)
        loginApi
            .fetchLoginState()
            .then((response) => {
                if (mounted) {
                    if (response.ok) {
                        setLoginState(response.body.loginState)
                    } else {
                        setError(UNEXPECTED_ERROR)
                    }
                }
            })
            .catch((e) => {
                setError(UNEXPECTED_ERROR)
                console.error(e)
            })
            .finally(() => setLoading(false))

        return () => {
            mounted = false
        }
    }, [])

    async function getLoginState() {
        try {
            setLoading(true)
            const response = await loginApi.fetchLoginState()
            console.log("LOGGING getLoginState response", response)
            if (response.ok) {
                setLoginState(response.body.loginState)
            } else {
                setError(UNEXPECTED_ERROR)
            }
        } catch (e) {
            setError(UNEXPECTED_ERROR)
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return {
        loginStateLoading: loading,
        loginStateError: error,
        loginState,
        getLoginState,
    }
}
