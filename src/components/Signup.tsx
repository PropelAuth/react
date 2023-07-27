import { useForm } from "@mantine/form"
import { PropelauthFeV2 } from "@propelauth/js-apis"
import { BadRequestSignup } from "@propelauth/js-apis/types/resources"
import _ from "lodash"
import React, { ReactNode, useMemo, useState } from "react"
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
import { useApi } from "../useApi"
import { Config, withConfig, WithConfigProps } from "../withConfig"
import { BAD_REQUEST, SIGNUP_NOT_ALLOWED, UNEXPECTED_ERROR, X_CSRF_TOKEN } from "./constants"
import { OrDivider } from "./OrDivider"
import { SignInOptions } from "./SignInOptions"
import UserPropertyFields, {
    UserPropertyFieldsAppearance,
    UserPropertySetting,
    UserPropertySettings,
} from "./UserProperties/UserPropertyFields"

export type SignupAppearance = {
    options?: {
        displayLogo?: boolean
        divider?: ReactNode | boolean
        submitButtonText?: ReactNode
    }
    elements?: {
        Container?: ElementAppearance<ContainerProps>
        Logo?: ElementAppearance<ImageProps>
        Header?: ElementAppearance<H3Props>
        Divider?: ElementAppearance<DividerProps>
        UserPropertyFields?: UserPropertyFieldsAppearance
        EmailLabel?: ElementAppearance<LabelProps>
        EmailInput?: ElementAppearance<InputProps>
        PasswordLabel?: ElementAppearance<LabelProps>
        PasswordInput?: ElementAppearance<InputProps>
        SocialButton?: ElementAppearance<ButtonProps>
        SubmitButton?: ElementAppearance<ButtonProps>
        RedirectToLoginLink?: ElementAppearance<ButtonProps>
        RedirectToPasswordlessLoginButton?: ElementAppearance<ButtonProps>
        RedirectToSSOLoginButton?: ElementAppearance<ButtonProps>
        ErrorMessage?: ElementAppearance<AlertProps>
    }
}

export type CreateUserFormType = Record<string, string | boolean | number | undefined>

export type SignupProps = {
    onSignupCompleted: VoidFunction
    onRedirectToLogin?: VoidFunction
    onRedirectToPasswordlessLogin?: VoidFunction
    onRedirectToSSOLogin?: VoidFunction
    appearance?: SignupAppearance
} & WithConfigProps

const Signup = ({
    onSignupCompleted,
    onRedirectToLogin,
    onRedirectToPasswordlessLogin,
    onRedirectToSSOLogin,
    appearance,
    config,
}: SignupProps) => {
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
                    <H3 appearance={appearance?.elements?.Header}>{`Create an account`}</H3>
                </div>
                <SignInOptions
                    config={config}
                    appearance={appearance}
                    onRedirectToPasswordlessLogin={onRedirectToPasswordlessLogin}
                    onRedirectToSSOLogin={onRedirectToSSOLogin}
                />
                {config.hasPasswordLogin && config.hasAnyNonPasswordLogin && appearance?.options?.divider !== false && (
                    <OrDivider appearance={appearance?.elements?.Divider} options={appearance?.options?.divider} />
                )}
                {config.hasPasswordLogin && (
                    <>
                        <SignupForm config={config} onSignupCompleted={onSignupCompleted} appearance={appearance} />
                        <BottomLinks onRedirectToLogin={onRedirectToLogin} appearance={appearance} />
                    </>
                )}
            </Container>
        </div>
    )
}

type SignupFormProps = {
    onSignupCompleted: VoidFunction
    config: Config
    appearance?: SignupAppearance
}

const SignupForm = ({ config, onSignupCompleted, appearance }: SignupFormProps) => {
    const { userApi } = useApi()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const propertySettings = useMemo<UserPropertySetting[]>(() => {
        const typedPropertySettings = config.userPropertySettings as UserPropertySettings
        return (typedPropertySettings.fields || [])
            .filter(
                (property) => property.is_enabled && property.field_type !== "PictureUrl" && property.collect_on_signup
            )
            .map((property) => ({
                ...property,
                // legacy__username needs special treatment as its the only legacy property that renders with a normal field (i.e. text field)
                name: property.name === "legacy__username" ? "username" : property.name,
            }))
    }, [config.userPropertySettings.fields])

    const form = useForm<CreateUserFormType>({
        initialValues: {
            email: "",
            password: "",
            first_name: "",
            last_name: "",
            ...propertySettings
                .map((property) => {
                    // initialize the list with the correct values
                    let defaultValue: CreateUserFormType[string] = ""
                    if (property.field_type === "Checkbox" || property.field_type === "Toggle") {
                        defaultValue = false
                    }
                    return { [property.name]: defaultValue }
                })
                .reduce((acc, property) => ({ ...acc, ...property }), {}),
        },
        transformValues: (values: CreateUserFormType) => {
            const transformedValues = { ...values }
            propertySettings.forEach((property) => {
                if (property.field_type === "Integer") {
                    transformedValues[property.name] = parseInt(transformedValues[property.name] as string)
                }
            })
            return transformedValues
        },
    })

    const signup = async (values: CreateUserFormType) => {
        try {
            setLoading(true)
            const signupRequest: PropelauthFeV2.SignupRequest = {
                email: values.email as string,
                password: values.password as string,
                xCsrfToken: X_CSRF_TOKEN,
            }
            if (config.requireUsersToSetName) {
                signupRequest.firstName = values.first_name as string
                signupRequest.lastName = values.last_name as string
            }
            if (config.requireUsersToSetUsername) {
                signupRequest.username = values.username as string
            }
            Object.keys(
                _.omit(values, ["username", "first_name", "last_name", "legacy__name", "email", "password"])
            ).forEach((valueKey) => {
                if (form.isDirty(valueKey) || propertySettings.find((p) => p.name === valueKey)?.required_on_signup) {
                    signupRequest.properties = {
                        ...(signupRequest.properties || {}),
                        [valueKey]: values[valueKey],
                    }
                }
            })
            const response = await userApi.signup(signupRequest)
            if (response.ok) {
                onSignupCompleted()
            } else {
                response.error._visit({
                    signupNotAllowed: () => setError(SIGNUP_NOT_ALLOWED),
                    badRequestSignup: (err: BadRequestSignup) => {
                        if (Object.keys(err).length > 0) {
                            form.setErrors(err)
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
            <form onSubmit={form.onSubmit(signup)}>
                <div>
                    <Label htmlFor="email" appearance={appearance?.elements?.EmailLabel}>
                        {`Email`}
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder={appearance?.elements?.EmailLabel === null ? "Email" : undefined}
                        appearance={appearance?.elements?.EmailInput}
                        {...form.getInputProps("email")}
                    />
                    {form.errors["email"] && (
                        <Alert appearance={appearance?.elements?.ErrorMessage} type={"error"}>
                            {form.errors["email"]}
                        </Alert>
                    )}
                </div>
                <div>
                    <Label htmlFor="password" appearance={appearance?.elements?.PasswordLabel}>
                        {`Password`}
                    </Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder={appearance?.elements?.PasswordLabel === null ? "Password" : undefined}
                        appearance={appearance?.elements?.PasswordInput}
                        {...form.getInputProps("password")}
                    />
                    {form.errors["password"] && (
                        <Alert appearance={appearance?.elements?.ErrorMessage} type={"error"}>
                            {form.errors["password"]}
                        </Alert>
                    )}
                </div>
                <UserPropertyFields
                    propertySettings={propertySettings}
                    form={form}
                    appearance={appearance?.elements?.UserPropertyFields}
                />
                <Button loading={loading} appearance={appearance?.elements?.SubmitButton} type="submit">
                    {appearance?.options?.submitButtonText || "Sign Up"}
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
                <AnchorButton onClick={onRedirectToLogin} appearance={appearance?.elements?.RedirectToLoginLink}>
                    {`Already have an account? Log in`}
                </AnchorButton>
            )}
        </div>
    )
}

export default withConfig(Signup)
