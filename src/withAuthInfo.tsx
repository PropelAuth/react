import { AccessHelper, OrgHelper, User, UserClass } from "@propelauth/javascript"
import hoistNonReactStatics from "hoist-non-react-statics"
import React, { useContext } from "react"
import { Subtract } from "utility-types"
import { AuthContext, Tokens } from "./AuthContext"

export type WithLoggedInAuthInfoProps = {
    isLoggedIn: true
    accessToken: string
    getAccessToken: () => Promise<string>
    user: User
    userClass: UserClass
    orgHelper: OrgHelper
    accessHelper: AccessHelper
    isImpersonating: boolean
    impersonatorUserId?: string
    refreshAuthInfo: () => Promise<void>
    tokens: Tokens
    accessTokenExpiresAtSeconds: number
}

export type WithNotLoggedInAuthInfoProps = {
    isLoggedIn: false
    accessToken: null
    getAccessToken: () => Promise<undefined>
    user: null
    userClass: null
    orgHelper: null
    accessHelper: null
    isImpersonating: false
    impersonatorUserId: null
    refreshAuthInfo: () => Promise<void>
    tokens: Tokens
    accessTokenExpiresAtSeconds: null
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

        const { loading, authInfo, defaultDisplayWhileLoading, refreshAuthInfo, tokens } = context

        function displayLoading() {
            if (args?.displayWhileLoading) {
                return args.displayWhileLoading
            } else if (defaultDisplayWhileLoading) {
                return defaultDisplayWhileLoading
            }
            return <React.Fragment />
        }

        if (loading) {
            return displayLoading()
        } else if (authInfo) {
            const loggedInProps: P = {
                ...(props as P),
                accessToken: authInfo.accessToken,
                getAccessToken: tokens.getAccessToken,
                isLoggedIn: !!authInfo.accessToken,
                orgHelper: authInfo.orgHelper,
                accessHelper: authInfo.accessHelper,
                user: authInfo.user,
                userClass: authInfo.userClass,
                isImpersonating: !!authInfo.impersonatorUserId,
                impersonatorUserId: authInfo.impersonatorUserId,
                refreshAuthInfo,
                tokens,
                accessTokenExpiresAtSeconds: authInfo.expiresAtSeconds,
            }
            return <Component {...loggedInProps} />
        } else {
            const notLoggedInProps: P = {
                ...(props as P),
                accessToken: null,
                getAccessToken: () => undefined,
                isLoggedIn: false,
                user: null,
                userClass: null,
                orgHelper: null,
                accessHelper: null,
                isImpersonating: false,
                impersonatorUserId: null,
                refreshAuthInfo,
                tokens,
                accessTokenExpiresAtSeconds: null,
            }
            return <Component {...notLoggedInProps} />
        }
    }
    WithAuthInfoWrapper.displayName = displayName
    WithAuthInfoWrapper.WrappedComponent = Component

    return hoistNonReactStatics(WithAuthInfoWrapper, Component)
}
