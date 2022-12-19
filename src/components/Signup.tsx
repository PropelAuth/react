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
import { BAD_REQUEST_SIGNUP, UNEXPECTED_ERROR } from "./constants"
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
                            src={config.logo_url}
                            alt={config.site_display_name}
                            appearance={appearance?.elements?.Logo}
                        />
                    </div>
                )}
                <div data-contain="header">
                    <H3 appearance={appearance?.elements?.Header}>{appearance?.options?.headerContent || "Signup"}</H3>
                </div>
                <SignInOptions config={config} buttonAppearance={appearance?.elements?.SocialButton} />
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
                    <SignupForm config={config} onSuccess={onSuccess} presetEmail={presetEmail} />
                )}
                <BottomLinks onRedirectToLogin={onRedirectToLogin} appearance={appearance} />
            </Container>
        </div>
    )
}

export type SignupOptions = {
    _body: {
        email: string
        password: string
        username?: string
        firstName?: string
        lastName?: string
        inviteToken?: string
    }
    t?: string
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
            const options: SignupOptions = {
                _body: {
                    email: email,
                    password: password,
                },
            }
            if (config.require_name) {
                options._body.firstName = firstName
                options._body.lastName = lastName
            }
            if (config.require_username) {
                options._body.username = username
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
                    badRequestSignup: () => setError(BAD_REQUEST_SIGNUP),
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
                {config.require_name && (
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
                {config.require_username && (
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
