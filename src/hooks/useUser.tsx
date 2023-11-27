import { UserClass } from "@propelauth/javascript"
import { useContext } from "react"
import { AuthContext } from "../AuthContext"

export const useUser = (): UserClass | null => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useUser must be used within an AuthProvider or RequiredAuthProvider")
    }

    const { loading, authInfo } = context

    if (loading) {
        return null
    }
    if (!authInfo) {
        return null
    }

    return authInfo.userClass
}
