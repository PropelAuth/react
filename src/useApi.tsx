import _ from "lodash"
import { useContext } from "react"
import { useAuthUrl } from "./additionalHooks"
import { AuthContext } from "./AuthContext"

interface SuccessfulImageResponse {
    success: true
    pictureUrl: string
}

interface BadImageResponse {
    success: false
    error_type: "bad_image"
    message: string
}

interface UnexpectedErrorResponse {
    success: false
    error_type: "unexpected_error"
}

type UploadProfilePictureResponse = SuccessfulImageResponse | BadImageResponse | UnexpectedErrorResponse

export type UserMetadataResponse = null | {
    first_name: string | null
    last_name: string | null
    username: string | null
    user_properties: Record<string, string | number | boolean | null> | null
}

export const useLegacyApi = () => {
    const { authUrl } = useAuthUrl()

    function apiUploadProfilePicture(formData: FormData): Promise<UploadProfilePictureResponse> {
        return new Promise<UploadProfilePictureResponse>((resolve) => {
            const http = new XMLHttpRequest()
            http.onreadystatechange = function () {
                if (http.readyState === XMLHttpRequest.DONE) {
                    if (http.status >= 200 && http.status < 300) {
                        const jsonResponse = JSON.parse(http.response)
                        resolve({ success: true, pictureUrl: jsonResponse.picture_url })
                    } else if (http.status === 400) {
                        const jsonResponseText = JSON.parse(http.responseText)
                        resolve({
                            success: false,
                            error_type: "bad_image",
                            message: jsonResponseText["file"],
                        })
                    } else {
                        resolve({
                            success: false,
                            error_type: "unexpected_error",
                        })
                    }
                }
            }

            http.open("post", `${authUrl}/api/fe/v2/update_profile_image`)
            http.withCredentials = true
            http.setRequestHeader("X-CSRF-Token", "-.-")
            http.send(formData)
        })
    }

    function apiGetUserMetadata(): Promise<UserMetadataResponse> {
        return new Promise<UserMetadataResponse>((resolve) => {
            const http = new XMLHttpRequest()
            http.onreadystatechange = function () {
                if (http.readyState === XMLHttpRequest.DONE) {
                    if (http.status >= 200 && http.status < 300) {
                        const jsonResponse = _.omit(JSON.parse(http.response), [
                            "theme",
                            "logo_url",
                            "site_display_name",
                            "has_orgs",
                            "orgs_metaname",
                            "is_authenticated",
                            "email_confirmed",
                            "auto_confirm_emails",
                            "login_redirect_url",
                            "home_redirect_url",
                            "user_can_delete_own_accounts",
                            "picture_url",
                            "is_test_env",
                            "show_powered_by",
                            "require_profile_picture",
                            "require_username",
                            "require_name",
                            "user_property_settings",
                            "email",
                        ]) as UserMetadataResponse
                        resolve(jsonResponse)
                    } else {
                        resolve(null)
                    }
                }
            }

            http.open("get", `${authUrl}/ssr/account_config`)
            http.withCredentials = true
            http.setRequestHeader("X-CSRF-Token", "-.-")
            http.setRequestHeader("Content-Type", "application/json")
            http.send()
        })
    }

    return { uploadProfilePicture: apiUploadProfilePicture, getUserMetadata: apiGetUserMetadata }
}

export const useApi = () => {
    const context = useContext(AuthContext)
    const legacyApi = useLegacyApi()

    if (context === undefined) {
        throw new Error("useConfig must be used within an AuthProvider")
    }

    return {
        loginApi: context.api.login,
        mfaApi: context.api.mfa,
        orgApi: context.api.org,
        userApi: context.api.user,
        configApi: context.api.config,
        legacyApi: legacyApi,
    }
}
