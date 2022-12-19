import React, { CSSProperties, Dispatch, ReactNode, SetStateAction } from "react"
import { ElementAppearance, useAppearance } from "../AppearanceProvider"
import { useElements } from "../ElementsProvider"
import { mergeProps } from "./utils"

export type ModalProps = {
    show: boolean
    setShow: Dispatch<SetStateAction<boolean>>
    onClose?: () => void
    className?: string
    style?: CSSProperties
    children?: ReactNode
}

export type ModalPropsWithAppearance = {
    appearance?: ElementAppearance<ModalProps>
} & ModalProps

export const Modal = (props: ModalPropsWithAppearance) => {
    const { elements } = useElements()
    const { appearance } = useAppearance()
    const { classes, styles, Override } = mergeProps<ModalProps>({
        appearance: props.appearance,
        element: appearance.elements?.Modal,
    })

    if (Override) {
        return (
            <Override
                show={props.show}
                setShow={props.setShow}
                onClose={props.onClose}
                className={classes}
                style={styles}
            >
                {props.children}
            </Override>
        )
    }

    return (
        <elements.Modal
            show={props.show}
            setShow={props.setShow}
            onClose={props.onClose}
            className={classes}
            style={styles}
        >
            {props.children}
        </elements.Modal>
    )
}
