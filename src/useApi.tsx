import { useContext } from "react"
import { AuthContext } from "./AuthContext"

interface SuccessfulResponse {
    success: true
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

function apiUploadProfilePicture(formData: FormData): Promise<UploadProfilePictureResponse> {
    return new Promise<UploadProfilePictureResponse>((resolve) => {
        const http = new XMLHttpRequest()
        http.onreadystatechange = function () {
            if (http.readyState === XMLHttpRequest.DONE) {
                if (http.status >= 200 && http.status < 300) {
                    resolve({ success: true })
                } else if (http.status === 400) {
                    const jsonResponse = JSON.parse(http.responseText)
                    resolve({
                        success: false,
                        error_type: "bad_image",
                        message: jsonResponse["file"],
                    })
                }
            }
        }

        http.open("post", "/api/fe/v1/update_profile_image")
        http.withCredentials = true
        http.setRequestHeader("X-CSRF-Token", "-.-")
        http.send(formData)
    })
}

export const legacyApi = {
    uploadProfilePicture: apiUploadProfilePicture,
}

export const useApi = () => {
    const context = useContext(AuthContext)

    if (context === undefined) {
        throw new Error("useConfig must be used within an AuthProvider")
    }

    return {
        loginApi: context.api.login,
        mfaApi: context.api.mfa,
        orgApi: context.api.org,
        userApi: context.api.user,
        orgUserApi: context.api.userInOrg,
        legacyApi: legacyApi,
    }
}