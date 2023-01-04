import { SignupRequest } from "@propel-auth-fern/fe_v2-client/resources"
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
import { useApi } from "../useApi"
import { Config, useConfig } from "../useConfig"
import { BAD_REQUEST, SIGNUP_NOT_ALLOWED, UNEXPECTED_ERROR, X_CSRF_TOKEN } from "./constants"
import { getTokenFromURL } from "./helpers"
import { SignInDivider } from "./SignInDivider"
import { SignInOptions } from "./SignInOptions"

export type SignupProps = {
    onSuccess: VoidFunction
    onRedirectToLogin?: VoidFunction
    presetEmail?: string
    appearance?: SignupAppearance
}

export type SignupAppearance = {
    options?: {
        headerContent?: ReactNode
        displayLogo?: boolean
        divider?: ReactNode | boolean
        firstNameLabel?: ReactNode
        lastNameLabel?: ReactNode
        emailLabel?: ReactNode
        usernameLabel?: ReactNode
        passwordLabel?: ReactNode
        submitButtonContent?: ReactNode
        loginButtonContent?: ReactNode
    }
    elements?: {
        Container?: ElementAppearance<ContainerProps>
        Logo?: ElementAppearance<ImageProps>
        Header?: ElementAppearance<H3Props>
        Divider?: ElementAppearance<DividerProps>
        FirstNameInput?: ElementAppearance<InputProps>
        LastNameInput?: ElementAppearance<InputProps>
        UsernameInput?: ElementAppearance<InputProps>
        EmailInput?: ElementAppearance<InputProps>
        PasswordInput?: ElementAppearance<InputProps>
        SocialButton?: ElementAppearance<ButtonProps>
        SubmitButton?: ElementAppearance<ButtonProps>
        LoginButton?: ElementAppearance<ButtonProps>
        ErrorMessage?: ElementAppearance<AlertProps>
    }
}

export const Signup = ({ onSuccess, onRedirectToLogin, presetEmail, appearance }: SignupProps) => {
    const { config } = useConfig()

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
                    <H3 appearance={appearance?.elements?.Header}>{appearance?.options?.headerContent || "Signup"}</H3>
                </div>
                <SignInOptions config={config} buttonAppearance={appearance?.elements?.SocialButton} />
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
                    <SignupForm config={config} onSuccess={onSuccess} presetEmail={presetEmail} />
                )}
                <BottomLinks onRedirectToLogin={onRedirectToLogin} appearance={appearance} />
            </Container>
        </div>
    )
}

type SignupFormProps = {
    onSuccess: VoidFunction
    config: Config
    presetEmail?: string
    appearance?: SignupAppearance
}

const SignupForm = ({ config, presetEmail, onSuccess, appearance }: SignupFormProps) => {
    const { userApi } = useApi()
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState(presetEmail || "")
    const [password, setPassword] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [username, setUsername] = useState("")
    const [error, setError] = useState<string | undefined>(undefined)

    const signup = async (e: SyntheticEvent) => {
        try {
            e.preventDefault()
            setLoading(true)
            const options: SignupRequest = {
                email: email,
                password: password,
                xCsrfToken: X_CSRF_TOKEN,
            }
            if (config.requireUsersToSetName) {
                options.firstName = firstName
                options.lastName = lastName
            }
            if (config.requireUsersToSetUsername) {
                options.username = username
            }
            const inviteToken = getTokenFromURL()
            if (inviteToken) {
                options.t = inviteToken
            }
            const response = await userApi.signup(options)
            if (response.ok) {
                onSuccess()
            } else {
                response.error._visit({
                    signupNotAllowed: () => setError(SIGNUP_NOT_ALLOWED),
                    badRequestSignup: ({ email, firstName, lastName, password, username }) => {
                        if (email && !!email.length) {
                            setError(email.join(", "))
                        } else if (firstName && !!firstName.length) {
                            setError(firstName.join(", "))
                        } else if (lastName && !!lastName.length) {
                            setError(lastName.join(", "))
                        } else if (password && !!password.length) {
                            setError(password.join(", "))
                        } else if (username && !!username.length) {
                            setError(username.join(", "))
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
        <div data-contain="form">
            <form onSubmit={signup}>
                {config.requireUsersToSetName && (
                    <>
                        <div>
                            <Label htmlFor="first_name">{appearance?.options?.firstNameLabel || "First name"}</Label>
                            <Input
                                required
                                id="first_name"
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                appearance={appearance?.elements?.FirstNameInput}
                            />
                        </div>
                        <div>
                            <Label htmlFor="last_name">{appearance?.options?.lastNameLabel || "Last name"}</Label>
                            <Input
                                required
                                type="text"
                                id="last_name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                appearance={appearance?.elements?.LastNameInput}
                            />
                        </div>
                    </>
                )}
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
                {config.requireUsersToSetUsername && (
                    <div>
                        <Label htmlFor="username">{appearance?.options?.usernameLabel || "Username"}</Label>
                        <Input
                            required
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            appearance={appearance?.elements?.UsernameInput}
                        />
                    </div>
                )}
                <div>
                    <Label htmlFor="password">{appearance?.options?.passwordLabel || "Password"}</Label>
                    <Input
                        required
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        appearance={appearance?.elements?.PasswordInput}
                    />
                </div>
                <Button appearance={appearance?.elements?.SubmitButton} loading={loading}>
                    {appearance?.options?.submitButtonContent || "Sign Up"}
                </Button>
                {error && (
                    <Alert appearance={appearance?.elements?.ErrorMessage} type={"error"}>
                        {error}
                    </Alert>
                )}
            </form>
        </div>
    )
}

type BottomLinksProps = {
    onRedirectToLogin?: VoidFunction
    appearance?: SignupAppearance
}

const BottomLinks = ({ onRedirectToLogin, appearance }: BottomLinksProps) => {
    return (
        <div data-contain="link">
            {onRedirectToLogin && (
                <Button onClick={onRedirectToLogin} appearance={appearance?.elements?.LoginButton}>
                    {appearance?.options?.loginButtonContent || "Log In"}
                </Button>
            )}
        </div>
    )
}
