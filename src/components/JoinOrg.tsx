import React, { ReactNode, useEffect, useState } from "react"
import { ElementAppearance } from "../AppearanceProvider"
import { Alert, AlertProps } from "../elements/Alert"
import { Button, ButtonProps } from "../elements/Button"
import { Container, ContainerProps } from "../elements/Container"
import { H3, H3Props } from "../elements/H3"
import { Paragraph, ParagraphProps } from "../elements/Paragraph"
import { Progress, ProgressProps } from "../elements/Progress"
import { useApi } from "../useApi"
import {
    BAD_REQUEST_JOIN_ORG,
    NOT_FOUND_JOINABLE_ORG,
    NOT_FOUND_JOIN_ORG,
    UNAUTHORIZED_ORG_USAGE,
    UNEXPECTED_ERROR,
    X_CSRF_TOKEN,
} from "./constants"

export type JoinOrgProps = {
    appearance?: JoinOrgAppearance
    onOrgJoined?: (id: string) => void
}

export type JoinOrgAppearance = {
    options: {
        joinableOrgsHeaderContent: ReactNode
    }
    elements: {
        Progress?: ElementAppearance<ProgressProps>
        Container?: ElementAppearance<ContainerProps>
        JoinableOrgsHeader?: ElementAppearance<H3Props>
        JoinableOrgName?: ElementAppearance<ParagraphProps>
        JoinableOrgButton?: ElementAppearance<ButtonProps>
        ErrorMessage?: ElementAppearance<AlertProps>
    }
}

export const JoinOrg = ({ appearance, onOrgJoined }: JoinOrgProps) => {
    return (
        <div data-contain="component">
            <Container appearance={appearance?.elements?.Container}>
                <JoinableOrgs appearance={appearance} onOrgJoined={onOrgJoined} />
                <PendingInvites />
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
                            notFoundJoinableOrgs: () => setError(NOT_FOUND_JOINABLE_ORG),
                            unauthorizedOrgUsage: () => setError(UNAUTHORIZED_ORG_USAGE),
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
                            unauthorizedOrgUsage: () => setError(UNAUTHORIZED_ORG_USAGE),
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
                            <Button
                                appearance={appearance?.elements?.JoinableOrgButton}
                                onClick={() => joinOrg(org.id)}
                            >
                                Join
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

export const PendingInvites = () => {
    return <div data-contain="section">PendingInvites</div>
}
