import { AccessHelper, OrgHelper, User } from "@propelauth/javascript"
import hoistNonReactStatics from "hoist-non-react-statics"
import React, { useContext } from "react"
import { Subtract } from "utility-types"
import { AuthContext } from "./AuthContext"

export type WithLoggedInAuthInfoProps = {
    isLoggedIn: true
    accessToken: string
    user: User
    orgHelper: OrgHelper
    accessHelper: AccessHelper
    refreshAuthInfo: () => Promise<void>
}

export type WithNotLoggedInAuthInfoProps = {
    isLoggedIn: false
    accessToken: null
    user: null
    orgHelper: null
    accessHelper: null
    refreshAuthInfo: () => Promise<void>
}

export type WithAuthInfoProps = WithLoggedInAuthInfoProps | WithNotLoggedInAuthInfoProps

export interface WithAuthInfoArgs {
    displayWhileLoading?: React.ReactElement
}

export function withAuthInfo<P extends WithAuthInfoProps>(
    Component: React.ComponentType<P>,
    args?: WithAuthInfoArgs
): React.ComponentType<Subtract<P, WithAuthInfoProps>> {
    const displayName = `withAuthInfo(${Component.displayName || Component.name || "Component"})`

    const WithAuthInfoWrapper = (props: Subtract<P, WithAuthInfoProps>) => {
        const context = useContext(AuthContext)
        if (context === undefined) {
            throw new Error("withAuthInfo must be used within an AuthProvider or RequiredAuthProvider")
        }

        function displayLoading() {
            if (args && args.displayWhileLoading) {
                return args.displayWhileLoading
            } else {
                return <React.Fragment />
            }
        }

        const { loading, authInfo, refreshAuthInfo } = context
        if (loading) {
            return displayLoading()
        } else if (authInfo) {
            const loggedInProps: P = {
                ...(props as P),
                accessToken: authInfo.accessToken,
                isLoggedIn: !!authInfo.accessToken,
                orgHelper: authInfo.orgHelper,
                accessHelper: authInfo.accessHelper,
                user: authInfo.user,
                refreshAuthInfo,
            }
            return <Component {...loggedInProps} />
        } else {
            const notLoggedInProps: P = {
                ...(props as P),
                accessToken: null,
                isLoggedIn: false,
                user: null,
                orgHelper: null,
                accessHelper: null,
                refreshAuthInfo,
            }
            return <Component {...notLoggedInProps} />
        }
    }
    WithAuthInfoWrapper.displayName = displayName
    WithAuthInfoWrapper.WrappedComponent = Component

    return hoistNonReactStatics(WithAuthInfoWrapper, Component)
}
