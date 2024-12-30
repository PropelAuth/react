import { useContext } from "react"
import { AuthContext } from "../AuthContext"

export function useAuthUrl() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuthUrl must be used within an AuthProvider or RequiredAuthProvider")
    }
    const { authUrl } = context
    return authUrl
}
