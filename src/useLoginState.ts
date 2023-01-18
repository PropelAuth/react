import { PropelAuthFeV2 } from "@propel-auth-fern/fe_v2-client"
import { useEffect, useState } from "react"
import { UNEXPECTED_ERROR } from "./components/constants"
import { useApi } from "./useApi"

export const useLoginState = () => {
    const { loginApi } = useApi()
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | undefined>(undefined)
    const [loginState, setLoginState] = useState<PropelAuthFeV2.LoginStateEnum | undefined>(undefined)

    useEffect(() => {
        let mounted = true
        setError(undefined)
        setLoading(true)
        loginApi
            .fetchLoginState()
            .then((response) => {
                if (mounted) {
                    if (response.ok) {
                        setLoginState(response.body.loginState)
                    } else {
                        setError(UNEXPECTED_ERROR)
                    }
                }
            })
            .catch((e) => {
                setError(UNEXPECTED_ERROR)
                console.error(e)
            })
            .finally(() => setLoading(false))

        return () => {
            mounted = false
        }
    }, [])

    async function getLoginState() {
        try {
            setError(undefined)
            setLoading(true)
            const response = await loginApi.fetchLoginState()
            if (response.ok) {
                setLoginState(response.body.loginState)
            } else {
                setError(UNEXPECTED_ERROR)
            }
        } catch (e) {
            setError(UNEXPECTED_ERROR)
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return {
        loginStateLoading: loading,
        loginStateError: error,
        loginState,
        getLoginState,
    }
}
