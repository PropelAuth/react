import { useContext } from "react"
import { useAuthUrl } from "./additionalHooks"
import { AuthContext } from "./AuthContext"

interface SuccessfulResponse {
    success: true
    pictureUrl: string
}

interface UnexpectedErrorResponse {
    success: false
    error_type: "unexpected_error"
}

interface BadImageResponse {
    success: false
    error_type: "bad_image"
    message: string
}

type UploadProfilePictureResponse = SuccessfulResponse | BadImageResponse | UnexpectedErrorResponse

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
                    }
                }
            }

            http.open("post", `${authUrl}/api/fe/v2/update_profile_image`)
            http.withCredentials = true
            http.setRequestHeader("X-CSRF-Token", "-.-")
            http.send(formData)
        })
    }

    return { uploadProfilePicture: apiUploadProfilePicture }
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
        orgUserApi: context.api.userInOrg,
        configApi: context.api.config,
        legacyApi: legacyApi,
    }
}
