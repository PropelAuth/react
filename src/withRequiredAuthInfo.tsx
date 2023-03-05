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

        function displayLoading() {
            if (args && args.displayWhileLoading) {
                return args.displayWhileLoading
            } else {
                return <React.Fragment />
            }
        }

        function displayLoggedOut() {
            if (args && args.displayIfLoggedOut) {
                return args.displayIfLoggedOut
            } else {
                return <RedirectToLogin />
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
            return displayLoggedOut()
        }
    }
    WithRequiredAuthInfoWrapper.displayName = displayName
    WithRequiredAuthInfoWrapper.WrappedComponent = Component

    return hoistNonReactStatics(WithRequiredAuthInfoWrapper, Component)
}
