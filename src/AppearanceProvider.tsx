import React, { createContext, CSSProperties, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react"
import { AlertProps } from "./elements/Alert"
import { AnchorButtonProps } from "./elements/AnchorButton"
import { ButtonProps } from "./elements/Button"
import { CheckboxProps } from "./elements/Checkbox"
import { ContainerProps } from "./elements/Container"
import { DividerProps } from "./elements/Divider"
import { H1Props } from "./elements/H1"
import { H3Props } from "./elements/H3"
import { H5Props } from "./elements/H5"
import { ImageProps } from "./elements/Image"
import { InputProps } from "./elements/Input"
import { LabelProps } from "./elements/Label"
import { LinkProps } from "./elements/Link"
import { LoaderProps } from "./elements/Loader"
import { ParagraphProps } from "./elements/Paragraph"
import { SelectProps } from "./elements/Select"

export type Element<T> = ((props: T) => JSX.Element) | null

export type ElementAppearance<T> = string | CSSProperties | Element<T> | null

export type Appearance = {
    elements?: {
        Alert?: ElementAppearance<AlertProps>
        AnchorButton?: ElementAppearance<AnchorButtonProps>
        Button?: ElementAppearance<ButtonProps>
        Checkbox?: ElementAppearance<CheckboxProps>
        Container?: ElementAppearance<ContainerProps>
        Divider?: ElementAppearance<DividerProps>
        H1?: ElementAppearance<H1Props>
        H3?: ElementAppearance<H3Props>
        H5?: ElementAppearance<H5Props>
        Image?: ElementAppearance<ImageProps>
        Input?: ElementAppearance<InputProps>
        Label?: ElementAppearance<LabelProps>
        Link?: ElementAppearance<LinkProps>
        Paragraph?: ElementAppearance<ParagraphProps>
        Loader?: ElementAppearance<LoaderProps>
        Select?: ElementAppearance<SelectProps>
    }
}

export type AppearanceState = {
    appearance: Appearance
    setAppearance: Dispatch<SetStateAction<Appearance>>
}

export const DEFAULT_APPEARANCE = {}

export const AppearanceContext = createContext<AppearanceState | undefined>(undefined)

export type AppearanceProviderProps = {
    appearance?: Appearance
    children?: ReactNode
}

export const AppearanceProvider = ({ appearance, children }: AppearanceProviderProps) => {
    const [_appearance, _setAppearance] = useState(appearance || DEFAULT_APPEARANCE)

    return (
        <AppearanceContext.Provider
            value={{
                appearance: _appearance,
                setAppearance: _setAppearance,
            }}
        >
            {children}
        </AppearanceContext.Provider>
    )
}

export const useAppearance = () => {
    const context = useContext(AppearanceContext)

    if (context === undefined) {
        throw new Error(
            "The component you are using is part of our component library beta (docs.propelauth.com/component-library/overview). " +
                "To use it, you must specify the `appearance` prop in ComponentLibraryProvider."
        )
    }

    return { appearance: context.appearance, setAppearance: context.setAppearance }
}
