import React, {
    createContext,
    Dispatch,
    FC,
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
    Alert: FC<AlertProps & RefAttributes<HTMLDivElement>>
    AnchorButton: FC<AnchorButtonProps & RefAttributes<HTMLButtonElement>>
    Button: FC<ButtonProps & RefAttributes<HTMLButtonElement>>
    Checkbox: FC<CheckboxProps & RefAttributes<HTMLInputElement>>
    Container: FC<ContainerProps & RefAttributes<HTMLDivElement>>
    Divider: FC<DividerProps & RefAttributes<HTMLDivElement>>
    H1: FC<H1Props & RefAttributes<HTMLHeadingElement>>
    H3: FC<H3Props & RefAttributes<HTMLHeadingElement>>
    H5: FC<H5Props & RefAttributes<HTMLHeadingElement>>
    Image: FC<ImageProps & RefAttributes<HTMLImageElement>>
    Input: FC<InputProps & RefAttributes<HTMLInputElement>>
    Label: FC<LabelProps & RefAttributes<HTMLLabelElement>>
    Link: FC<LinkProps & RefAttributes<HTMLAnchorElement>>
    Modal: (props: ModalProps) => JSX.Element
    Paragraph: FC<ParagraphProps & RefAttributes<HTMLParagraphElement>>
    Popover: (props: PopoverProps) => JSX.Element
    Progress: FC<ProgressProps & RefAttributes<HTMLSpanElement>>
    Select: FC<SelectProps & RefAttributes<HTMLSelectElement>>
    Table: FC<TableProps & RefAttributes<HTMLTableElement>>
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
        throw new Error(
            "The component you are using is part of our component library beta (docs.propelauth.com/component-library/overview). " +
                "To use it, you must specify the `elements` prop in ComponentLibraryProvider."
        )
    }

    return { elements: context.elements, setElements: context.setElements }
}
