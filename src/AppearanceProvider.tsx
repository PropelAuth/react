import React, { createContext, CSSProperties, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react"
import { AlertProps } from "./elements/Alert"
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
import { ModalProps } from "./elements/Modal"
import { ParagraphProps } from "./elements/Paragraph"
import { PopoverProps } from "./elements/Popover"
import { ProgressProps } from "./elements/Progress"
import { SelectProps } from "./elements/Select"
import { TableProps } from "./elements/Table"

export type Element<T> = (props: T) => JSX.Element

export type ElementAppearance<T> = string | CSSProperties | Element<T>

export type Appearance = {
    options?: {
        displayLogo?: boolean
    }
    elements?: {
        Alert?: ElementAppearance<AlertProps>
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
        Modal?: ElementAppearance<ModalProps>
        Paragraph?: ElementAppearance<ParagraphProps>
        Popover?: ElementAppearance<PopoverProps>
        Progress?: ElementAppearance<ProgressProps>
        Select?: ElementAppearance<SelectProps>
        Table?: ElementAppearance<TableProps>
    }
}

export type AppearanceState = {
    appearance: Appearance
    setAppearance: Dispatch<SetStateAction<Appearance>>
}

export const DEFAULT_APPEARANCE = {}

export const AppearanceContext = createContext<AppearanceState>({
    appearance: DEFAULT_APPEARANCE,
    setAppearance: () => DEFAULT_APPEARANCE,
})

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
    const { appearance, setAppearance } = useContext(AppearanceContext)
    return { appearance, setAppearance }
}
