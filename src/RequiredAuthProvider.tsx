import React from "react"
import { AuthProvider, RequiredAuthProviderProps } from "./AuthContext"
import { WithLoggedInAuthInfoProps } from "./withAuthInfo"
import { withRequiredAuthInfo } from "./withRequiredAuthInfo"

const RequiredAuthWrappedComponent = withRequiredAuthInfo(
    ({ children }: { children: React.ReactNode } & WithLoggedInAuthInfoProps) => <>{children}</>
)

export const RequiredAuthProvider = (props: RequiredAuthProviderProps) => {
    const { children, displayIfLoggedOut, displayWhileLoading, ...sharedProps } = props

    return (
        <AuthProvider
            {...sharedProps}
            defaultDisplayIfLoggedOut={displayIfLoggedOut}
            defaultDisplayWhileLoading={displayWhileLoading}
        >
            <RequiredAuthWrappedComponent>{children}</RequiredAuthWrappedComponent>
        </AuthProvider>
    )
}
