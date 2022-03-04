/**
 * @jest-environment jsdom
 */
import { createClient } from "@propelauth/javascript"
import { render, screen, waitFor } from "@testing-library/react"
import React from "react"
import { v4 as uuidv4 } from "uuid"
import { AuthProvider } from "./AuthContext"
import { useAuthInfo } from "./useAuthInfo"
import { useLogoutFunction } from "./useLogoutFunction"
import { useRedirectFunctions } from "./useRedirectFunctions"
import { withAuthInfo } from "./withAuthInfo"

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
    const authenticationInfo = {
        accessToken,
        expiresAtSeconds: INITIAL_TIME_SECONDS + 30 * 60,
        orgIdToOrgMemberInfo: {
            [orgA.orgId]: orgA,
            [orgB.orgId]: orgB,
        },
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
    const authenticationInfo = {
        accessToken,
        expiresAtSeconds: INITIAL_TIME_SECONDS + 30 * 60,
        orgIdToOrgMemberInfo: {
            [orgA.orgId]: orgA,
            [orgB.orgId]: orgB,
        },
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
    expect(mockClient.addLoggedInChangeObserver.mock.calls.length).toBe(1)
    const observer = mockClient.addLoggedInChangeObserver.mock.calls[0][0]
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

it("withAuthInfo renders loading correctly", async () => {
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
        destroy: jest.fn(),
    }
}

const AUTH_URL = "authUrl"

function expectCreateClientWasCalledCorrectly() {
    expect(createClient).toHaveBeenCalledWith({ authUrl: AUTH_URL, enableBackgroundTokenRefresh: false })
}

function createOrg() {
    return {
        orgId: uuidv4(),
        orgName: randomString(),
        userRoleName: choose(["Owner", "Admin", "Member"]),
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
    return {
        accessToken,
        expiresAtSeconds: INITIAL_TIME_SECONDS + 30 * 60,
        orgIdToOrgMemberInfo: {
            [orgA.orgId]: orgA,
            [orgB.orgId]: orgB,
        },
        user,
    }
}
