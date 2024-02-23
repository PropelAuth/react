import React, { useContext, useEffect } from "react"
import { AuthContext } from "../AuthContext"

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
        redirectToSetupSAMLPage,
    } = context
    return {
        redirectToSignupPage,
        redirectToLoginPage,
        redirectToAccountPage,
        redirectToOrgPage,
        redirectToCreateOrgPage,
        redirectToSetupSAMLPage,
    }
}

export interface RedirectProps {
    children?: React.ReactNode
}

export interface RedirectToSignupProps extends RedirectProps {
    postSignupRedirectUrl?: string
    userSignupQueryParameters?: Record<string, string>
}

export function RedirectToSignup({
    children,
    postSignupRedirectUrl,
    userSignupQueryParameters,
}: RedirectToSignupProps) {
    const { redirectToSignupPage } = useRedirectFunctions()

    useEffect(() => redirectToSignupPage({ postSignupRedirectUrl, userSignupQueryParameters }), [])

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
