import React, { ReactNode } from "react"
import { Appearance, AppearanceProvider } from "./AppearanceProvider"
import { Elements, ElementsProvider } from "./ElementsProvider"

export type ComponentLibraryProviderProps = {
    elements: Elements
    appearance?: Appearance
    children: ReactNode
}

export const ComponentLibraryProvider = ({ elements, appearance, children }: ComponentLibraryProviderProps) => {
    return (
        <ElementsProvider elements={elements}>
            <AppearanceProvider appearance={appearance}>{children}</AppearanceProvider>
        </ElementsProvider>
    )
}
