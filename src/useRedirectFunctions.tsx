import React, { useContext } from "react"
import { AuthContext } from "./AuthContext"

export function useRedirectFunctions() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useRedirectFunctions must be used within an AuthProvider or RequiredAuthProvider")
    }
    const {
        redirectToAccountPage,
        redirectToSignupPage,
        redirectToLoginPage,
        redirectToOrgPage,
        redirectToCreateOrgPage,
    } = context
    return {
        redirectToSignupPage,
        redirectToLoginPage,
        redirectToAccountPage,
        redirectToOrgPage,
        redirectToCreateOrgPage,
    }
}

export interface RedirectProps {
    children?: React.ReactNode
}

export function RedirectToSignup(props: RedirectProps) {
    const { redirectToSignupPage } = useRedirectFunctions()
    redirectToSignupPage()
    return <>{props.children}</>
}

export function RedirectToLogin(props: RedirectProps) {
    const { redirectToLoginPage } = useRedirectFunctions()
    redirectToLoginPage()
    return <>{props.children}</>
}
