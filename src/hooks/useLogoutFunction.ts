import { useContext } from "react"
import { AuthContext } from "../AuthContext"

export function useLogoutFunction() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useLogoutFunction must be used within an AuthProvider or RequiredAuthProvider")
    }
    const { logout } = context
    return logout
}
