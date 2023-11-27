import { useContext } from "react"
import { AuthContext } from "../AuthContext"

export function useHostedPageUrls() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useHostedPageUrls must be used within an AuthProvider or RequiredAuthProvider")
    }
    const {
        getLoginPageUrl,
        getSignupPageUrl,
        getAccountPageUrl,
        getOrgPageUrl,
        getCreateOrgPageUrl,
        getSetupSAMLPageUrl,
    } = context
    return {
        getLoginPageUrl,
        getSignupPageUrl,
        getAccountPageUrl,
        getOrgPageUrl,
        getCreateOrgPageUrl,
        getSetupSAMLPageUrl,
    }
}
