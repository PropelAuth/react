import React, { ReactNode, useEffect, useState } from "react"
import { useAuthUrl, useOrgHelper } from "../additionalHooks"
import { ElementAppearance } from "../AppearanceProvider"
import { Alert, AlertProps } from "../elements/Alert"
import { Button, ButtonProps } from "../elements/Button"
import { Checkbox, CheckboxProps } from "../elements/Checkbox"
import { Container, ContainerProps } from "../elements/Container"
import { H3, H3Props } from "../elements/H3"
import { Input, InputProps } from "../elements/Input"
import { Label, LabelProps } from "../elements/Label"
import { Progress, ProgressProps } from "../elements/Progress"
import { useApi } from "../useApi"
import { useRedirectFunctions } from "../useRedirectFunctions"
import {
    BAD_REQUEST,
    FORBIDDEN_UPDATE_ORG_METADATA,
    NOT_FOUND_DISABLE_SAML,
    NOT_FOUND_ORG_METADATA,
    NOT_FOUND_SELECTED_ORG_STATUS,
    ORG_UPDATE_SUCCESS,
    UNAUTHORIZED_SELECTED_ORG_STATUS,
    UNEXPECTED_ERROR,
    X_CSRF_TOKEN,
} from "./constants"
import { withHttp } from "./helpers"

export type OrgSettingsProps = {
    orgId: string
    orgMetaname: string
    appearance?: OrgSettingsAppearance
}

export type OrgSettingsAppearance = {
    options?: {
        headerContent?: ReactNode
        orgNameLabel?: ReactNode
        autojoinByDomainLabel?: ReactNode
        restrictToDomainLabel?: ReactNode
        submitButtonContent?: ReactNode
        samlInTestModeButtonContent?: ReactNode
        disableSamlButtonContent?: ReactNode
        enableSamlButtonContent?: ReactNode
    }
    elements?: {
        Progress?: ElementAppearance<ProgressProps>
        Container?: ElementAppearance<ContainerProps>
        Header?: ElementAppearance<H3Props>
        OrgNameLabel?: ElementAppearance<LabelProps>
        OrgNameInput?: ElementAppearance<InputProps>
        AutojoinByDomainCheckbox?: ElementAppearance<CheckboxProps>
        RestrictToDomainCheckbox?: ElementAppearance<CheckboxProps>
        SubmitButton?: ElementAppearance<ButtonProps>
        SamlInTestModeButton?: ElementAppearance<ButtonProps>
        EnableSamlButton?: ElementAppearance<ButtonProps>
        DisableSamlButton?: ElementAppearance<ButtonProps>
        SuccessMessage?: ElementAppearance<AlertProps>
        ErrorMessage?: ElementAppearance<AlertProps>
    }
}

export const OrgSettings = ({ orgId, orgMetaname, appearance }: OrgSettingsProps) => {
    const { authUrl } = useAuthUrl()
    const { orgApi } = useApi()
    const { loading, orgHelper } = useOrgHelper()
    const [canSetupSaml, setCanSetupSaml] = useState(false)
    const [isSamlEnabled, setIsSamlEnabled] = useState(false)
    const [isSamlInTestMode, setIsSamlInTestMode] = useState(false)
    const [statusLoading, setStatusLoading] = useState(false)
    const [disableLoading, setDisableLoading] = useState(false)
    const [submitLoading, setSubmitLoading] = useState(false)
    const [orgName, setOrgName] = useState("")
    const [orgNameError, setOrgNameError] = useState<string | undefined>(undefined)
    const [success, setSuccess] = useState<string | undefined>(undefined)
    const [error, setError] = useState<string | undefined>(undefined)
    const { redirectToLoginPage } = useRedirectFunctions()

    useEffect(() => {
        if (!orgName) {
            if (!loading && orgHelper) {
                const orgs = orgHelper.getOrgs()
                const name = orgs.find((org) => org.orgId === orgId)?.orgName
                setOrgName(name || "")
            }
        }
    }, [loading, orgHelper])

    useEffect(() => {
        let mounted = true
        setError(undefined)
        setStatusLoading(true)
        orgApi
            .fetchSelectedOrgStatus({ id: orgId })
            .then((response) => {
                if (mounted) {
                    if (response.ok) {
                        setCanSetupSaml(response.body.canSetupSaml)
                        setIsSamlEnabled(response.body.isSamlEnabled)
                        setIsSamlInTestMode(response.body.isSamlInTestMode)
                    } else {
                        response.error._visit({
                            unauthorizedOrgSelectedOrgStatus: () => setError(UNAUTHORIZED_SELECTED_ORG_STATUS),
                            notFoundSelectedOrgStatus: () => setError(NOT_FOUND_SELECTED_ORG_STATUS),
                            _other: () => setError(UNEXPECTED_ERROR),
                        })
                    }
                }
            })
            .catch((e) => {
                setError(UNEXPECTED_ERROR)
                console.error(e)
            })
            .finally(() => setStatusLoading(false))

        return () => {
            mounted = false
        }
    }, [isSamlEnabled])

    function enableSaml() {
        const url = withHttp(authUrl)
        return window.location.replace(url + `/saml?id=${orgId}`)
    }

    function samlInTestMode() {
        const url = withHttp(authUrl)
        return window.location.replace(url + `/saml_in_test_mode?id=${orgId}`)
    }

    async function disableSaml() {
        try {
            setDisableLoading(true)
            const response = await orgApi.disableSaml({ orgId, xCsrfToken: X_CSRF_TOKEN })
            if (response.ok) {
                setIsSamlEnabled(true)
            } else {
                response.error._visit({
                    notFoundDisableSaml: () => setError(NOT_FOUND_DISABLE_SAML),
                    unauthorized: redirectToLoginPage,
                    _other: () => setError(UNEXPECTED_ERROR),
                })
            }
        } catch (e) {
            setError(UNEXPECTED_ERROR)
            console.error(e)
        } finally {
            setDisableLoading(false)
        }
    }

    async function updateOrgMetadata() {
        try {
            setSubmitLoading(true)
            const response = await orgApi.updateOrgMetadata({ orgId, name: orgName, xCsrfToken: X_CSRF_TOKEN })
            if (response.ok) {
                setSuccess(ORG_UPDATE_SUCCESS)
            } else {
                response.error._visit({
                    notFoundUpdateOrgMetadata: () => setError(NOT_FOUND_ORG_METADATA),
                    badRequestUpdateOrgMetadata: (err) => {
                        if (err.name) {
                            setOrgNameError(err.name.join(", "))
                        } else {
                            setError(BAD_REQUEST)
                        }
                    },
                    forbiddenUpdateOrgMetadata: () => setError(FORBIDDEN_UPDATE_ORG_METADATA),
                    unauthorized: redirectToLoginPage,
                    _other: () => setError(UNEXPECTED_ERROR),
                })
            }
        } catch (e) {
            setError(UNEXPECTED_ERROR)
            console.error(e)
        } finally {
            setSubmitLoading(false)
        }
    }

    let samlButton
    if (isSamlEnabled && isSamlInTestMode) {
        samlButton = (
            <Button onClick={samlInTestMode} appearance={appearance?.elements?.SamlInTestModeButton}>
                {appearance?.options?.samlInTestModeButtonContent || "SAML in Test Mode"}
            </Button>
        )
    } else if (isSamlEnabled) {
        samlButton = (
            <Button loading={disableLoading} onClick={disableSaml} appearance={appearance?.elements?.DisableSamlButton}>
                {appearance?.options?.disableSamlButtonContent || "Disable SAML"}
            </Button>
        )
    } else {
        samlButton = (
            <Button onClick={enableSaml} appearance={appearance?.elements?.EnableSamlButton}>
                {appearance?.options?.enableSamlButtonContent || "Enable SAML"}
            </Button>
        )
    }

    if (statusLoading || loading) {
        return (
            <div data-contain="component">
                <Progress appearance={appearance?.elements?.Progress} />
            </div>
        )
    }

    return (
        <div data-contain="component">
            <Container appearance={appearance?.elements?.Container}>
                <div data-contain="header">
                    <H3 appearance={appearance?.elements?.Header}>
                        {appearance?.options?.headerContent || `${orgMetaname} Settings`}
                    </H3>
                </div>
                <form onSubmit={updateOrgMetadata}>
                    <div>
                        <Label appearance={appearance?.elements?.OrgNameLabel} htmlFor="org_name">
                            {appearance?.options?.orgNameLabel || orgMetaname + " name"}
                        </Label>
                        <Input
                            id={"org_name"}
                            type={"text"}
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            appearance={appearance?.elements?.OrgNameInput}
                            required
                        />
                        {orgNameError && (
                            <Alert appearance={appearance?.elements?.ErrorMessage} type={"error"}>
                                {orgNameError}
                            </Alert>
                        )}
                    </div>
                    <div>
                        <Checkbox
                            id={"autojoin_by_domain"}
                            label={appearance?.options?.autojoinByDomainLabel || "Auto-join by domain"}
                            checked={false} // todo
                            onChange={() => null} // todo
                            appearance={appearance?.elements?.AutojoinByDomainCheckbox}
                            disabled={true} // todo
                        />
                    </div>
                    <div>
                        <Checkbox
                            id={"restrict_to_domain"}
                            label={appearance?.options?.restrictToDomainLabel || "Restrict to domain"}
                            checked={false} // todo
                            onChange={() => null} // todo
                            appearance={appearance?.elements?.RestrictToDomainCheckbox}
                            disabled={true} // todo
                        />
                    </div>
                    <Button loading={submitLoading} appearance={appearance?.elements?.SubmitButton}>
                        {appearance?.options?.submitButtonContent || `Update ${orgMetaname}`}
                    </Button>
                    {success && (
                        <Alert type={"success"} appearance={appearance?.elements?.SuccessMessage}>
                            {success}
                        </Alert>
                    )}
                    {error && (
                        <Alert type={"error"} appearance={appearance?.elements?.ErrorMessage}>
                            {error}
                        </Alert>
                    )}
                </form>
                {canSetupSaml && <div data-contain="section">{samlButton}</div>}
            </Container>
        </div>
    )
}
