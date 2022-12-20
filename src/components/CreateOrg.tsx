import { OrgResponse } from "@propel-auth-fern/fe_v2-client/resources"
import React, { ReactNode, SyntheticEvent, useState } from "react"
import { ElementAppearance } from "../AppearanceProvider"
import { Alert, AlertProps } from "../elements/Alert"
import { Button, ButtonProps } from "../elements/Button"
import { Checkbox, CheckboxProps } from "../elements/Checkbox"
import { Container, ContainerProps } from "../elements/Container"
import { H3, H3Props } from "../elements/H3"
import { Image, ImageProps } from "../elements/Image"
import { Input, InputProps } from "../elements/Input"
import { Label } from "../elements/Label"
import { useApi } from "../useApi"
import { Config, useConfig } from "../useConfig"
import { BAD_REQUEST_CREATE_ORG, NOT_FOUND_CREATE_ORG, UNAUTHORIZED_ORG_USAGE, UNEXPECTED_ERROR } from "./constants"

export type CreateOrgProps = {
    config: Config | null
    onOrgCreated: (response: OrgResponse) => void
    appearance?: CreateOrgAppearance
}

export type CreateOrgAppearance = {
    options?: {
        headerContent?: ReactNode
        displayLogo?: boolean
        orgNameLabel?: ReactNode
        autojoinByDomainLabel?: ReactNode
        restrictToDomainLabel?: ReactNode
        submitButtonContent?: ReactNode
    }
    elements?: {
        Container?: ElementAppearance<ContainerProps>
        Header?: ElementAppearance<H3Props>
        Logo?: ElementAppearance<ImageProps>
        OrgNameInput?: ElementAppearance<InputProps>
        AutojoinByDomainCheckbox?: ElementAppearance<CheckboxProps>
        RestrictToDomainCheckbox?: ElementAppearance<CheckboxProps>
        SubmitButton?: ElementAppearance<ButtonProps>
        ErrorMessage?: ElementAppearance<AlertProps>
    }
}

export const CreateOrg = ({ onOrgCreated, appearance }: CreateOrgProps) => {
    const { orgApi } = useApi()
    const { config } = useConfig()
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [autojoinByDomain, setAutojoinByDomain] = useState(false)
    const [restrictToDomain, setRestrictToDomain] = useState(false)
    const [error, setError] = useState<string | undefined>(undefined)
    const orgMetaname = (config && config.orgs_metaname) || "Organization"

    async function createOrg(e: SyntheticEvent) {
        try {
            e.preventDefault()
            setLoading(true)
            setError(undefined)
            const options = { name, autojoinByDomain, restrictToDomain }
            const response = await orgApi.createOrg(options)
            if (response.ok) {
                onOrgCreated(response.body)
            } else {
                response.error._visit({
                    notFoundCreateOrg: () => setError(NOT_FOUND_CREATE_ORG),
                    badRequestCreateOrg: () => setError(BAD_REQUEST_CREATE_ORG),
                    unauthorizedOrgUsage: () => setError(UNAUTHORIZED_ORG_USAGE),
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
                {appearance?.options?.displayLogo && config && (
                    <div data-contain="logo">
                        <Image
                            src={config.logo_url}
                            alt={config.site_display_name}
                            appearance={appearance?.elements?.Logo}
                        />
                    </div>
                )}
                <div data-contain="header">
                    <H3 appearance={appearance?.elements?.Header}>
                        {appearance?.options?.headerContent || `Create your ${orgMetaname}`}
                    </H3>
                </div>
                <div data-contain="form">
                    <form onSubmit={createOrg}>
                        <div>
                            <Label htmlFor="org_name">
                                {appearance?.options?.orgNameLabel || orgMetaname + "name"}
                            </Label>
                            <Input
                                id={"org_name"}
                                type={"text"}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                appearance={appearance?.elements?.OrgNameInput}
                                required
                            />
                        </div>
                        <div>
                            <Checkbox
                                id={"autojoin_by_domain"}
                                label={appearance?.options?.autojoinByDomainLabel || "Auto-join by domain"}
                                checked={autojoinByDomain}
                                onChange={(e) => setAutojoinByDomain(e.target.checked)}
                                appearance={appearance?.elements?.AutojoinByDomainCheckbox}
                                disabled={true}
                            />
                        </div>
                        <div>
                            <Checkbox
                                id={"restrict_to_domain"}
                                label={appearance?.options?.restrictToDomainLabel || "Restrict to domain"}
                                checked={restrictToDomain}
                                onChange={(e) => setRestrictToDomain(e.target.checked)}
                                appearance={appearance?.elements?.RestrictToDomainCheckbox}
                                disabled={true}
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
