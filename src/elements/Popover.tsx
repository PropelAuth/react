import React, { CSSProperties, Dispatch, ReactNode, SetStateAction } from "react"
import { ElementAppearance, useAppearance } from "../AppearanceProvider"
import { useElements } from "../ElementsProvider"
import { mergeProps } from "./utils"

export type PopoverProps = {
    referenceElement: HTMLElement | null
    show: boolean
    setShow: Dispatch<SetStateAction<boolean>>
    placement?: string
    className?: string
    style?: CSSProperties
    children?: ReactNode
}

export type PopoverPropsWithAppearance = {
    appearance?: ElementAppearance<PopoverProps>
} & PopoverProps

export const Popover = (props: PopoverPropsWithAppearance) => {
    const { elements } = useElements()
    const { appearance } = useAppearance()
    const { classes, styles, Override } = mergeProps<PopoverProps>({
        appearance: props.appearance,
        element: appearance.elements?.Popover,
    })

    if (Override === null) {
        return null
    } else if (Override) {
        return (
            <Override
                referenceElement={props.referenceElement}
                show={props.show}
                setShow={props.setShow}
                placement={props.placement}
                className={classes}
                style={styles}
            >
                {props.children}
            </Override>
        )
    }

    return (
        <elements.Popover
            referenceElement={props.referenceElement}
            show={props.show}
            setShow={props.setShow}
            placement={props.placement}
            className={classes}
            style={styles}
        >
            {props.children}
        </elements.Popover>
    )
}
