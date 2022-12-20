import { useContext, useEffect, useState } from "react"
import { AuthContext } from "./AuthContext"

export type Config = {
    logo_url: string
    site_display_name: string
    has_google_login: boolean
    has_github_login: boolean
    has_microsoft_login: boolean
    has_slack_login: boolean
    has_linkedin_login: boolean
    has_passwordless_login: boolean
    has_any_social_login: boolean
    has_sso_login: boolean
    has_password_login: boolean
    only_extra_login_is_passwordless: boolean
    require_username: boolean
    require_name: boolean
    profile_picture_url: string
    require_profile_picture: boolean
    orgs_metaname: string
    roles: string[]
}

export const useConfig = () => {
    const context = useContext(AuthContext)
    const [loading, setLoading] = useState(false)

    if (context === undefined) {
        throw new Error("useConfig must be used within an AuthProvider")
    }

    const [config, setConfig] = useState<Config | null>(null)

    useEffect(() => {
        async function getConfigFromUrl() {
            setLoading(true)
            // Fetch from API
            setLoading(false)
        }

        getConfigFromUrl()
    }, [])

    return { configLoading: loading, config }
}
