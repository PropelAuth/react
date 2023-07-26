import { PropelauthFeV2 } from "@propelauth/js-apis"
import { useEffect, useState } from "react"
import { UNEXPECTED_ERROR } from "./components/constants"
import { useApi } from "./useApi"

export type UseLoginStateProps = {
    overrideCurrentScreenForTesting?: PropelauthFeV2.LoginStateEnum
}

export const useLoginState = ({ overrideCurrentScreenForTesting }: UseLoginStateProps) => {
    const { loginApi } = useApi()
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | undefined>(undefined)
    const [loginState, setLoginState] = useState<PropelauthFeV2.LoginStateEnum | undefined>(undefined)

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
    }, [loginApi])

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

    if (overrideCurrentScreenForTesting) {
        return {
            loginStateLoading: false,
            loginStateError: undefined,
            loginState: overrideCurrentScreenForTesting,
            getLoginState: () => setLoginState(overrideCurrentScreenForTesting),
        }
    }

    return {
        loginStateLoading: loading,
        loginStateError: error,
        loginState: loginState,
        getLoginState,
    }
}
