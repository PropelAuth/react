import { OrgMemberInfo } from "@propelauth/javascript"
import React, { ChangeEvent, Dispatch, SetStateAction, useState } from "react"
import { useOrgHelper } from "../additionalHooks"
import { Button } from "../elements/Button"
import { Checkbox } from "../elements/Checkbox"
import { Input } from "../elements/Input"
import { Modal } from "../elements/Modal"
import { Paragraph } from "../elements/Paragraph"
import { Popover } from "../elements/Popover"
import { Select } from "../elements/Select"
import { InviteUser, InviteUserAppearance } from "./InviteUser"
import { Invitation, OrgAppearance } from "./ManageOrg"

export type OrgControlsProps = {
    orgId: string
    setOrgId: (id: string) => void
    query: string
    setQuery: Dispatch<SetStateAction<string>>
    filters: string[]
    setFilters: Dispatch<SetStateAction<string[]>>
    roles: string[]
    inviteePossibleRoles: string[]
    addInvitation: (invitation: Invitation) => void
    appearance?: OrgAppearance
    inviteUserAppearance?: InviteUserAppearance
}

export const OrgControls = ({
    orgId,
    setOrgId,
    query,
    setQuery,
    filters,
    setFilters,
    roles,
    inviteePossibleRoles,
    addInvitation,
    appearance,
    inviteUserAppearance,
}: OrgControlsProps) => {
    const [filterPopover, setFilterPopover] = useState<HTMLButtonElement | null>(null)
    const [showFilterPopover, setShowFilterPopover] = useState(false)
    const [showInviteModal, setShowInviteModal] = useState(false)
    const canInviteUsers = !!inviteePossibleRoles && inviteePossibleRoles.length > 0

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        setFilters((state) => {
            if (e.target.checked) {
                return [...state, e.target.id]
            } else {
                return [...state.filter((i) => i !== e.target.id)]
            }
        })
    }

    function onSuccessfulInvite(invitation: Invitation) {
        if (invitation) {
            addInvitation(invitation)
        }

        setShowInviteModal(false)
    }

    return (
        <>
            <OrgTextOrSelect orgId={orgId} setOrgId={setOrgId} />
            <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={"Search"}
                appearance={appearance?.elements?.SearchInput}
            />
            <Button
                ref={setFilterPopover}
                onClick={() => setShowFilterPopover(!showFilterPopover)}
                appearance={appearance?.elements?.FilterButton}
            >
                {appearance?.options?.filterButtonContent || "Filter"}
            </Button>
            {canInviteUsers && (
                <Button onClick={() => setShowInviteModal(true)} appearance={appearance?.elements?.InviteButton}>
                    {appearance?.options?.inviteUserButtonContent || "Invite User"}
                </Button>
            )}
            <Popover
                referenceElement={filterPopover}
                show={showFilterPopover}
                setShow={setShowFilterPopover}
                appearance={appearance?.elements?.FilterPopover}
            >
                <div data-contain="filter_group">
                    {roles.map((role) => {
                        const alias = `role:${role.toLowerCase()}`
                        return (
                            <Checkbox
                                key={role}
                                label={role}
                                id={alias}
                                onChange={handleChange}
                                checked={filters.includes(alias)}
                                appearance={appearance?.elements?.FilterCheckbox}
                            />
                        )
                    })}
                </div>
                <div data-contain="filter_group">
                    <Checkbox
                        label={"Pending"}
                        id={"status:pending"}
                        onChange={handleChange}
                        checked={filters.includes("status:pending")}
                        appearance={appearance?.elements?.FilterCheckbox}
                    />
                    <Checkbox
                        label={"Active"}
                        id={"status:active"}
                        onChange={handleChange}
                        checked={filters.includes("status:active")}
                        appearance={appearance?.elements?.FilterCheckbox}
                    />
                </div>
            </Popover>
            {canInviteUsers && (
                <Modal
                    show={showInviteModal}
                    setShow={setShowInviteModal}
                    onClose={() => setShowInviteModal(false)}
                    appearance={appearance?.elements?.InviteModal}
                >
                    <InviteUser orgId={orgId} onSuccess={onSuccessfulInvite} appearance={inviteUserAppearance} />
                </Modal>
            )}
        </>
    )
}

export type OrgTextOrSelectProps = {
    appearance?: OrgAppearance
    orgId: string
    setOrgId: (id: string) => void
}

export const OrgTextOrSelect = ({ appearance, orgId, setOrgId }: OrgTextOrSelectProps) => {
    const { orgHelper } = useOrgHelper()
    function byOrgName(a: OrgMemberInfo, b: OrgMemberInfo) {
        var orgA = a.orgName.toUpperCase()
        var orgB = b.orgName.toUpperCase()
        return orgA < orgB ? -1 : orgA > orgB ? 1 : 0
    }

    const allOrgs = orgHelper?.getOrgs().sort(byOrgName) || []
    const activeOrgName = allOrgs.find((org) => org.orgId === orgId)?.orgName
    const options = allOrgs.map((org) => {
        return {
            label: org.orgName,
            value: org.orgId,
        }
    })

    if (allOrgs.length > 0) {
        return (
            <Select
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
                options={options}
                appearance={appearance?.elements?.OrgSelect}
            />
        )
    }

    return <Paragraph appearance={appearance?.elements?.OrgName}>{activeOrgName}</Paragraph>
}
