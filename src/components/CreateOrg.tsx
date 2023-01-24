import { PropelAuthFeV2 } from "@propel-auth-fern/fe_v2-client"
import React, { ReactNode, SyntheticEvent, useEffect, useState } from "react"
import { ElementAppearance } from "../AppearanceProvider"
import { Alert, AlertProps } from "../elements/Alert"
import { Button, ButtonProps } from "../elements/Button"
import { Checkbox, CheckboxProps } from "../elements/Checkbox"
import { Container, ContainerProps } from "../elements/Container"
import { DividerProps } from "../elements/Divider"
import { H3 } from "../elements/H3"
import { Input, InputProps } from "../elements/Input"
import { Label, LabelProps } from "../elements/Label"
import { ProgressProps } from "../elements/Progress"
import { Select, SelectProps } from "../elements/Select"
import { useApi } from "../useApi"
import { useRedirectFunctions } from "../useRedirectFunctions"
import { withConfig, WithConfigProps } from "../withConfig"
import {
    BAD_REQUEST,
    NOT_FOUND_JOINABLE_ORG,
    NOT_FOUND_JOIN_ORG,
    ORG_CREATION_NOT_ENABLED,
    UNEXPECTED_ERROR,
    X_CSRF_TOKEN,
} from "./constants"
import { ErrorMessage } from "./ErrorMessage"
import { Loading } from "./Loading"
import { OrDivider } from "./OrDivider"

export type CreateOrgAppearance = {
    options?: {
        divider?: ReactNode | boolean
        createOrgButtonText?: ReactNode
        joinOrgButtonText?: ReactNode
    }
    elements?: {
        Progress?: ElementAppearance<ProgressProps>
        Container?: ElementAppearance<ContainerProps>
        Header?: ElementAppearance<LabelProps>
        OrgNameLabel?: ElementAppearance<LabelProps>
        OrgNameInput?: ElementAppearance<InputProps>
        AutojoinByDomainCheckbox?: ElementAppearance<CheckboxProps>
        RestrictToDomainCheckbox?: ElementAppearance<CheckboxProps>
        CreateOrgButton?: ElementAppearance<ButtonProps>
        Divider?: ElementAppearance<DividerProps>
        JoinOrgLabel?: ElementAppearance<LabelProps>
        JoinOrgSelect?: ElementAppearance<SelectProps>
        JoinOrgButton?: ElementAppearance<ButtonProps>
        ErrorMessage?: ElementAppearance<AlertProps>
    }
}

type OrgInfo = {
    id: PropelAuthFeV2.OrgId
    name: string
}

type CreateOrgProps = {
    onOrgCreatedOrJoined: (org: OrgInfo) => void
    appearance?: CreateOrgAppearance
    testMode?: boolean
} & WithConfigProps

const CreateOrg = ({ onOrgCreatedOrJoined, appearance, testMode, config }: CreateOrgProps) => {
    const { orgApi } = useApi()
    const [statusLoading, setStatusLoading] = useState(false)
    const [statusError, setStatusError] = useState<string | undefined>(undefined)
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [canUseDomainOptions, setCanUseDomainOptions] = useState(false)
    const [autojoinByDomain, setAutojoinByDomain] = useState(false)
    const [restrictToDomain, setRestrictToDomain] = useState(false)
    const [existingDomain, setExistingDomain] = useState("")
    const [orgNameError, setOrgNameError] = useState<string | undefined>(undefined)
    const [error, setError] = useState<string | undefined>(undefined)
    const { redirectToLoginPage } = useRedirectFunctions()
    const orgMetaname = config?.orgsMetaname || "Organization"
    const autojoinByDomainText = `Any user with an @${existingDomain} email can join without approval.`
    const restrictToDomainText = `Users without an @${existingDomain} email cannot be invited.`

    const clearErrors = () => {
        setStatusError(undefined)
        setOrgNameError(undefined)
        setError(undefined)
    }

    useEffect(() => {
        let mounted = true
        if (!testMode) {
            clearErrors()
            setStatusLoading(true)
            orgApi
                .fetchCreateOrgOptions()
                .then((response) => {
                    if (mounted) {
                        if (response.ok) {
                            // setExistingDomain(response.body.existingDomain) TODO
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
        }
        return () => {
            mounted = false
        }
    }, [])

    async function createOrg(e: SyntheticEvent) {
        e.preventDefault()

        if (testMode) {
            alert(
                "You are currently in test mode. Remove the `overrideCurrentScreenForTesting` prop to create an organization."
            )
            return
        }

        try {
            clearErrors()
            setLoading(true)
            const options = { name, autojoinByDomain, restrictToDomain, xCsrfToken: X_CSRF_TOKEN }
            const response = await orgApi.createOrg(options)
            if (response.ok) {
                onOrgCreatedOrJoined({ id: response.body.orgId, name })
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
                    <H3 appearance={appearance?.elements?.Header}>{`Create your ${orgMetaname}`}</H3>
                </div>
                <div data-contain="form">
                    <form onSubmit={createOrg}>
                        <div>
                            <Label htmlFor="org_name" appearance={appearance?.elements?.OrgNameLabel}>
                                {`What's the name of your ${orgMetaname.toLowerCase()}? This will be visible to other members.`}
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
                                label={autojoinByDomainText}
                                checked={autojoinByDomain}
                                onChange={(e) => setAutojoinByDomain(e.target.checked)}
                                appearance={appearance?.elements?.AutojoinByDomainCheckbox}
                                disabled={!canUseDomainOptions}
                            />
                        </div>
                        <div>
                            <Checkbox
                                id={"restrict_to_domain"}
                                label={restrictToDomainText}
                                checked={restrictToDomain}
                                onChange={(e) => setRestrictToDomain(e.target.checked)}
                                appearance={appearance?.elements?.RestrictToDomainCheckbox}
                                disabled={!canUseDomainOptions}
                            />
                        </div>
                        <Button loading={loading} appearance={appearance?.elements?.CreateOrgButton}>
                            {appearance?.options?.createOrgButtonText || `Create ${orgMetaname}`}
                        </Button>
                        {error && (
                            <Alert appearance={appearance?.elements?.ErrorMessage} type={"error"}>
                                {error}
                            </Alert>
                        )}
                    </form>
                </div>
                {!testMode && (
                    <JoinableOrgs
                        orgMetaname={orgMetaname}
                        onOrgCreatedOrJoined={onOrgCreatedOrJoined}
                        appearance={appearance}
                    />
                )}
            </Container>
        </div>
    )
}

type JoinableOrgsProps = {
    orgMetaname: string
    onOrgCreatedOrJoined: (org: OrgInfo) => void
    appearance?: CreateOrgAppearance
}

const JoinableOrgs = ({ orgMetaname, onOrgCreatedOrJoined, appearance }: JoinableOrgsProps) => {
    const { orgApi } = useApi()
    const [joinableOrgs, setJoinableOrgs] = useState<PropelAuthFeV2.OrgInfoResponse[]>([])
    const [selectedOrgId, setSelectedOrgId] = useState<string>("")
    const [fetchLoading, setFetchLoading] = useState(false)
    const [fetchError, setFetchError] = useState<string | undefined>(undefined)
    const [joinLoading, setJoinLoading] = useState(false)
    const [joinError, setJoinError] = useState<string | undefined>(undefined)
    const { redirectToLoginPage } = useRedirectFunctions()
    const joinOrgText = `Select the ${orgMetaname.toLowerCase()} you'd like to join. Based on your email address, you can join:`

    const clearErrors = () => {
        setFetchError(undefined)
        setJoinError(undefined)
    }

    useEffect(() => {
        let mounted = true
        clearErrors()
        setFetchLoading(true)
        orgApi
            .joinableOrgs()
            .then((response) => {
                if (mounted) {
                    if (response.ok) {
                        setJoinableOrgs(response.body.orgs)
                    } else {
                        response.error._visit({
                            notFoundJoinableOrgs: () => setFetchError(NOT_FOUND_JOINABLE_ORG),
                            unauthorized: redirectToLoginPage,
                            _other: () => setFetchError(UNEXPECTED_ERROR),
                        })
                    }
                }
            })
            .catch((e) => {
                setFetchError(UNEXPECTED_ERROR)
                console.error(e)
            })
            .finally(() => setFetchLoading(false))

        return () => {
            mounted = false
        }
    }, [])

    async function joinOrg(e: SyntheticEvent) {
        try {
            e.preventDefault()
            clearErrors()
            setJoinLoading(true)
            if (!selectedOrgId) {
                setJoinError(`Please select ${orgMetaname} to join.`)
                return
            }
            const response = await orgApi.joinOrg({
                orgId: selectedOrgId,
                xCsrfToken: X_CSRF_TOKEN,
            })
            if (response.ok) {
                const selectedOrg = joinableOrgs.find((org) => org.id === selectedOrgId)
                onOrgCreatedOrJoined(selectedOrg as PropelAuthFeV2.OrgInfoResponse)
            } else {
                response.error._visit({
                    notFoundJoinOrg: () => setJoinError(NOT_FOUND_JOIN_ORG),
                    badRequestJoinOrg: (err) => setJoinError(err.error?.join(", ") || BAD_REQUEST),
                    unauthorized: redirectToLoginPage,
                    _other: () => setJoinError(UNEXPECTED_ERROR),
                })
            }
        } catch (e) {
            setJoinError(UNEXPECTED_ERROR)
            console.error(e)
        } finally {
            setJoinLoading(false)
        }
    }

    if (fetchLoading || joinableOrgs.length <= 0) {
        return null
    } else if (fetchError) {
        return <ErrorMessage errorMessage={fetchError} appearance={appearance} />
    }

    return (
        <>
            <OrDivider appearance={appearance?.elements?.Divider} options={appearance?.options?.divider} />
            <div data-contain="form">
                <form onSubmit={joinOrg}>
                    <div>
                        <Label htmlFor="org" appearance={appearance?.elements?.JoinOrgLabel}>
                            {joinOrgText}
                        </Label>
                        <Select
                            id={"org"}
                            value={selectedOrgId}
                            onChange={(e) => setSelectedOrgId(e.target.value)}
                            appearance={appearance?.elements?.JoinOrgSelect}
                            options={joinableOrgs.map((org) => {
                                return { label: org.name, value: org.id }
                            })}
                        />
                    </div>
                    <Button loading={joinLoading} appearance={appearance?.elements?.JoinOrgButton}>
                        {appearance?.options?.joinOrgButtonText || `Join ${orgMetaname}`}
                    </Button>
                    {joinError && (
                        <Alert appearance={appearance?.elements?.ErrorMessage} type={"error"}>
                            {joinError}
                        </Alert>
                    )}
                </form>
            </div>
        </>
    )
}

export default withConfig(CreateOrg)
