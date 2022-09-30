import hoistNonReactStatics from "hoist-non-react-statics"
import React, { useContext } from "react"
import { Subtract } from "utility-types"
import { AuthContext } from "./AuthContext"
import { RedirectToLogin } from "./useRedirectFunctions"
import { WithLoggedInAuthInfoProps } from "./withAuthInfo"
import { withAuthInfo } from "./withAuthInfo"

export interface WithRequiredAuthInfoArgs {
    displayWhileLoading?: React.ReactElement
    displayIfLoggedOut?: React.ReactElement
}

export function withRequiredAuthInfo<P extends WithLoggedInAuthInfoProps>(
    Component: React.ComponentType<P>,
    args?: WithRequiredAuthInfoArgs
): React.ComponentType<Subtract<P, WithLoggedInAuthInfoProps>> {
    const WithRequiredAuthInfoWrapper = (props: Subtract<P, WithLoggedInAuthInfoProps>) => {      
        const context = useContext(AuthContext)
        if (context === undefined) {
            throw new Error("withRequiredAuthInfo must be used within an AuthProvider or RequiredAuthProvider")
        }

        function displayLoggedOut() {
            if (args && args.displayIfLoggedOut) {
                return args.displayIfLoggedOut
            } else {
                return <RedirectToLogin />
            }
        }

        const { authInfo } = context
        if (!authInfo) {
          return displayLoggedOut()
        } else {
          const ComponentWithAuthInfo = withAuthInfo(Component, args)
          return <ComponentWithAuthInfo {...props} />
        }

    }

    WithRequiredAuthInfoWrapper.displayName = `withRequiredAuthInfo(${Component.displayName || Component.name || "Component"})`
    WithRequiredAuthInfoWrapper.WrappedComponent = Component
    return hoistNonReactStatics(WithRequiredAuthInfoWrapper, Component)
}
