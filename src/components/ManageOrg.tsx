import React, { ReactNode, useEffect, useState } from "react"
import { useOrgHelper } from "../additionalHooks"
import { ElementAppearance } from "../AppearanceProvider"
import { AlertProps } from "../elements/Alert"
import { Button, ButtonProps } from "../elements/Button"
import { CheckboxProps } from "../elements/Checkbox"
import { Container, ContainerProps } from "../elements/Container"
import { H3, H3Props } from "../elements/H3"
import { InputProps } from "../elements/Input"
import { LabelProps } from "../elements/Label"
import { Modal, ModalProps } from "../elements/Modal"
import { ParagraphProps } from "../elements/Paragraph"
import { PopoverProps } from "../elements/Popover"
import { Progress, ProgressProps } from "../elements/Progress"
import { SelectProps } from "../elements/Select"
import { Table, TableProps } from "../elements/Table"
import { useApi } from "../useApi"
import { useConfig } from "../useConfig"
import { NOT_FOUND_SELECTED_ORG_STATUS, UNAUTHORIZED_SELECTED_ORG_STATUS, UNEXPECTED_ERROR } from "./constants"
import { CreateOrg } from "./CreateOrg"
import { EditExpiredInvitation } from "./EditExpiredInvitation"
import { EditOrgUser } from "./EditOrgUser"
import { EditPendingInvitation } from "./EditPendingInvitation"
import { InviteUserAppearance } from "./InviteUser"
import { OrgControls } from "./OrgControls"
import { OrgPagination, usePagination } from "./OrgPagination"

export type ManageOrgProps = {
    appearance?: OrgAppearance
    inviteUserAppearance?: InviteUserAppearance
}

export type OrgAppearance = {
    options?: {
        rowsPerPage?: number
        headerContent?: number
        createOrgButtonContent?: ReactNode
        joinOrgButtonContent?: ReactNode
        editUserButtonContent?: ReactNode
        filterButtonContent?: ReactNode
        inviteUserButtonContent?: ReactNode
        pageBackButtonContent?: ReactNode
        pageNextButtonContent?: ReactNode
        editUserModalHeaderContent?: ReactNode
        changeRoleLabel?: ReactNode
        changeRoleButtonContent?: ReactNode
        removeUserButtonContent?: ReactNode
        resendInvitationButtonContent?: ReactNode
        deleteInvitationButtonContent?: ReactNode
    }
    elements?: {
        Progress?: ElementAppearance<ProgressProps>
        Container?: ElementAppearance<ContainerProps>
        Header?: ElementAppearance<H3Props>
        CreateOrgButton?: ElementAppearance<ButtonProps>
        CreateOrgModal?: ElementAppearance<ModalProps>
        JoinOrgButton?: ElementAppearance<ButtonProps>
        JoinOrgModal?: ElementAppearance<ModalProps>
        OrgName?: ElementAppearance<ParagraphProps>
        OrgSelect?: ElementAppearance<SelectProps>
        SearchInput?: ElementAppearance<InputProps>
        FilterButton?: ElementAppearance<ButtonProps>
        FilterPopover?: ElementAppearance<PopoverProps>
        FilterCheckbox?: ElementAppearance<CheckboxProps>
        InviteButton?: ElementAppearance<ButtonProps>
        InviteModal?: ElementAppearance<ModalProps>
        Table?: ElementAppearance<TableProps>
        EditUserButton?: ElementAppearance<ButtonProps>
        EditUserModal?: ElementAppearance<ModalProps>
        EditUserModalHeader?: ElementAppearance<H3Props>
        ChangeRoleLabel?: ElementAppearance<LabelProps>
        ChangeRoleSelect?: ElementAppearance<SelectProps>
        ChangeRoleButton?: ElementAppearance<ButtonProps>
        RemoveUserButton?: ElementAppearance<ButtonProps>
        RevokeInvitationButton?: ElementAppearance<ButtonProps>
        ResendInvitationButton?: ElementAppearance<ButtonProps>
        DeleteInvitationButton?: ElementAppearance<ButtonProps>
        PageText?: ElementAppearance<ParagraphProps>
        PageBackButton?: ElementAppearance<ButtonProps>
        PageNextButton?: ElementAppearance<ButtonProps>
        ErrorMessage?: ElementAppearance<AlertProps>
    }
}

export const ManageOrg = ({ appearance, inviteUserAppearance }: ManageOrgProps) => {
    const { config } = useConfig()
    const { loading, orgId, setOrgId } = useActiveOrg()
    const [showCreateOrgModal, setShowCreateOrgModal] = useState(false)
    const [showJoinOrgModal, setShowJoinOrgModal] = useState(false)
    const orgMetaname = config?.orgsMetaname || "Organization"

    function orgCreatedCallback(id: string) {
        setShowCreateOrgModal(false)
        setOrgId(id)
    }

    return (
        <div data-contain="component" data-width="full">
            <div data-contain="org_header" data-width="full">
                <H3 appearance={appearance?.elements?.Header}>{appearance?.options?.headerContent || orgMetaname}</H3>
                <div data-contain="org_header_actions">
                    <Button
                        onClick={() => setShowCreateOrgModal(true)}
                        appearance={appearance?.elements?.CreateOrgButton}
                    >
                        {appearance?.options?.createOrgButtonContent || "Create Organization"}
                    </Button>
                    <Modal
                        show={showCreateOrgModal}
                        setShow={setShowCreateOrgModal}
                        appearance={appearance?.elements?.CreateOrgModal}
                        onClose={() => setShowCreateOrgModal(false)}
                    >
                        <CreateOrg onOrgCreated={(res) => orgCreatedCallback(res.orgId)} />
                    </Modal>
                    <Button onClick={() => setShowJoinOrgModal(true)} appearance={appearance?.elements?.JoinOrgButton}>
                        {appearance?.options?.joinOrgButtonContent || "Join Organization"}
                    </Button>
                    <Modal
                        show={showJoinOrgModal}
                        setShow={setShowJoinOrgModal}
                        appearance={appearance?.elements?.JoinOrgModal}
                        onClose={() => setShowJoinOrgModal(false)}
                    >
                        <p>TODO</p>
                    </Modal>
                </div>
            </div>
            <Container appearance={appearance?.elements?.Container}>
                {!loading && orgId ? (
                    <ManageOrgInner
                        appearance={appearance}
                        inviteUserAppearance={inviteUserAppearance}
                        orgId={orgId}
                        setOrgId={setOrgId}
                    />
                ) : (
                    <Progress appearance={appearance?.elements?.Progress} />
                )}
            </Container>
        </div>
    )
}

export type ManageOrgInnerProps = {
    appearance?: OrgAppearance
    inviteUserAppearance?: InviteUserAppearance
    orgId: string
    setOrgId: (id: string) => void
}

export const ManageOrgInner = ({ appearance, inviteUserAppearance, orgId, setOrgId }: ManageOrgInnerProps) => {
    const [query, setQuery] = useState<string>("")
    const [filters, setFilters] = useState<string[]>([])
    const { loading, users, invitations, inviteePossibleRoles, roles, methods } = useSelectedOrg({ orgId })
    const { results } = useOrgSearch({ users, invitations, query, filters })
    const itemsPerPage = getItemsPerPage(appearance?.options?.rowsPerPage)
    const { items, controls } = usePagination<UserOrInvitation>({ items: results, itemsPerPage })
    const { rows, editRowModal } = useRowEditor({ rows: items, orgId, methods, appearance })
    const columns = [null, "Email", "Role", "Status", null]

    function getItemsPerPage(num: number | undefined) {
        if (!num) {
            return 10
        } else if (num < 5) {
            console.error("rowsPerPage must be at least 5")
            return 5
        } else if (num > 100) {
            console.error("rowsPerPage must be less than 100")
            return 100
        } else {
            return num
        }
    }

    if (loading) {
        return <Progress appearance={appearance?.elements?.Progress} />
    }

    return (
        <>
            <div data-contain="search_action">
                <OrgControls
                    orgId={orgId}
                    setOrgId={setOrgId}
                    query={query}
                    setQuery={setQuery}
                    filters={filters}
                    setFilters={setFilters}
                    roles={roles}
                    inviteePossibleRoles={inviteePossibleRoles}
                    addInvitation={methods.addInvitation}
                    appearance={appearance}
                    inviteUserAppearance={inviteUserAppearance}
                />
            </div>
            <div data-contain="table">
                <Table columns={columns} rows={rows} appearance={appearance?.elements?.Table} />
                {editRowModal}
            </div>
            <div data-contain="pagination">
                <OrgPagination controls={controls} appearance={appearance} />
            </div>
        </>
    )
}

export type User = {
    userId: string
    email: string
    role: string
    possibleRoles: string[]
    canBeDeleted: boolean
}

export type Invitation = {
    email: string
    role: string
    expiresAtSeconds: number
}

export type UserOrInvitation = {
    userId?: string
    email: string
    role: string
    status: "active" | "pending" | "expired"
    possibleRoles?: string[]
    canBeDeleted?: boolean
}

export const useActiveOrg = () => {
    const { loading, orgHelper } = useOrgHelper()
    const [activeOrgId, setActiveOrgId] = useState<string | undefined>(undefined)

    useEffect(() => {
        if (orgHelper && !activeOrgId) {
            const orgIds = orgHelper.getOrgIds()
            if (orgIds.length > 0) {
                setActiveOrgId(orgIds[0])
            }
        }
    }, [orgHelper, activeOrgId])

    function setOrgId(id: string) {
        setActiveOrgId(id)
    }

    return { loading, orgId: activeOrgId, setOrgId }
}

export type UseSelectedOrgProps = {
    orgId: string
}

export const useSelectedOrg = ({ orgId }: UseSelectedOrgProps) => {
    const { orgApi } = useApi()
    const { config } = useConfig()
    const [loading, setLoading] = useState(false)
    const [users, setUsers] = useState<User[]>([])
    const [invitations, setInvitations] = useState<Invitation[]>([])
    const [inviteePossibleRoles, setInviteePossibleRoles] = useState<string[]>([])
    const [roles, setRoles] = useState<string[]>([])
    const [error, setError] = useState<string | undefined>(undefined)

    useEffect(() => {
        let mounted = true
        if (orgId) {
            setLoading(true)
            orgApi
                .selectedOrgStatus({ id: orgId })
                .then((response) => {
                    if (mounted) {
                        if (response.ok) {
                            setUsers(response.body.users)
                            setInvitations(response.body.pendingInvites)
                            setRoles(config?.roles || [])
                            setInviteePossibleRoles(response.body.inviteePossibleRoles)
                        } else {
                            response.error._visit({
                                notFoundSelectedOrgStatus: () => setError(NOT_FOUND_SELECTED_ORG_STATUS),
                                unauthorizedOrgSelectedOrgStatus: () => setError(UNAUTHORIZED_SELECTED_ORG_STATUS),
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
        }

        return () => {
            mounted = false
            setLoading(false)
        }
    }, [orgApi, orgId, config?.roles])

    function setUserRole(userId: string, role: string) {
        setUsers((users) => {
            const updatedUsers = users.map((user) => {
                if (user.userId === userId) {
                    return { ...user, role }
                }
                return user
            })
            return updatedUsers
        })
    }

    function removeUser(userId: string) {
        setUsers((users) => users.filter((u) => u.userId !== userId))
    }

    function addInvitation(invitation: Invitation) {
        setInvitations((invitations) => [...invitations, invitation])
    }

    function removeInvitation(email: string) {
        setInvitations((invitations) => invitations.filter((i) => i.email !== email))
    }

    return {
        loading,
        users,
        invitations,
        inviteePossibleRoles,
        roles,
        methods: {
            setUserRole,
            removeUser,
            addInvitation,
            removeInvitation,
        },
        error,
    }
}

export type UseRowEditorProps = {
    rows: UserOrInvitation[]
    orgId: string
    methods: {
        setUserRole: (userId: string, role: string) => void
        removeUser: (userId: string) => void
        addInvitation: (invitation: Invitation) => void
        removeInvitation: (email: string) => void
    }
    appearance?: OrgAppearance
}

export const useRowEditor = ({ rows, orgId, methods, appearance }: UseRowEditorProps) => {
    const [showEditModal, setShowEditModal] = useState(false)
    const [rowToEdit, setRowToEdit] = useState<UserOrInvitation | null>(null)

    function editRow(row: UserOrInvitation) {
        setRowToEdit(row)
        setShowEditModal(true)
    }

    function closeEditRow() {
        setShowEditModal(false)
        setRowToEdit(null)
    }

    const editableRows = rows.map((row) => {
        return {
            userId: row.userId,
            email: row.email,
            role: row.role,
            status: row.status.charAt(0).toUpperCase() + row.status.slice(1),
            edit: (
                <Button onClick={() => editRow(row)} appearance={appearance?.elements?.EditUserButton}>
                    {appearance?.options?.editUserButtonContent || "Edit"}
                </Button>
            ),
        }
    })

    function getModalContents() {
        if (rowToEdit) {
            if (rowToEdit.status === "active" && rowToEdit.userId) {
                return (
                    <EditOrgUser
                        orgId={orgId}
                        user={rowToEdit as User}
                        onClose={closeEditRow}
                        setUserRole={methods.setUserRole}
                        removeUser={methods.removeUser}
                        appearance={appearance}
                    />
                )
            } else if (rowToEdit.status === "pending") {
                return (
                    <EditPendingInvitation
                        orgId={orgId}
                        user={rowToEdit}
                        onClose={closeEditRow}
                        removeInvitation={methods.removeInvitation}
                        appearance={appearance}
                    />
                )
            } else if (rowToEdit.status === "expired") {
                return (
                    <EditExpiredInvitation
                        orgId={orgId}
                        user={rowToEdit}
                        onClose={closeEditRow}
                        addInvitation={methods.addInvitation}
                        removeInvitation={methods.removeInvitation}
                        appearance={appearance}
                    />
                )
            }
        }

        return null
    }

    return {
        rows: editableRows,
        editRowModal: (
            <Modal show={showEditModal} setShow={setShowEditModal} onClose={closeEditRow}>
                {getModalContents()}
            </Modal>
        ),
    }
}

export type UseOrgSearchProps = {
    users: User[]
    invitations: Invitation[]
    query: string
    filters: string[]
}

export const useOrgSearch = ({ users, invitations, query, filters }: UseOrgSearchProps) => {
    const [results, setResults] = useState<UserOrInvitation[]>([])

    useEffect(() => {
        const _users: UserOrInvitation[] = users.map((user) => {
            return {
                userId: user.userId,
                email: user.email,
                role: user.role,
                status: "active",
                possible_roles: user.possibleRoles,
                can_be_deleted: user.canBeDeleted,
            }
        })

        const _invitations: UserOrInvitation[] = invitations.map((invitation) => {
            function isExpired(invitation: Invitation) {
                const now = Math.round(Date.now() / 1000)
                return now > invitation.expiresAtSeconds
            }

            return {
                email: invitation.email,
                role: invitation.role,
                status: isExpired(invitation) ? "expired" : "pending",
            }
        })

        const searchByNameOrId = (userOrInvitation: UserOrInvitation) => {
            const e = userOrInvitation.email.toLowerCase()
            const id = userOrInvitation.userId?.toLowerCase()
            return e.includes(query) || (id && id.includes(query))
        }

        const filterByRoleOrStatus = (userOrInvitation: UserOrInvitation) => {
            const status = `status:${userOrInvitation.status.toLowerCase()}`
            const role = `role:${userOrInvitation.role.toLowerCase()}`
            return filters.includes(role) || filters.includes(status)
        }

        const usersOrInvitations = _invitations.concat(_users)
        const emptySearch = !query
        const emptyFilters = !filters.length

        if (emptySearch) {
            if (emptyFilters) {
                setResults(usersOrInvitations)
            } else {
                setResults(usersOrInvitations.filter(filterByRoleOrStatus))
            }
        } else {
            if (emptyFilters) {
                setResults(usersOrInvitations.filter(searchByNameOrId))
            } else {
                const searchedUsers = usersOrInvitations.filter(searchByNameOrId)
                setResults(searchedUsers.filter(filterByRoleOrStatus))
            }
        }
    }, [users, invitations, query, filters])

    return { results }
}
