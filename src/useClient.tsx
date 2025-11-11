import { useContext } from "react"
import { AuthContext } from "./AuthContext"

export function useClient() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useClient must be used within an AuthProvider or RequiredAuthProvider")
    }
    return context.client;
}
