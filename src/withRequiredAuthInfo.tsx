import hoistNonReactStatics from "hoist-non-react-statics"
import React, { useContext } from "react"
import { Subtract } from "utility-types"
import { AuthContext } from "./AuthContext"
import { RedirectToLogin } from "./useRedirectFunctions"
import { WithLoggedInAuthInfoProps } from "./withAuthInfo"

export interface WithRequiredAuthInfoArgs {
    displayWhileLoading?: React.ReactElement
    displayIfLoggedOut?: React.ReactElement
}

export function withRequiredAuthInfo<P extends WithLoggedInAuthInfoProps>(
    Component: React.ComponentType<P>,
    args?: WithRequiredAuthInfoArgs
): React.ComponentType<Subtract<P, WithLoggedInAuthInfoProps>> {
    const displayName = `withRequiredAuthInfo(${Component.displayName || Component.name || "Component"})`

    const WithRequiredAuthInfoWrapper = (props: Subtract<P, WithLoggedInAuthInfoProps>) => {
        const context = useContext(AuthContext)
        if (context === undefined) {
            throw new Error("withRequiredAuthInfo must be used within an AuthProvider or RequiredAuthProvider")
        }

        const { loading, authInfo, displayWhileLoading, displayIfLoggedOut, refreshAuthInfo } = context

        function displayLoading() {
            if (args && args.displayWhileLoading) {
                return args.displayWhileLoading
            } else if (displayWhileLoading) {
                return displayWhileLoading
            }
            return <React.Fragment />
        }

        function displayLoggedOut() {
            if (args && args.displayIfLoggedOut) {
                return args.displayIfLoggedOut
            } else if (displayIfLoggedOut) {
                return displayIfLoggedOut
            }
            return <RedirectToLogin />
        }

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
                isImpersonating: !!authInfo.impersonatorUserId,
                impersonatorUserId: authInfo.impersonatorUserId,
                refreshAuthInfo,
            }
            return <Component {...loggedInProps} />
        } else {
            return displayLoggedOut()
        }
    }
    WithRequiredAuthInfoWrapper.displayName = displayName
    WithRequiredAuthInfoWrapper.WrappedComponent = Component

    return hoistNonReactStatics(WithRequiredAuthInfoWrapper, Component)
}
