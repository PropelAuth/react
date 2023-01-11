import { PropelAuthFeV2 } from "@propel-auth-fern/fe_v2-client"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "./AuthContext"
import { useApi } from "./useApi"

export type Config = PropelAuthFeV2.AuthConfigurationResponse

export const useConfig = () => {
    const context = useContext(AuthContext)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    if (context === undefined) {
        throw new Error("useConfig must be used within an AuthProvider")
    }

    const { configApi } = useApi()
    const [config, setConfig] = useState<Config | null>(null)

    useEffect(() => {
        async function getConfigFromUrl() {
            setLoading(true)
            setError(false)
            let response = await configApi.fetchConfig()
            if (response.ok) {
                setConfig(response.body)
            } else {
                response.error._visit({
                    _other: () => setError(true),
                })
            }
            setLoading(false)
        }

        getConfigFromUrl()
    }, [])

    return { configLoading: loading, config, error }
}
