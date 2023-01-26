import { PropelAuthFeV2 } from "@propelauth/js-apis"
import hoistNonReactStatics from "hoist-non-react-statics"
import React, { useContext, useEffect, useState } from "react"
import { Subtract } from "utility-types"
import { AuthContext } from "./AuthContext"
import { UNEXPECTED_ERROR } from "./components/constants"
import { ErrorMessage, ErrorMessageAppearance } from "./components/ErrorMessage"
import { Loading, LoadingAppearance } from "./components/Loading"
import { useApi } from "./useApi"

export type Config = PropelAuthFeV2.AuthConfigurationResponse

export type WithConfigProps = {
    config: Config
    configLoading: boolean
    configError?: string
}

export interface WithConfigArgs {
    appearance?: LoadingAppearance & ErrorMessageAppearance
}

export function withConfig<P extends WithConfigProps>(
    Component: React.ComponentType<P>,
    args?: WithConfigArgs
): React.ComponentType<Subtract<P, WithConfigProps>> {
    const displayName = `withConfig(${Component.displayName || Component.name || "Component"})`

    const WithConfigWrapper = (props: Subtract<P, WithConfigProps>) => {
        const context = useContext(AuthContext)
        if (context === undefined) {
            throw new Error("useConfig must be used within an AuthProvider")
        }

        const { configApi } = useApi()
        const [config, setConfig] = useState<Config | null>(null)
        const [loading, setLoading] = useState<boolean>(true)
        const [error, setError] = useState<string | undefined>(undefined)

        useEffect(() => {
            let mounted = true
            configApi
                .fetchConfig()
                .then((res) => {
                    if (mounted) {
                        if (res.ok) {
                            setConfig(res.body)
                        } else {
                            res.error._visit({
                                _other: () => setError(UNEXPECTED_ERROR),
                            })
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
        }, [configApi])

        const withConfigProps: P = {
            ...(props as P),
            config: config,
            configLoading: loading,
            configError: error,
        }

        if (config) {
            return <Component {...withConfigProps} />
        } else if (error) {
            return <ErrorMessage appearance={args?.appearance} />
        } else {
            return <Loading appearance={args?.appearance} />
        }
    }

    WithConfigWrapper.displayName = displayName
    WithConfigWrapper.WrappedComponent = Component

    return hoistNonReactStatics(WithConfigWrapper, Component)
}
