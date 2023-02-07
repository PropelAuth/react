import React, { createContext, ReactNode, useEffect, useState } from "react"
import { UNEXPECTED_ERROR } from "./components/constants"
import { useApi } from "./useApi"
import { Config } from "./withConfig"

export type ConfigContextState = {
    loading: boolean
    config?: Config
    error?: string
}

export const ConfigContext = createContext<ConfigContextState>({ loading: true, config: undefined, error: undefined })

export type ConfigProviderProps = {
    manuallySpecifiedConfig?: Config
    children?: ReactNode
}

export const ConfigProvider = ({ manuallySpecifiedConfig, children }: ConfigProviderProps) => {
    const { configApi } = useApi()
    const [config, setConfig] = useState<Config | undefined>(manuallySpecifiedConfig)
    const [loading, setLoading] = useState<boolean>(!manuallySpecifiedConfig)
    const [error, setError] = useState<string | undefined>(undefined)

    useEffect(() => {
        if (manuallySpecifiedConfig) {
            return
        }

        let mounted = true
        configApi
            .fetchConfig()
            .then((res) => {
                if (!mounted) {
                    return
                }

                if (res.ok) {
                    setConfig(res.body)
                } else {
                    res.error._visit({
                        _other: () => setError(UNEXPECTED_ERROR),
                    })
                }
            })
            .catch((e) => {
                if (mounted) {
                    setError(UNEXPECTED_ERROR)
                    console.error(e)
                }
            })
            .finally(() => {
                if (mounted) {
                    setLoading(false)
                }
            })
        return () => {
            mounted = false
        }
    }, [])

    return (
        <ConfigContext.Provider
            value={{
                config,
                error,
                loading,
            }}
        >
            {children}
        </ConfigContext.Provider>
    )
}
