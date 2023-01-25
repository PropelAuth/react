import React, { ReactNode, SyntheticEvent, useState } from "react"
import { ElementAppearance } from "../AppearanceProvider"
import { Alert, AlertProps } from "../elements/Alert"
import { AnchorButton } from "../elements/AnchorButton"
import { Button, ButtonProps } from "../elements/Button"
import { Container, ContainerProps } from "../elements/Container"
import { H3, H3Props } from "../elements/H3"
import { Image, ImageProps } from "../elements/Image"
import { Input, InputProps } from "../elements/Input"
import { Label, LabelProps } from "../elements/Label"
import { ProgressProps } from "../elements/Progress"
import { useApi } from "../useApi"
import { withConfig, WithConfigProps } from "../withConfig"
import { ORGS_NOT_ENABLED, ORG_NAME_NOT_FOUND, UNEXPECTED_ERROR, X_CSRF_TOKEN } from "./constants"

export type LoginSSOAppearance = {
    options?: {
        displayLogo?: boolean
        submitButtonText?: ReactNode
    }
    elements?: {
        Progress?: ElementAppearance<ProgressProps>
        Container?: ElementAppearance<ContainerProps>
        Logo?: ElementAppearance<ImageProps>
        Header?: ElementAppearance<H3Props>
        OrgNameLabel?: ElementAppearance<LabelProps>
        OrgNameInput?: ElementAppearance<InputProps>
        SubmitButton?: ElementAppearance<ButtonProps>
        RedirectToLoginLink?: ElementAppearance<ButtonProps>
        ErrorMessage?: ElementAppearance<AlertProps>
    }
}

export type LoginPasswordlessProps = {
    onRedirectToLogin?: VoidFunction
    appearance?: LoginSSOAppearance
} & WithConfigProps

const LoginSSO = ({ onRedirectToLogin, appearance, config }: LoginPasswordlessProps) => {
    const { loginApi } = useApi()
    const [loading, setLoading] = useState(false)
    const [orgName, setOrgName] = useState("")
    const [orgNameError, setOrgNameError] = useState<string | undefined>(undefined)
    const [error, setError] = useState<string | undefined>(undefined)
    const orgMetaname = config.orgsMetaname || "Organization"

    const clearErrors = () => {
        setOrgNameError(undefined)
        setError(undefined)
    }

    async function loginSSO(e: SyntheticEvent) {
        try {
            e.preventDefault()
            clearErrors()
            setLoading(true)
            const response = await loginApi.checkOrgNameForSamlLogin({
                name: orgName,
                xCsrfToken: X_CSRF_TOKEN,
            })
            if (response.ok) {
                window.location.replace(response.body.loginUrl)
            } else {
                response.error._visit({
                    orgsNotEnabled: () => setError(ORGS_NOT_ENABLED),
                    notFoundOrgName: () => setOrgNameError(ORG_NAME_NOT_FOUND),
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
                    <H3 appearance={appearance?.elements?.Header}>{`Login with SSO`}</H3>
                </div>
                <div data-contain="form">
                    <form onSubmit={loginSSO}>
                        <div>
                            <Label
                                htmlFor="org_name"
                                appearance={appearance?.elements?.OrgNameLabel}
                            >{`Enter the name of your ${orgMetaname.toLowerCase()}:`}</Label>
                            <Input
                                required
                                id="org_name"
                                type="text"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                appearance={appearance?.elements?.OrgNameInput}
                            />
                            {orgNameError && (
                                <Alert appearance={appearance?.elements?.ErrorMessage} type={"error"}>
                                    {orgNameError}
                                </Alert>
                            )}
                        </div>
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
                {onRedirectToLogin && (
                    <div data-contain="link">
                        <AnchorButton
                            onClick={onRedirectToLogin}
                            appearance={appearance?.elements?.RedirectToLoginLink}
                        >
                            {`Back to login`}
                        </AnchorButton>
                    </div>
                )}
            </Container>
        </div>
    )
}

export default withConfig(LoginSSO)
