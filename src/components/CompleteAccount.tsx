import { useForm } from "@mantine/form"
import { PropelauthFeV2 } from "@propelauth/js-apis"
import _ from "lodash"
import React, { ReactNode, useEffect, useMemo, useState } from "react"
import { ElementAppearance } from "../AppearanceProvider"
import { Alert, AlertProps } from "../elements/Alert"
import { Button, ButtonProps } from "../elements/Button"
import { Container, ContainerProps } from "../elements/Container"
import { H3, H3Props } from "../elements/H3"
import { Image, ImageProps } from "../elements/Image"
import { InputProps } from "../elements/Input"
import { LabelProps } from "../elements/Label"
import { Paragraph, ParagraphProps } from "../elements/Paragraph"
import { useElements } from "../ElementsProvider"
import { useApi, UserMetadataResponse } from "../useApi"
import { useRedirectFunctions } from "../useRedirectFunctions"
import { withConfig, WithConfigProps } from "../withConfig"
import { BAD_REQUEST, COMPLETE_ACCOUNT_TEXT, UNEXPECTED_ERROR, X_CSRF_TOKEN } from "./constants"
import { CreateUserFormType } from "./Signup"
import UserPropertyFields, {
    LegacyNamePropertySettings,
    LegacyUsernamePropertySettings,
    UserPropertySetting,
    UserPropertySettings,
} from "./UserProperties/UserPropertyFields"

export type CompleteAccountAppearance = {
    options?: {
        displayLogo?: boolean
        submitButtonText?: ReactNode
    }
    elements?: {
        Container?: ElementAppearance<ContainerProps>
        Logo?: ElementAppearance<ImageProps>
        Header?: ElementAppearance<H3Props>
        Content?: ElementAppearance<ParagraphProps>
        FirstNameLabel?: ElementAppearance<LabelProps>
        FirstNameInput?: ElementAppearance<InputProps>
        LastNameLabel?: ElementAppearance<LabelProps>
        LastNameInput?: ElementAppearance<InputProps>
        UsernameLabel?: ElementAppearance<LabelProps>
        UsernameInput?: ElementAppearance<InputProps>
        SubmitButton?: ElementAppearance<ButtonProps>
        ErrorMessage?: ElementAppearance<AlertProps>
    }
}

type UserMetadataProps = {
    onStepCompleted: VoidFunction
    appearance?: CompleteAccountAppearance
    testMode?: boolean
} & WithConfigProps

const CompleteAccount = ({ onStepCompleted, appearance, testMode, config }: UserMetadataProps) => {
    const { userApi, loginApi, legacyApi } = useApi()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | undefined>(undefined)
    const [userMetadata, setUserMetadata] = useState<UserMetadataResponse>(null)
    const { redirectToLoginPage } = useRedirectFunctions()
    const { elements } = useElements()

    const clearErrors = () => {
        setError(undefined)
    }

    useEffect(() => {
        let active = true
        getUserData()
        return () => {
            active = false
        }

        async function getUserData() {
            const result = await legacyApi.getUserMetadata()
            if (!active) {
                return
            }
            setUserMetadata(result)
        }
    }, [])

    const propertySettings = useMemo<UserPropertySetting[]>(() => {
        // get all fields that are required retroactively and not in metadata
        const propertySettingsWithLegacy = ((config.userPropertySettings as UserPropertySettings).fields || []).filter(
            (property) => {
                const generalChecks =
                    property.is_enabled &&
                    property.field_type !== "PictureUrl" &&
                    property.required &&
                    (property.required_by === undefined || property.required_by <= (userMetadata?.user_created_at || 0))
                let notInMetadata = true
                if (userMetadata) {
                    // if require__name or require__username are false, don't include the legacy fields, even if they're enabled
                    if (property.name === "legacy__username") {
                        if (!config.requireUsersToSetUsername) {
                            return false
                        }
                        notInMetadata = !userMetadata.username
                    } else if (property.name === "legacy__name") {
                        if (!config.requireUsersToSetName) {
                            return false
                        }
                        notInMetadata = !userMetadata.first_name || !userMetadata.last_name
                    } else {
                        notInMetadata =
                            !userMetadata.user_properties || !(property.name in userMetadata.user_properties)
                    }
                }
                return generalChecks && notInMetadata
            }
        )

        // add legacy fields if they're enabled and not already in the list
        if (
            config.requireUsersToSetUsername &&
            !propertySettingsWithLegacy.find((property) => property.name === "legacy__username")
        ) {
            propertySettingsWithLegacy.unshift(LegacyUsernamePropertySettings)
        }

        if (
            config.requireUsersToSetName &&
            !propertySettingsWithLegacy.find((property) => property.name === "legacy__name")
        ) {
            propertySettingsWithLegacy.unshift(LegacyNamePropertySettings)
        }

        return propertySettingsWithLegacy
    }, [config.userPropertySettings.fields, userMetadata])

    const form = useForm<CreateUserFormType>({
        initialValues: {
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
            first_name: userMetadata?.first_name || "",
            last_name: userMetadata?.last_name || "",
            // dynamically rendered fields update the form using their property name as a key, so the legacy__username key is used for the username field
            legacy__username: userMetadata?.username || "",
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

    async function updateMetadata(values: CreateUserFormType) {
        if (testMode) {
            alert(
                "You are currently in test mode. Remove the `overrideCurrentScreenForTesting` prop to complete account."
            )
            return
        }

        try {
            clearErrors()
            setLoading(true)
            const updateMetadataRequest: PropelauthFeV2.UpdateUserFacingMetadataRequest = { xCsrfToken: X_CSRF_TOKEN }

            if (config.requireUsersToSetName) {
                updateMetadataRequest.firstName = values.first_name as string
                updateMetadataRequest.lastName = values.last_name as string
            }
            if (config.requireUsersToSetUsername) {
                updateMetadataRequest.username = values.legacy__username as string
            }
            Object.keys(_.omit(values, ["first_name", "last_name", "legacy__name", "legacy__username"])).forEach(
                (valueKey) => {
                    const propertySetting = propertySettings.find((p) => p.name === valueKey)
                    if (form.isDirty(valueKey) || propertySetting?.required) {
                        updateMetadataRequest.properties = {
                            ...(updateMetadataRequest.properties || {}),
                            [valueKey]: values[valueKey],
                        }
                    }
                }
            )
            const response = await userApi.updateMetadata(updateMetadataRequest)
            if (response.ok) {
                const status = await loginApi.fetchLoginState()
                if (status.ok) {
                    onStepCompleted()
                } else {
                    setError(UNEXPECTED_ERROR)
                }
            } else {
                response.error._visit({
                    unauthorized: redirectToLoginPage,
                    badRequestUpdateMetadata: (err) => {
                        if (Object.keys(err).length > 0) {
                            err["legacy__username"] = err["legacy__username"] || err["username"]
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

    function getCompleteAccountContent() {
        if (testMode) {
            if (!config.requireUsersToSetName && !config.requireUsersToSetUsername) {
                return "You are currently in test mode. No information is needed to complete your account."
            }
        }

        return COMPLETE_ACCOUNT_TEXT
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
                    <H3 appearance={appearance?.elements?.Header}>Complete your account</H3>
                </div>
                <div data-contain="content">
                    <Paragraph appearance={appearance?.elements?.Content}>{getCompleteAccountContent()}</Paragraph>
                </div>
                <div data-contain="form">
                    <form onSubmit={form.onSubmit(updateMetadata)}>
                        {userMetadata ? (
                            <UserPropertyFields propertySettings={propertySettings} form={form} />
                        ) : (
                            <elements.Loader />
                        )}
                        <div style={{ marginTop: "16px" }}>
                            <Button loading={loading} appearance={appearance?.elements?.SubmitButton} type="submit">
                                {appearance?.options?.submitButtonText || "Continue"}
                            </Button>
                        </div>
                        {error && (
                            <Alert appearance={appearance?.elements?.ErrorMessage} type={"error"}>
                                {error}
                            </Alert>
                        )}
                    </form>
                </div>
            </Container>
        </div>
    )
}

export default withConfig(CompleteAccount)
