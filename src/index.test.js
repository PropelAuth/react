/**
 * @jest-environment jsdom
 */
import { createClient } from "@propelauth/javascript"
import { render, screen, waitFor } from "@testing-library/react"
import React from "react"
import { v4 as uuidv4 } from "uuid"
import { AuthProvider } from "./AuthContext"
import { AuthProviderForTesting } from "./AuthContextForTesting"
import { useAuthInfo } from "./hooks/useAuthInfo"
import { useLogoutFunction } from "./hooks/useLogoutFunction"
import { useRedirectFunctions } from "./hooks/useRedirectFunctions"
import { RequiredAuthProvider } from "./RequiredAuthProvider"
import { withAuthInfo } from "./withAuthInfo"
import { withRequiredAuthInfo } from "./withRequiredAuthInfo"

/* eslint-disable */
// Fake timer setup
beforeAll(() => {
    jest.useFakeTimers()
})

let mockClient
const INITIAL_TIME_MILLIS = 1619743452595
const INITIAL_TIME_SECONDS = INITIAL_TIME_MILLIS / 1000
beforeEach(() => {
    jest.setSystemTime(INITIAL_TIME_MILLIS)
    mockClient = createMockClient()
})

afterAll(() => {
    jest.useRealTimers()
})

// Mocking utilities for createClient
jest.mock("@propelauth/javascript", () => ({
    ...jest.requireActual("@propelauth/javascript"),
    createClient: jest.fn(),
}))
createClient.mockImplementation(() => mockClient)

// Tests
it("withAuthInfo fails to render if not in an AuthProvider", async () => {
    const Component = (props) => <div>Finished</div>
    const WrappedComponent = withAuthInfo(Component)
    expect(() => {
        render(<WrappedComponent />)
    }).toThrowError()
})

it("successfully renders withAuthInfo if in an AuthProvider", async () => {
    const Component = (props) => <div>Finished</div>
    const WrappedComponent = withAuthInfo(Component)
    render(
        <AuthProvider authUrl={AUTH_URL}>
            <WrappedComponent />
        </AuthProvider>
    )

    await waitFor(() => screen.getByText("Finished"))
    expectCreateClientWasCalledCorrectly()
})

it("withAuthInfo passes values from client as props", async () => {
    const accessToken = randomString()
    const orgA = createOrg()
    const orgB = createOrg()
    const user = createUser()
    const orgIdToOrgMemberInfo = { [orgA.orgId]: orgA, [orgB.orgId]: orgB }
    const authenticationInfo = {
        accessToken,
        expiresAtSeconds: INITIAL_TIME_SECONDS + 30 * 60,
        orgIdToOrgMemberInfo,
        orgHelper: wrapOrgIdToOrgMemberInfo(orgIdToOrgMemberInfo),
        user,
    }
    mockClient.getAuthenticationInfoOrNull.mockReturnValue(authenticationInfo)

    const Component = (props) => {
        expect(props.accessToken).toBe(accessToken)
        expect(props.user).toStrictEqual(user)
        expect(props.isLoggedIn).toBe(true)
        expect(props.orgHelper.getOrgs().sort()).toEqual([orgA, orgB].sort())
        return <div>Finished</div>
    }

    const WrappedComponent = withAuthInfo(Component)
    render(
        <AuthProvider authUrl={AUTH_URL}>
            <WrappedComponent />
        </AuthProvider>
    )

    await waitFor(() => screen.getByText("Finished"))
    expectCreateClientWasCalledCorrectly()
})

it("useAuthInfo passes values correctly", async () => {
    const accessToken = randomString()
    const orgA = createOrg()
    const orgB = createOrg()
    const user = createUser()
    const orgIdToOrgMemberInfo = { [orgA.orgId]: orgA, [orgB.orgId]: orgB }
    const authenticationInfo = {
        accessToken,
        expiresAtSeconds: INITIAL_TIME_SECONDS + 30 * 60,
        orgIdToOrgMemberInfo,
        orgHelper: wrapOrgIdToOrgMemberInfo(orgIdToOrgMemberInfo),
        user,
    }
    mockClient.getAuthenticationInfoOrNull.mockReturnValue(authenticationInfo)

    const Component = () => {
        const authInfo = useAuthInfo()
        if (authInfo.loading) {
            return <div>Loading...</div>
        } else {
            expect(authInfo.accessToken).toBe(accessToken)
            expect(authInfo.user).toStrictEqual(user)
            expect(authInfo.isLoggedIn).toBe(true)
            expect(authInfo.orgHelper.getOrgs().sort()).toEqual([orgA, orgB].sort())
            return <div>Finished</div>
        }
    }

    render(
        <AuthProvider authUrl={AUTH_URL}>
            <Component />
        </AuthProvider>
    )

    await waitFor(() => screen.getByText("Finished"))
    expectCreateClientWasCalledCorrectly()
})

it("withAuthInfo passes values from client as props, with RequiredAuthProvider", async () => {
    const authenticationInfo = createAuthenticationInfo()
    mockClient.getAuthenticationInfoOrNull.mockReturnValue(authenticationInfo)

    const Component = (props) => {
        expect(props.accessToken).toBe(authenticationInfo.accessToken)
        expect(props.user).toStrictEqual(authenticationInfo.user)
        expect(props.isLoggedIn).toBe(true)
        expect(props.orgHelper.getOrgs().sort()).toEqual(Object.values(authenticationInfo.orgIdToOrgMemberInfo).sort())
        return <div>Finished</div>
    }

    const WrappedComponent = withAuthInfo(Component)
    render(
        <RequiredAuthProvider authUrl={AUTH_URL}>
            <WrappedComponent />
        </RequiredAuthProvider>
    )

    await waitFor(() => screen.getByText("Finished"))
    expectCreateClientWasCalledCorrectly()
})

it("withRequiredAuthInfo passes values from client as props, with RequiredAuthProvider", async () => {
    const authenticationInfo = createAuthenticationInfo()
    mockClient.getAuthenticationInfoOrNull.mockReturnValue(authenticationInfo)

    const Component = (props) => {
        expect(props.accessToken).toBe(authenticationInfo.accessToken)
        expect(props.user).toStrictEqual(authenticationInfo.user)
        expect(props.isLoggedIn).toBe(true)
        expect(props.orgHelper.getOrgs().sort()).toEqual(Object.values(authenticationInfo.orgIdToOrgMemberInfo).sort())
        return <div>Finished</div>
    }

    const WrappedComponent = withRequiredAuthInfo(Component)
    render(
        <RequiredAuthProvider authUrl={AUTH_URL}>
            <WrappedComponent />
        </RequiredAuthProvider>
    )

    await waitFor(() => screen.getByText("Finished"))
    expectCreateClientWasCalledCorrectly()
})

it("RequiredAuthProvider displays logged out value if logged out", async () => {
    mockClient.getAuthenticationInfoOrNull.mockReturnValue(null)

    const ErrorComponent = () => {
        return <div>Error</div>
    }
    const SuccessComponent = () => {
        return <div>Finished</div>
    }

    const WrappedComponent = withAuthInfo(ErrorComponent)
    render(
        <RequiredAuthProvider authUrl={AUTH_URL} displayIfLoggedOut={<SuccessComponent />}>
            <WrappedComponent />
        </RequiredAuthProvider>
    )

    await waitFor(() => screen.getByText("Finished"))
    expectCreateClientWasCalledCorrectly()
})

it("withRequiredAuthInfo displays logged out value if logged out from args", async () => {
    mockClient.getAuthenticationInfoOrNull.mockReturnValue(null)

    const ErrorComponent = () => {
        return <div>Error</div>
    }
    const SuccessComponent = () => {
        return <div>Finished</div>
    }

    const WrappedComponent = withRequiredAuthInfo(ErrorComponent, {
        displayIfLoggedOut: <SuccessComponent />,
    })
    render(
        <AuthProvider authUrl={AUTH_URL}>
            <WrappedComponent />
        </AuthProvider>
    )

    await waitFor(() => screen.getByText("Finished"))
    expectCreateClientWasCalledCorrectly()
})

it("withRequiredAuthInfo displays logged out value if logged out from context", async () => {
    mockClient.getAuthenticationInfoOrNull.mockReturnValue(null)

    const ErrorComponent = () => {
        return <div>Error</div>
    }
    const SuccessComponent = () => {
        return <div>Finished</div>
    }

    const WrappedComponent = withRequiredAuthInfo(ErrorComponent)
    render(
        <AuthProvider authUrl={AUTH_URL} defaultDisplayIfLoggedOut={<SuccessComponent />}>
            <WrappedComponent />
        </AuthProvider>
    )

    await waitFor(() => screen.getByText("Finished"))
    expectCreateClientWasCalledCorrectly()
})

it("withRequiredAuthInfo displays logged out value from args if logged out from both args and context", async () => {
    mockClient.getAuthenticationInfoOrNull.mockReturnValue(null)

    const ErrorComponent = () => {
        return <div>Error</div>
    }
    const SuccessArgComponent = () => {
        return <div>Finished from Args</div>
    }

    const SuccessContextComponent = () => {
        return <div>Finished from Context</div>
    }

    const WrappedComponent = withRequiredAuthInfo(ErrorComponent, {
        displayIfLoggedOut: <SuccessArgComponent />,
    })
    render(
        <AuthProvider authUrl={AUTH_URL} displayIfLoggedOut={<SuccessContextComponent />}>
            <WrappedComponent />
        </AuthProvider>
    )

    await waitFor(() => screen.getByText("Finished from Args"))
    expectCreateClientWasCalledCorrectly()
})

it("withAuthInfo passes logged out values from client as props", async () => {
    mockClient.getAuthenticationInfoOrNull.mockReturnValue(null)

    const Component = (props) => {
        expect(props.accessToken).toBe(null)
        expect(props.user).toBe(null)
        expect(props.isLoggedIn).toBe(false)
        expect(props.orgHelper).toBe(null)
        return <div>Finished</div>
    }

    const WrappedComponent = withAuthInfo(Component)
    render(
        <AuthProvider authUrl={AUTH_URL}>
            <WrappedComponent />
        </AuthProvider>
    )

    await waitFor(() => screen.getByText("Finished"))
    expectCreateClientWasCalledCorrectly()
})

it("useAuthInfo passes logged out values from client as props", async () => {
    mockClient.getAuthenticationInfoOrNull.mockReturnValue(null)

    const Component = () => {
        const authInfo = useAuthInfo()
        if (authInfo.loading) {
            return <div>Loading...</div>
        } else {
            expect(authInfo.accessToken).toBe(null)
            expect(authInfo.user).toBe(null)
            expect(authInfo.isLoggedIn).toBe(false)
            expect(authInfo.orgHelper).toBe(null)
            return <div>Finished</div>
        }
    }

    render(
        <AuthProvider authUrl={AUTH_URL}>
            <Component />
        </AuthProvider>
    )

    await waitFor(() => screen.getByText("Finished"))
    expectCreateClientWasCalledCorrectly()
})

it("redirectToLoginPage calls into the client", async () => {
    const Component = () => {
        const { redirectToLoginPage } = useRedirectFunctions()
        redirectToLoginPage()
        return <div>Finished</div>
    }
    render(
        <AuthProvider authUrl={AUTH_URL}>
            <Component />
        </AuthProvider>
    )
    await waitFor(() => screen.getByText("Finished"))
    expect(mockClient.redirectToLoginPage).toBeCalled()
})

it("redirectToSignupPage calls into the client", async () => {
    const Component = () => {
        const { redirectToSignupPage } = useRedirectFunctions()
        redirectToSignupPage()
        return <div>Finished</div>
    }
    render(
        <AuthProvider authUrl={AUTH_URL}>
            <Component />
        </AuthProvider>
    )
    await waitFor(() => screen.getByText("Finished"))
    expect(mockClient.redirectToSignupPage).toBeCalled()
})

it("redirectToCreateOrgPage calls into the client", async () => {
    const Component = () => {
        const { redirectToCreateOrgPage } = useRedirectFunctions()
        redirectToCreateOrgPage()
        return <div>Finished</div>
    }
    render(
        <AuthProvider authUrl={AUTH_URL}>
            <Component />
        </AuthProvider>
    )
    await waitFor(() => screen.getByText("Finished"))
    expect(mockClient.redirectToCreateOrgPage).toBeCalled()
})

it("redirectToAccountPage calls into the client", async () => {
    const Component = () => {
        const { redirectToAccountPage } = useRedirectFunctions()
        redirectToAccountPage()
        return <div>Finished</div>
    }
    render(
        <AuthProvider authUrl={AUTH_URL}>
            <Component />
        </AuthProvider>
    )
    await waitFor(() => screen.getByText("Finished"))
    expect(mockClient.redirectToAccountPage).toBeCalled()
})

it("redirectToOrgPage calls into the client", async () => {
    const Component = () => {
        const { redirectToOrgPage } = useRedirectFunctions()
        redirectToOrgPage("orgId")
        return <div>Finished</div>
    }
    render(
        <AuthProvider authUrl={AUTH_URL}>
            <Component />
        </AuthProvider>
    )
    await waitFor(() => screen.getByText("Finished"))
    expect(mockClient.redirectToOrgPage).toBeCalledWith("orgId")
})

it("logout calls into the client", async () => {
    const Component = () => {
        const logout = useLogoutFunction()
        logout(false)
        return <div>Finished</div>
    }
    render(
        <AuthProvider authUrl={AUTH_URL}>
            <Component />
        </AuthProvider>
    )
    await waitFor(() => screen.getByText("Finished"))
    expect(mockClient.logout).toBeCalled()
})

it("when client logs out, authInfo is refreshed", async () => {
    const initialAuthInfo = createAuthenticationInfo()
    mockClient.getAuthenticationInfoOrNull.mockReturnValueOnce(initialAuthInfo).mockReturnValueOnce(null)

    const Component = jest.fn()
    Component.mockReturnValue(<div>Finished 1</div>)

    const WrappedComponent = withAuthInfo(Component)
    render(
        <AuthProvider authUrl={AUTH_URL}>
            <WrappedComponent />
        </AuthProvider>
    )

    await waitFor(() => screen.getByText("Finished 1"))

    // Then simulate a logout event by calling the observer
    Component.mockReturnValue(<div>Finished 2</div>)
    expect(mockClient.addAccessTokenChangeObserver.mock.calls.length).toBe(1)
    const observer = mockClient.addAccessTokenChangeObserver.mock.calls[0][0]
    observer(false)

    await waitFor(() => screen.getByText("Finished 2"))

    const initialProps = Component.mock.calls[0][0]
    expect(initialProps.accessToken).toBe(initialAuthInfo.accessToken)
    expect(initialProps.user).toStrictEqual(initialAuthInfo.user)
    expect(initialProps.isLoggedIn).toBe(true)

    const finalProps = Component.mock.calls[Component.mock.calls.length - 1][0]
    expect(finalProps.accessToken).toBe(null)
    expect(finalProps.user).toStrictEqual(null)
    expect(finalProps.isLoggedIn).toBe(false)
})

it("withAuthInfo renders loading correctly from args", async () => {
    const authInfo = createAuthenticationInfo()
    const Loading = () => <div>Loading</div>
    const Component = (props) => <div>Finished</div>
    const WrappedComponent = withAuthInfo(Component, { displayWhileLoading: <Loading /> })

    // Wait 100ms to return authInfo to force loading to be displayed
    mockClient.getAuthenticationInfoOrNull.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(authInfo), 100))
    )

    render(
        <AuthProvider authUrl={AUTH_URL}>
            <WrappedComponent />
        </AuthProvider>
    )

    // Loading is displayed until 100ms passes
    await waitFor(() => screen.getByText("Loading"))
    jest.advanceTimersByTime(50)
    await waitFor(() => screen.getByText("Loading"))
    jest.advanceTimersByTime(50)
    await waitFor(() => screen.getByText("Finished"))
})

it("withAuthInfo renders loading correctly from context", async () => {
    const authInfo = createAuthenticationInfo()
    const Loading = () => <div>Loading</div>
    const Component = (props) => <div>Finished</div>
    const WrappedComponent = withAuthInfo(Component)

    // Wait 100ms to return authInfo to force loading to be displayed
    mockClient.getAuthenticationInfoOrNull.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(authInfo), 100))
    )

    render(
        <AuthProvider authUrl={AUTH_URL} defaultDisplayWhileLoading={<Loading />}>
            <WrappedComponent />
        </AuthProvider>
    )

    // Loading is displayed until 100ms passes
    await waitFor(() => screen.getByText("Loading"))
    jest.advanceTimersByTime(50)
    await waitFor(() => screen.getByText("Loading"))
    jest.advanceTimersByTime(50)
    await waitFor(() => screen.getByText("Finished"))
})

it("withAuthInfo renders loading correctly from args, overriding context", async () => {
    const authInfo = createAuthenticationInfo()
    const LoadingFromArg = () => <div>Loading From Arg</div>
    const LoadingFromContext = () => <div>Loading From Context</div>
    const Component = (props) => <div>Finished</div>
    const WrappedComponent = withAuthInfo(Component, { displayWhileLoading: <LoadingFromArg /> })

    // Wait 100ms to return authInfo to force loading to be displayed
    mockClient.getAuthenticationInfoOrNull.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(authInfo), 100))
    )

    render(
        <AuthProvider authUrl={AUTH_URL} defaultDisplayWhileLoading={<LoadingFromContext />}>
            <WrappedComponent />
        </AuthProvider>
    )

    // Loading is displayed until 100ms passes
    await waitFor(() => screen.getByText("Loading From Arg"))
    jest.advanceTimersByTime(50)
    await waitFor(() => screen.getByText("Loading From Arg"))
    jest.advanceTimersByTime(50)
    await waitFor(() => screen.getByText("Finished"))
})

it("AuthProviderForTesting can be used with useAuthInfo", async () => {
    const user = {
        email: "john.doe@example.com",
        emailConfirmed: true,
        enabled: true,
        locked: false,
        mfaEnabled: false,
        userId: "john.doe",
        username: "John Doe",
        firstName: "John",
        lastName: "Doe",
    }
    const orgMemberInfos = [
        {
            orgId: "orgAid",
            orgName: "orgA",
            urlSafeOrgName: "orga",
            userAssignedRole: "Admin",
            userInheritedRolesPlusCurrentRole: ["Admin", "Member"],
            userPermissions: [],
        },
        {
            orgId: "orgBid",
            orgName: "orgB",
            urlSafeOrgName: "orgB",
            userAssignedRole: "Owner",
            userInheritedRolesPlusCurrentRole: ["Owner", "Admin", "Member"],
            userPermissions: ["somePermission"],
        },
    ]
    const userInformation = {
        user,
        orgMemberInfos,
        accessToken: "could be anything",
    }

    const Component = () => {
        const authInfo = useAuthInfo()
        expect(authInfo.loading).toBeFalsy()
        expect(authInfo.accessToken).toBe(userInformation.accessToken)
        expect(authInfo.user).toBe(userInformation.user)
        expect(authInfo.isLoggedIn).toBe(true)

        let orgIds = authInfo.orgHelper.getOrgIds()
        expect(orgIds).toContain("orgAid")
        expect(orgIds).toContain("orgBid")
        expect(orgIds).not.toContain("orgCid")

        expect(authInfo.accessHelper.hasPermission("orgAid", "somePermission")).toBeFalsy()
        expect(authInfo.accessHelper.hasPermission("orgBid", "somePermission")).toBeTruthy()

        return <div>Finished</div>
    }

    render(
        <AuthProviderForTesting userInformation={userInformation}>
            <Component />
        </AuthProviderForTesting>
    )

    await waitFor(() => screen.getByText("Finished"))
})

function createMockClient() {
    return {
        getAuthenticationInfoOrNull: jest.fn(),
        logout: jest.fn(),
        redirectToSignupPage: jest.fn(),
        redirectToLoginPage: jest.fn(),
        redirectToAccountPage: jest.fn(),
        redirectToOrgPage: jest.fn(),
        redirectToCreateOrgPage: jest.fn(),
        addLoggedInChangeObserver: jest.fn(),
        removeLoggedInChangeObserver: jest.fn(),
        addAccessTokenChangeObserver: jest.fn(),
        removeAccessTokenChangeObserver: jest.fn(),
        destroy: jest.fn(),
    }
}

const AUTH_URL = "authUrl"

function expectCreateClientWasCalledCorrectly() {
    expect(createClient).toHaveBeenCalledWith({ authUrl: AUTH_URL, enableBackgroundTokenRefresh: true })
}

function createOrg() {
    const orgName = randomString()
    const urlSafeOrgName = orgName.toLowerCase()
    return {
        orgId: uuidv4(),
        orgName,
        urlSafeOrgName,
        userRole: choose(["Owner", "Admin", "Member"]),
    }
}

function createUser() {
    return {
        userId: uuidv4(),
        email: randomString(),
        username: randomString(),
    }
}

function randomString() {
    return (Math.random() + 1).toString(36).substring(3)
}

function choose(choices) {
    const index = Math.floor(Math.random() * choices.length)
    return choices[index]
}

function createAuthenticationInfo() {
    const accessToken = randomString()
    const orgA = createOrg()
    const orgB = createOrg()
    const user = createUser()
    const orgIdToOrgMemberInfo = {
        [orgA.orgId]: orgA,
        [orgB.orgId]: orgB,
    }
    return {
        accessToken,
        expiresAtSeconds: INITIAL_TIME_SECONDS + 30 * 60,
        orgIdToOrgMemberInfo,
        orgHelper: wrapOrgIdToOrgMemberInfo(orgIdToOrgMemberInfo),
        user,
    }
}

function wrapOrgIdToOrgMemberInfo(orgIdToOrgMemberInfo) {
    return {
        getOrg(orgId) {
            if (orgIdToOrgMemberInfo.hasOwnProperty(orgId)) {
                return orgIdToOrgMemberInfo[orgId]
            } else {
                return undefined
            }
        },
        getOrgIds() {
            return Object.keys(orgIdToOrgMemberInfo)
        },
        getOrgs() {
            return Object.values(orgIdToOrgMemberInfo)
        },
        getOrgByName(orgName) {
            for (const orgMemberInfo of Object.values(orgIdToOrgMemberInfo)) {
                if (orgMemberInfo.orgName === orgName || orgMemberInfo.urlSafeOrgName === orgName) {
                    return orgMemberInfo
                }
            }
            return undefined
        },
    }
}
