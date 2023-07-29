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
import { useApi, UserMetadataResponse } from "../useApi"
import { useRedirectFunctions } from "../useRedirectFunctions"
import { withConfig, WithConfigProps } from "../withConfig"
import { BAD_REQUEST, COMPLETE_ACCOUNT_TEXT, UNEXPECTED_ERROR, X_CSRF_TOKEN } from "./constants"
import { CreateUserFormType } from "./Signup"
import UserPropertyFields, { UserPropertySetting, UserPropertySettings } from "./UserProperties/UserPropertyFields"

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
        const typedPropertySettings = config.userPropertySettings as UserPropertySettings
        // get all fields that are required retroactively and not in metadata
        return (typedPropertySettings.fields || [])
            .filter((property) => {
                const generalChecks =
                    property.is_enabled &&
                    property.field_type !== "PictureUrl" &&
                    property.required &&
                    (!property.required_by || property.required_by <= Date.now())
                let notInMetadata = true
                if (userMetadata) {
                    if (property.name === "legacy__username") {
                        notInMetadata = !userMetadata.username
                    } else if (property.name === "legacy__name") {
                        notInMetadata = !userMetadata.first_name && !userMetadata.last_name
                    }
                }
                return generalChecks && notInMetadata
            })
            .map((property) => ({
                ...property,
                // legacy__username needs special treatment as its the only legacy property that renders with a normal field (i.e. text field)
                name: property.name === "legacy__username" ? "username" : property.name,
            }))
    }, [config.userPropertySettings.fields, userMetadata])

    const form = useForm<CreateUserFormType>({
        initialValues: {
            first_name: userMetadata?.first_name || "",
            last_name: userMetadata?.last_name || "",
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

            if (propertySettings.some((property) => property.name === "legacy__name")) {
                updateMetadataRequest.firstName = values.first_name as string
                updateMetadataRequest.lastName = values.last_name as string
            }
            if (propertySettings.some((property) => property.name === "legacy__username")) {
                updateMetadataRequest.username = values.username as string
            }
            Object.keys(_.omit(values, ["username", "first_name", "last_name", "legacy__name"])).forEach((valueKey) => {
                const propertySetting = propertySettings.find((p) => p.name === valueKey)
                if (
                    form.isDirty(valueKey) ||
                    (propertySetting?.required &&
                        (!propertySetting?.required_by || propertySetting.required_by <= Date.now()))
                ) {
                    updateMetadataRequest.properties = {
                        ...(updateMetadataRequest.properties || {}),
                        [valueKey]: values[valueKey],
                    }
                }
            })
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
                        <UserPropertyFields propertySettings={propertySettings} form={form} />
                        <Button loading={loading} appearance={appearance?.elements?.SubmitButton} type="submit">
                            {appearance?.options?.submitButtonText || "Continue"}
                        </Button>
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
