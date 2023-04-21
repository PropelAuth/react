import { RedirectToLoginOptions, RedirectToSignupOptions } from "@propelauth/javascript"
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

export interface RedirectToSignupProps extends RedirectProps, RedirectToSignupOptions {}

export function RedirectToSignup(props: RedirectToSignupProps) {
    const { redirectToSignupPage } = useRedirectFunctions()
    useEffect(() => {
        redirectToSignupPage(props)
    }, [])
    return <>{props.children}</>
}

export interface RedirectToLoginProps extends RedirectProps, RedirectToLoginOptions {}

export function RedirectToLogin(props: RedirectToLoginProps) {
    const { redirectToLoginPage } = useRedirectFunctions()
    useEffect(() => {
        redirectToLoginPage(props)
    }, [])
    return <>{props.children}</>
}
