import { PropelAuthFeV2 } from "@propel-auth-fern/fe_v2-client"
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
import { Config, withConfig, WithConfigProps } from "../withConfig"
import { BAD_REQUEST, SIGNUP_NOT_ALLOWED, UNEXPECTED_ERROR, X_CSRF_TOKEN } from "./constants"
import { OrDivider } from "./OrDivider"
import { SignInOptions } from "./SignInOptions"

export type SignupAppearance = {
    options?: {
        headerContent?: ReactNode
        displayLogo?: boolean
        disableLabels?: boolean
        divider?: ReactNode | boolean
        firstNameLabel?: ReactNode
        lastNameLabel?: ReactNode
        emailLabel?: ReactNode
        usernameLabel?: ReactNode
        passwordLabel?: ReactNode
        submitButtonContent?: ReactNode
        loginButtonContent?: ReactNode
        redirectToLoginFunction?: VoidFunction
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

export type SignupProps = {
    onSuccess: VoidFunction
    appearance?: SignupAppearance
} & WithConfigProps

const Signup = ({ onSuccess, appearance, config }: SignupProps) => {
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
                        {appearance?.options?.headerContent || "Create an account"}
                    </H3>
                </div>
                <SignInOptions config={config} buttonAppearance={appearance?.elements?.SocialButton} />
                {config &&
                    config.hasPasswordLogin &&
                    config.hasAnyNonPasswordLogin &&
                    appearance?.options?.divider !== false && (
                        <OrDivider appearance={appearance?.elements?.Divider} options={appearance?.options?.divider} />
                    )}
                {config && config.hasPasswordLogin && (
                    <SignupForm config={config} onSuccess={onSuccess} appearance={appearance} />
                )}
                <BottomLinks
                    redirectToLoginFunction={appearance?.options?.redirectToLoginFunction}
                    appearance={appearance}
                />
            </Container>
        </div>
    )
}

type SignupFormProps = {
    onSuccess: VoidFunction
    config: Config
    appearance?: SignupAppearance
}

const SignupForm = ({ config, onSuccess, appearance }: SignupFormProps) => {
    const { userApi } = useApi()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [username, setUsername] = useState("")
    const [emailError, setEmailError] = useState<string | undefined>(undefined)
    const [firstNameError, setFirstNameError] = useState<string | undefined>(undefined)
    const [lastNameError, setLastNameError] = useState<string | undefined>(undefined)
    const [passwordError, setPasswordError] = useState<string | undefined>(undefined)
    const [usernameError, setUsernameError] = useState<string | undefined>(undefined)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | undefined>(undefined)

    const clearErrors = () => {
        setEmailError(undefined)
        setFirstNameError(undefined)
        setLastNameError(undefined)
        setPasswordError(undefined)
        setUsernameError(undefined)
        setError(undefined)
    }

    const signup = async (e: SyntheticEvent) => {
        try {
            e.preventDefault()
            setLoading(true)
            clearErrors()
            const options: PropelAuthFeV2.SignupRequest = {
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
            const response = await userApi.signup(options)
            if (response.ok) {
                onSuccess()
            } else {
                response.error._visit({
                    signupNotAllowed: () => setError(SIGNUP_NOT_ALLOWED),
                    badRequestSignup: (err) => {
                        if (err.email || err.firstName || err.lastName || err.password || err.username) {
                            if (err.email) {
                                setEmailError(err.email.join(", "))
                            }
                            if (err.firstName) {
                                setFirstNameError(err.firstName.join(", "))
                            }
                            if (err.lastName) {
                                setLastNameError(err.lastName.join(", "))
                            }
                            if (err.password) {
                                setPasswordError(err.password.join(", "))
                            }
                            if (err.username) {
                                setUsernameError(err.username.join(", "))
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
        <div data-contain="form">
            <form onSubmit={signup}>
                {config.requireUsersToSetName && (
                    <>
                        <div>
                            {!appearance?.options?.disableLabels && (
                                <Label htmlFor="first_name">
                                    {appearance?.options?.firstNameLabel || "First name"}
                                </Label>
                            )}
                            <Input
                                required
                                id="first_name"
                                type="text"
                                value={firstName}
                                placeholder="First Name"
                                onChange={(e) => setFirstName(e.target.value)}
                                appearance={appearance?.elements?.FirstNameInput}
                            />
                            {firstNameError && (
                                <Alert appearance={appearance?.elements?.ErrorMessage} type={"error"}>
                                    {firstNameError}
                                </Alert>
                            )}
                        </div>
                        <div>
                            {!appearance?.options?.disableLabels && (
                                <Label htmlFor="last_name">{appearance?.options?.lastNameLabel || "Last name"}</Label>
                            )}
                            <Input
                                required
                                type="text"
                                id="last_name"
                                value={lastName}
                                placeholder="Last Name"
                                onChange={(e) => setLastName(e.target.value)}
                                appearance={appearance?.elements?.LastNameInput}
                            />
                            {lastNameError && (
                                <Alert appearance={appearance?.elements?.ErrorMessage} type={"error"}>
                                    {lastNameError}
                                </Alert>
                            )}
                        </div>
                    </>
                )}
                <div>
                    {!appearance?.options?.disableLabels && (
                        <Label htmlFor="email">{appearance?.options?.emailLabel || "Email"}</Label>
                    )}
                    <Input
                        required
                        id="email"
                        type="email"
                        value={email}
                        placeholder="Email"
                        onChange={(e) => setEmail(e.target.value)}
                        appearance={appearance?.elements?.EmailInput}
                    />
                    {emailError && (
                        <Alert appearance={appearance?.elements?.ErrorMessage} type={"error"}>
                            {emailError}
                        </Alert>
                    )}
                </div>
                {config.requireUsersToSetUsername && (
                    <div>
                        {!appearance?.options?.disableLabels && (
                            <Label htmlFor="username">{appearance?.options?.usernameLabel || "Username"}</Label>
                        )}
                        <Input
                            required
                            type="text"
                            id="username"
                            value={username}
                            placeholder="Username"
                            onChange={(e) => setUsername(e.target.value)}
                            appearance={appearance?.elements?.UsernameInput}
                        />
                        {usernameError && (
                            <Alert appearance={appearance?.elements?.ErrorMessage} type={"error"}>
                                {usernameError}
                            </Alert>
                        )}
                    </div>
                )}
                <div>
                    {!appearance?.options?.disableLabels && (
                        <Label htmlFor="password">{appearance?.options?.passwordLabel || "Password"}</Label>
                    )}
                    <Input
                        required
                        id="password"
                        type="password"
                        value={password}
                        placeholder="Password"
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
    redirectToLoginFunction?: VoidFunction
    appearance?: SignupAppearance
}

const BottomLinks = ({ redirectToLoginFunction, appearance }: BottomLinksProps) => {
    return (
        <div data-contain="link">
            {redirectToLoginFunction && (
                <Button onClick={redirectToLoginFunction} appearance={appearance?.elements?.LoginButton}>
                    {appearance?.options?.loginButtonContent || "Already have an account? Log in"}
                </Button>
            )}
        </div>
    )
}

export default withConfig(Signup)
