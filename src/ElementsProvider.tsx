import React, {
    createContext,
    Dispatch,
    ForwardRefExoticComponent,
    ReactNode,
    RefAttributes,
    SetStateAction,
    useContext,
    useState,
} from "react"
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
import { ModalProps } from "./elements/Modal"
import { ParagraphProps } from "./elements/Paragraph"
import { PopoverProps } from "./elements/Popover"
import { ProgressProps } from "./elements/Progress"
import { SelectProps } from "./elements/Select"
import { TableProps } from "./elements/Table"

export type Elements = {
    Alert: ForwardRefExoticComponent<AlertProps & RefAttributes<HTMLDivElement>>
    AnchorButton: ForwardRefExoticComponent<AnchorButtonProps & RefAttributes<HTMLButtonElement>>
    Button: ForwardRefExoticComponent<ButtonProps & RefAttributes<HTMLButtonElement>>
    Checkbox: ForwardRefExoticComponent<CheckboxProps & RefAttributes<HTMLInputElement>>
    Container: ForwardRefExoticComponent<ContainerProps & RefAttributes<HTMLDivElement>>
    Divider: ForwardRefExoticComponent<DividerProps & RefAttributes<HTMLDivElement>>
    H1: ForwardRefExoticComponent<H1Props & RefAttributes<HTMLHeadingElement>>
    H3: ForwardRefExoticComponent<H3Props & RefAttributes<HTMLHeadingElement>>
    H5: ForwardRefExoticComponent<H5Props & RefAttributes<HTMLHeadingElement>>
    Image: ForwardRefExoticComponent<ImageProps & RefAttributes<HTMLImageElement>>
    Input: ForwardRefExoticComponent<InputProps & RefAttributes<HTMLInputElement>>
    Label: ForwardRefExoticComponent<LabelProps & RefAttributes<HTMLLabelElement>>
    Link: ForwardRefExoticComponent<LinkProps & RefAttributes<HTMLAnchorElement>>
    Modal: (props: ModalProps) => JSX.Element
    Paragraph: ForwardRefExoticComponent<ParagraphProps & RefAttributes<HTMLParagraphElement>>
    Popover: (props: PopoverProps) => JSX.Element
    Progress: ForwardRefExoticComponent<ProgressProps & RefAttributes<HTMLSpanElement>>
    Select: ForwardRefExoticComponent<SelectProps & RefAttributes<HTMLSelectElement>>
    Table: ForwardRefExoticComponent<TableProps & RefAttributes<HTMLTableElement>>
}

export type ElementsState = {
    elements: Elements
    setElements: Dispatch<SetStateAction<Elements>>
}

export const ElementsContext = createContext<ElementsState | undefined>(undefined)

export type ElementsProviderProps = {
    elements: Elements
    children?: ReactNode
}

export const ElementsProvider = ({ elements, children }: ElementsProviderProps) => {
    const [el, setEl] = useState(elements)
    return <ElementsContext.Provider value={{ elements: el, setElements: setEl }}>{children}</ElementsContext.Provider>
}

export const useElements = () => {
    const context = useContext(ElementsContext)

    if (context === undefined) {
        throw new Error("You must specify your elements within AuthProvider or RequiredAuthProvider")
    }

    return { elements: context.elements, setElements: context.setElements }
}
