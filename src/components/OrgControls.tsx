import React, { ChangeEvent, Dispatch, SetStateAction, useState } from "react"
import { Button } from "../elements/Button"
import { Checkbox } from "../elements/Checkbox"
import { Input } from "../elements/Input"
import { Modal } from "../elements/Modal"
import { Popover } from "../elements/Popover"
import { InviteUser } from "./InviteUser"
import { Invitation, OrgAppearance } from "./ManageOrg"

export type OrgControlsProps = {
    orgId: string
    query: string
    setQuery: Dispatch<SetStateAction<string>>
    filters: string[]
    setFilters: Dispatch<SetStateAction<string[]>>
    roles: string[]
    inviteePossibleRoles: string[]
    addInvitation: (invitation: Invitation) => void
    appearance?: OrgAppearance
}

export const OrgControls = ({
    orgId,
    query,
    setQuery,
    filters,
    setFilters,
    roles,
    inviteePossibleRoles,
    addInvitation,
    appearance,
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
                    <InviteUser orgId={orgId} onSuccess={onSuccessfulInvite} />
                </Modal>
            )}
        </>
    )
}
