import { PropelAuthFeV2 } from "@propel-auth-fern/fe_v2-client"
import React, { ReactNode, SyntheticEvent, useEffect, useState } from "react"
import { ElementAppearance } from "../AppearanceProvider"
import { Alert, AlertProps } from "../elements/Alert"
import { Button, ButtonProps } from "../elements/Button"
import { Checkbox, CheckboxProps } from "../elements/Checkbox"
import { Container, ContainerProps } from "../elements/Container"
import { H3 } from "../elements/H3"
import { Input, InputProps } from "../elements/Input"
import { Label, LabelProps } from "../elements/Label"
import { ProgressProps } from "../elements/Progress"
import { useApi } from "../useApi"
import { useRedirectFunctions } from "../useRedirectFunctions"
import { withConfig, WithConfigProps } from "../withConfig"
import { BAD_REQUEST, ORG_CREATION_NOT_ENABLED, UNEXPECTED_ERROR, X_CSRF_TOKEN } from "./constants"
import { ErrorMessage } from "./ErrorMessage"
import { Loading } from "./Loading"

export type CreateOrgAppearance = {
    options?: {
        headerContent?: ReactNode
        orgNameLabel?: ReactNode
        autojoinByDomainLabel?: ReactNode
        restrictToDomainLabel?: ReactNode
        submitButtonContent?: ReactNode
    }
    elements?: {
        Progress?: ElementAppearance<ProgressProps>
        Container?: ElementAppearance<ContainerProps>
        Header?: ElementAppearance<LabelProps>
        OrgNameLabel?: ElementAppearance<LabelProps>
        OrgNameInput?: ElementAppearance<InputProps>
        AutojoinByDomainCheckbox?: ElementAppearance<CheckboxProps>
        RestrictToDomainCheckbox?: ElementAppearance<CheckboxProps>
        SubmitButton?: ElementAppearance<ButtonProps>
        ErrorMessage?: ElementAppearance<AlertProps>
    }
}

type OrgInfo = {
    id: PropelAuthFeV2.OrgId
    name: string
}

type CreateOrgProps = {
    onOrgCreated: (org: OrgInfo) => void
    appearance?: CreateOrgAppearance
} & WithConfigProps

const CreateOrg = ({ onOrgCreated, appearance, config }: CreateOrgProps) => {
    const { orgApi } = useApi()
    const [statusLoading, setStatusLoading] = useState(false)
    const [statusError, setStatusError] = useState<string | undefined>(undefined)
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [canUseDomainOptions, setCanUseDomainOptions] = useState(false)
    const [autojoinByDomain, setAutojoinByDomain] = useState(false)
    const [restrictToDomain, setRestrictToDomain] = useState(false)
    const [orgNameError, setOrgNameError] = useState<string | undefined>(undefined)
    const [error, setError] = useState<string | undefined>(undefined)
    const { redirectToLoginPage } = useRedirectFunctions()
    const orgMetaname = config?.orgsMetaname || "Organization"

    const clearErrors = () => {
        setStatusError(undefined)
        setOrgNameError(undefined)
        setError(undefined)
    }

    useEffect(() => {
        let mounted = true
        clearErrors()
        setStatusLoading(true)
        orgApi
            .fetchCreateOrgOptions()
            .then((response) => {
                if (mounted) {
                    if (response.ok) {
                        setCanUseDomainOptions(response.body.canUseDomainOptions)
                    } else {
                        response.error._visit({
                            orgCreationNotEnabled: () => setStatusError(ORG_CREATION_NOT_ENABLED),
                            unauthorized: redirectToLoginPage,
                            _other: () => setStatusError(UNEXPECTED_ERROR),
                        })
                    }
                }
            })
            .catch((e) => {
                setStatusError(UNEXPECTED_ERROR)
                console.error(e)
            })
            .finally(() => setStatusLoading(false))

        return () => {
            mounted = false
        }
    }, [])

    async function createOrg(e: SyntheticEvent) {
        try {
            e.preventDefault()
            clearErrors()
            setLoading(true)
            const options = { name, autojoinByDomain, restrictToDomain, xCsrfToken: X_CSRF_TOKEN }
            const response = await orgApi.createOrg(options)
            if (response.ok) {
                onOrgCreated({ id: response.body.orgId, name })
            } else {
                response.error._visit({
                    orgCreationNotEnabled: () => setError(ORG_CREATION_NOT_ENABLED),
                    badRequestCreateOrg: (err) => {
                        if (err.name || err.error) {
                            if (err.name) {
                                setOrgNameError(err.name.join(", "))
                            }
                            if (err.error) {
                                setError(err.error.join(", "))
                            }
                        } else {
                            setError(BAD_REQUEST)
                        }
                    },
                    unauthorized: redirectToLoginPage,
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

    if (statusLoading) {
        return <Loading appearance={appearance} />
    } else if (statusError) {
        return <ErrorMessage errorMessage={statusError} appearance={appearance} />
    }

    return (
        <div data-contain="component">
            <Container appearance={appearance?.elements?.Container}>
                <div data-contain="header">
                    <H3 appearance={appearance?.elements?.Header}>
                        {appearance?.options?.headerContent || `Create your ${orgMetaname}`}
                    </H3>
                </div>
                <div data-contain="form">
                    <form onSubmit={createOrg}>
                        <div>
                            <Label appearance={appearance?.elements?.OrgNameLabel} htmlFor="org_name">
                                {appearance?.options?.orgNameLabel || orgMetaname + " name"}
                            </Label>
                            <Input
                                id={"org_name"}
                                type={"text"}
                                value={name}
                                placeholder="Name"
                                onChange={(e) => setName(e.target.value)}
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
                                checked={autojoinByDomain}
                                onChange={(e) => setAutojoinByDomain(e.target.checked)}
                                appearance={appearance?.elements?.AutojoinByDomainCheckbox}
                                disabled={canUseDomainOptions}
                            />
                        </div>
                        <div>
                            <Checkbox
                                id={"restrict_to_domain"}
                                label={appearance?.options?.restrictToDomainLabel || "Restrict to domain"}
                                checked={restrictToDomain}
                                onChange={(e) => setRestrictToDomain(e.target.checked)}
                                appearance={appearance?.elements?.RestrictToDomainCheckbox}
                                disabled={canUseDomainOptions}
                            />
                        </div>
                        <Button loading={loading} appearance={appearance?.elements?.SubmitButton}>
                            {appearance?.options?.submitButtonContent || `Create ${orgMetaname}`}
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

export default withConfig(CreateOrg)
