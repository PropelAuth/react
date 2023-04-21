import React, { useContext, useEffect } from "react"
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

export interface RedirectToSignupProps extends RedirectProps {
    postSignupRedirectUrl?: string
}

export function RedirectToSignup({ children, postSignupRedirectUrl }: RedirectToSignupProps) {
    const { redirectToSignupPage } = useRedirectFunctions()

    useEffect(() => {
        if (postSignupRedirectUrl) {
            redirectToSignupPage({ postSignupRedirectUrl })
        } else {
            redirectToSignupPage()
        }
    }, [])

    return <>{children}</>
}

export interface RedirectToLoginProps extends RedirectProps {
    postLoginRedirectUrl?: string
}

export function RedirectToLogin({ children, postLoginRedirectUrl }: RedirectToLoginProps) {
    const { redirectToLoginPage } = useRedirectFunctions()
    useEffect(() => {
        if (postLoginRedirectUrl) {
            redirectToLoginPage({ postLoginRedirectUrl })
        } else {
            redirectToLoginPage()
        }
    }, [])
    return <>{children}</>
}
