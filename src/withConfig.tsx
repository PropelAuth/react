import { PropelauthFeV2 } from "@propelauth/js-apis"
import hoistNonReactStatics from "hoist-non-react-statics"
import React, { useContext } from "react"
import { Subtract } from "utility-types"
import { ErrorMessage, ErrorMessageAppearance } from "./components/ErrorMessage"
import { Loading, LoadingAppearance } from "./components/Loading"
import { ConfigContext } from "./ConfigProvider"

export type Config = PropelauthFeV2.AuthConfigurationResponse

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
        const context = useContext(ConfigContext)
        if (context === undefined) {
            throw new Error("useConfig must be used within an ConfigProvider")
        }

        const withConfigProps: P = {
            ...(props as P),
            config: context.config,
            configLoading: context.loading,
            configError: context.error,
        }

        if (context.config) {
            return <Component {...withConfigProps} />
        } else if (context.error) {
            return <ErrorMessage appearance={args?.appearance} />
        } else {
            return <Loading appearance={args?.appearance} />
        }
    }

    WithConfigWrapper.displayName = displayName
    WithConfigWrapper.WrappedComponent = Component

    return hoistNonReactStatics(WithConfigWrapper, Component)
}
