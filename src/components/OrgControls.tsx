import React, { ChangeEvent, Dispatch, SetStateAction, useState } from "react"
import { Button } from "../elements/Button"
import { Checkbox } from "../elements/Checkbox"
import { Input } from "../elements/Input"
import { Modal } from "../elements/Modal"
import { Paragraph } from "../elements/Paragraph"
import { Popover } from "../elements/Popover"
import { Select } from "../elements/Select"
import { InviteUser, InviteUserAppearance } from "./InviteUser"
import { ActiveOrgInfo, Invitation, OrgAppearance } from "./ManageOrg"
import { OrgSettings, OrgSettingsAppearance } from "./OrgSettings"

export type OrgControlsProps = {
    activeOrg: ActiveOrgInfo
    setActiveOrg: Dispatch<SetStateAction<ActiveOrgInfo | undefined>>
    allOrgs: ActiveOrgInfo[]
    query: string
    setQuery: Dispatch<SetStateAction<string>>
    filters: string[]
    setFilters: Dispatch<SetStateAction<string[]>>
    roles: string[]
    inviteePossibleRoles: string[]
    addInvitation: (invitation: Invitation) => void
    appearance?: OrgAppearance
    inviteUserAppearance?: InviteUserAppearance
    orgSettingsAppearance?: OrgSettingsAppearance
}

export const OrgControls = ({
    activeOrg,
    setActiveOrg,
    allOrgs,
    query,
    setQuery,
    filters,
    setFilters,
    roles,
    inviteePossibleRoles,
    addInvitation,
    appearance,
    inviteUserAppearance,
    orgSettingsAppearance,
}: OrgControlsProps) => {
    const [filterPopover, setFilterPopover] = useState<HTMLButtonElement | null>(null)
    const [showFilterPopover, setShowFilterPopover] = useState(false)
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [showOrgSettingsModal, setShowOrgSettingsModal] = useState(false)
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
            <OrgTextOrSelect activeOrg={activeOrg} setActiveOrg={setActiveOrg} allOrgs={allOrgs} />
            <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={"Search"}
                appearance={appearance?.elements?.SearchInput}
            />
            <Button
                onClick={() => setShowOrgSettingsModal(!showOrgSettingsModal)}
                appearance={appearance?.elements?.OrgSettingsButton}
            >
                {appearance?.options?.orgSettingsButtonContent || "Settings"}
            </Button>
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
            <Modal
                show={showOrgSettingsModal}
                setShow={setShowOrgSettingsModal}
                onClose={() => setShowOrgSettingsModal(false)}
                appearance={appearance?.elements?.OrgSettingsModal}
            >
                <OrgSettings activeOrg={activeOrg} setActiveOrg={setActiveOrg} appearance={orgSettingsAppearance} />
            </Modal>
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
                    <InviteUser orgId={activeOrg.id} onSuccess={onSuccessfulInvite} appearance={inviteUserAppearance} />
                </Modal>
            )}
        </>
    )
}

export type OrgTextOrSelectProps = {
    activeOrg: ActiveOrgInfo
    setActiveOrg: Dispatch<SetStateAction<ActiveOrgInfo | undefined>>
    allOrgs: ActiveOrgInfo[]
    appearance?: OrgAppearance
}

export const OrgTextOrSelect = ({ activeOrg, setActiveOrg, allOrgs, appearance }: OrgTextOrSelectProps) => {
    const options = allOrgs.map((org) => {
        return {
            label: org.name,
            value: org.id,
        }
    })

    function handleChange(e: ChangeEvent<HTMLSelectElement>) {
        e.preventDefault()
        const orgs = allOrgs.find((org) => org.id === e.target.value)
        setActiveOrg(orgs)
    }

    if (allOrgs.length > 1) {
        return (
            <Select
                value={activeOrg.id}
                onChange={handleChange}
                options={options}
                appearance={appearance?.elements?.OrgSelect}
            />
        )
    }

    return <Paragraph appearance={appearance?.elements?.OrgName}>{activeOrg.name}</Paragraph>
}
