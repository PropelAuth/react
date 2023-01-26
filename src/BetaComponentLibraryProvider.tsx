import React, { ReactNode } from "react"
import { Appearance, AppearanceProvider } from "./AppearanceProvider"
import { Elements, ElementsProvider } from "./ElementsProvider"

export type BetaComponentLibraryProviderProps = {
    elements: Elements
    appearance?: Appearance
    children: ReactNode
}

export const BetaComponentLibraryProvider = ({ elements, appearance, children }: BetaComponentLibraryProviderProps) => {
    return (
        <ElementsProvider elements={elements}>
            <AppearanceProvider appearance={appearance}>{children}</AppearanceProvider>
        </ElementsProvider>
    )
}
