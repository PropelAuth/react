import React, { ReactNode } from "react"
import { Appearance, AppearanceProvider } from "./AppearanceProvider"
import { ConfigProvider } from "./ConfigProvider"
import { Elements, ElementsProvider } from "./ElementsProvider"
import { Config } from "./withConfig"

export type BetaComponentLibraryProviderProps = {
    elements: Elements
    appearance?: Appearance
    // If unspecified, this will be fetched. Be careful when hardcoding this, as you don't want it to get out of sync with your configuration.
    manuallySpecifiedConfig?: Config
    children: ReactNode
}

export const BetaComponentLibraryProvider = ({
    elements,
    appearance,
    manuallySpecifiedConfig,
    children,
}: BetaComponentLibraryProviderProps) => {
    return (
        <ElementsProvider elements={elements}>
            <AppearanceProvider appearance={appearance}>
                <ConfigProvider manuallySpecifiedConfig={manuallySpecifiedConfig}>{children}</ConfigProvider>
            </AppearanceProvider>
        </ElementsProvider>
    )
}
