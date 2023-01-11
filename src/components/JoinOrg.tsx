import { Invitation } from "@propel-auth-fern/fe_v2-client/types/resources"
import React, { ReactNode, useEffect, useState } from "react"
import { ElementAppearance } from "../AppearanceProvider"
import { Alert, AlertProps } from "../elements/Alert"
import { Button, ButtonProps } from "../elements/Button"
import { Container, ContainerProps } from "../elements/Container"
import { H3, H3Props } from "../elements/H3"
import { Paragraph, ParagraphProps } from "../elements/Paragraph"
import { Progress, ProgressProps } from "../elements/Progress"
import { useApi } from "../useApi"
import { useRedirectFunctions } from "../useRedirectFunctions"
import {
    BAD_REQUEST,
    BAD_REQUEST_JOIN_ORG,
    NOT_FOUND_JOINABLE_ORG,
    NOT_FOUND_JOIN_ORG,
    NOT_FOUND_ORG_INVITATION,
    ORGS_NOT_ENABLED,
    UNEXPECTED_ERROR,
    X_CSRF_TOKEN,
} from "./constants"

export type JoinOrgProps = {
    appearance?: JoinOrgAppearance
    onOrgJoined?: (id: string) => void
}

export type JoinOrgAppearance = {
    options: {
        joinableOrgsHeaderContent?: ReactNode
        pendingInvitesHeaderContent?: ReactNode
        joinOrgButtonContent?: ReactNode
        acceptInviteButtonContent?: ReactNode
        declineInviteButtonContent?: ReactNode
    }
    elements: {
        Progress?: ElementAppearance<ProgressProps>
        Container?: ElementAppearance<ContainerProps>
        JoinableOrgsHeader?: ElementAppearance<H3Props>
        JoinableOrgName?: ElementAppearance<ParagraphProps>
        JoinOrgButton?: ElementAppearance<ButtonProps>
        PendingInvitesHeader?: ElementAppearance<H3Props>
        PendingInviteOrgName?: ElementAppearance<ParagraphProps>
        AcceptInviteButton?: ElementAppearance<ButtonProps>
        DeclineInviteButton?: ElementAppearance<ButtonProps>
        ErrorMessage?: ElementAppearance<AlertProps>
    }
}

export const JoinOrg = ({ appearance, onOrgJoined }: JoinOrgProps) => {
    return (
        <div data-contain="component">
            <Container appearance={appearance?.elements?.Container}>
                <JoinableOrgs appearance={appearance} onOrgJoined={onOrgJoined} />
                <PendingInvites appearance={appearance} />
            </Container>
        </div>
    )
}

export type JoinableOrg = {
    id: string
    name: string
}

export const JoinableOrgs = ({ appearance, onOrgJoined }: JoinOrgProps) => {
    const { orgApi } = useApi()
    const [joinableOrgs, setJoinableOrgs] = useState<JoinableOrg[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | undefined>(undefined)
    const { redirectToLoginPage } = useRedirectFunctions()

    useEffect(() => {
        let mounted = true
        orgApi
            .joinableOrgs()
            .then((response) => {
                if (mounted) {
                    if (response.ok) {
                        setJoinableOrgs(response.body.orgs)
                    } else {
                        response.error._visit({
                            unauthorized: redirectToLoginPage,
                            notFoundJoinableOrgs: () => setError(NOT_FOUND_JOINABLE_ORG),
                            _other: () => setError(UNEXPECTED_ERROR),
                        })
                    }
                }
            })
            .then(() => setLoading(false))
            .catch((e) => {
                setError(UNEXPECTED_ERROR)
                console.error(e)
            })

        return () => {
            mounted = false
            setLoading(false)
        }
    }, [orgApi])

    function joinOrg(id: string) {
        try {
            setLoading(true)
            setError(undefined)
            orgApi
                .joinOrg({ orgId: id, xCsrfToken: X_CSRF_TOKEN })
                .then((res) => {
                    if (res.ok) {
                        if (onOrgJoined) {
                            onOrgJoined(id)
                        }
                    } else {
                        res.error._visit({
                            notFoundJoinOrg: () => setError(NOT_FOUND_JOIN_ORG),
                            badRequestJoinOrg: () => setError(BAD_REQUEST_JOIN_ORG),
                            unauthorized: redirectToLoginPage,
                            _other: () => setError(UNEXPECTED_ERROR),
                        })
                    }
                })
                .then(() => setLoading(false))
                .catch((e) => {
                    setError(UNEXPECTED_ERROR)
                    console.error(e)
                })
        } catch (e) {
            setLoading(false)
            setError(UNEXPECTED_ERROR)
            console.error(e)
        }
    }

    if (loading) {
        return (
            <div data-contain="section">
                <Progress appearance={appearance?.elements?.Progress} />
            </div>
        )
    }

    return (
        <div data-contain="section">
            <div data-contain="header">
                <H3 appearance={appearance?.elements?.JoinableOrgsHeader}>
                    {appearance?.options?.joinableOrgsHeaderContent || "Joinable Organizations"}
                </H3>
            </div>
            {joinableOrgs.length > 0 ? (
                joinableOrgs.map((org) => {
                    return (
                        <div data-contain="row" key={org.id}>
                            <Paragraph appearance={appearance?.elements?.JoinableOrgName}>{org.name}</Paragraph>
                            <Button appearance={appearance?.elements?.JoinOrgButton} onClick={() => joinOrg(org.id)}>
                                {appearance?.options?.joinOrgButtonContent || "Join"}
                            </Button>
                        </div>
                    )
                })
            ) : (
                <div data-contain="row">
                    <Paragraph appearance={appearance?.elements?.JoinableOrgName}>None</Paragraph>
                </div>
            )}
            {error && (
                <Alert type={"error"} appearance={appearance?.elements?.ErrorMessage}>
                    {error}
                </Alert>
            )}
        </div>
    )
}

export const PendingInvites = ({ appearance }: JoinOrgProps) => {
    const { orgApi } = useApi()
    const [pendingInvites, setPendingInvites] = useState<Invitation[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | undefined>(undefined)
    const { redirectToLoginPage } = useRedirectFunctions()

    useEffect(() => {
        let mounted = true
        orgApi
            .fetchPendingOrgInvites()
            .then((response) => {
                if (mounted) {
                    if (response.ok) {
                        setPendingInvites(response.body.pendingInvites)
                    } else {
                        response.error._visit({
                            unauthorized: redirectToLoginPage,
                            orgsNotEnabled: () => setError(ORGS_NOT_ENABLED),
                            _other: () => setError(UNEXPECTED_ERROR),
                        })
                    }
                }
            })
            .then(() => setLoading(false))
            .catch((e) => {
                setError(UNEXPECTED_ERROR)
                console.error(e)
            })

        return () => {
            mounted = false
            setLoading(false)
        }
    }, [])

    function removePendingInvite(id: string) {
        setPendingInvites((invites) => invites.filter((i) => i.orgId !== id))
    }

    function respondToInvite(orgId: string, accept: boolean) {
        try {
            setLoading(true)
            setError(undefined)
            orgApi
                .respondToOrgInvite({ accept, orgId, xCsrfToken: X_CSRF_TOKEN })
                .then((res) => {
                    if (res.ok) {
                        removePendingInvite(orgId)
                    } else {
                        res.error._visit({
                            notFoundOrgInvitation: () => setError(NOT_FOUND_ORG_INVITATION),
                            badRequestOrgInvitation: (err) => {
                                if (err.accept || err.orgId) {
                                    if (err.accept) {
                                        setError(err.accept.join(", "))
                                    }
                                    if (err.orgId) {
                                        setError(err.orgId.join(", "))
                                    }
                                } else {
                                    setError(BAD_REQUEST)
                                }
                            },
                            unauthorized: redirectToLoginPage,
                            _other: () => setError(UNEXPECTED_ERROR),
                        })
                    }
                })
                .then(() => setLoading(false))
                .catch((e) => {
                    setError(UNEXPECTED_ERROR)
                    console.error(e)
                })
        } catch (e) {
            setLoading(false)
            setError(UNEXPECTED_ERROR)
            console.error(e)
        }
    }

    if (loading) {
        return (
            <div data-contain="section">
                <Progress appearance={appearance?.elements?.Progress} />
            </div>
        )
    }
    return (
        <div data-contain="section">
            <div data-contain="header">
                <H3 appearance={appearance?.elements?.PendingInvitesHeader}>
                    {appearance?.options?.pendingInvitesHeaderContent || "Pending Invites"}
                </H3>
            </div>
            {pendingInvites.length > 0 ? (
                pendingInvites.map((invite, i) => {
                    return (
                        <div data-contain="row" key={i}>
                            <Paragraph appearance={appearance?.elements?.PendingInviteOrgName}>
                                {invite.orgName}
                            </Paragraph>
                            <div data-contain="row_buttons">
                                <Button
                                    appearance={appearance?.elements?.AcceptInviteButton}
                                    onClick={() => respondToInvite(invite.orgId, true)}
                                >
                                    {appearance?.options?.acceptInviteButtonContent || "Accept"}
                                </Button>
                                <Button
                                    appearance={appearance?.elements?.DeclineInviteButton}
                                    onClick={() => respondToInvite(invite.orgId, false)}
                                >
                                    {appearance?.options?.declineInviteButtonContent || "Decline"}
                                </Button>
                            </div>
                        </div>
                    )
                })
            ) : (
                <div data-contain="row">
                    <Paragraph appearance={appearance?.elements?.PendingInviteOrgName}>None</Paragraph>
                </div>
            )}
            {error && (
                <Alert type={"error"} appearance={appearance?.elements?.ErrorMessage}>
                    {error}
                </Alert>
            )}
        </div>
    )
}
