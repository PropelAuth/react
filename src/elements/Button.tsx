import React, { CSSProperties, forwardRef, MouseEventHandler, ReactNode } from "react"
import { ElementAppearance, useAppearance } from "../AppearanceProvider"
import { useElements } from "../ElementsProvider"
import { mergeProps } from "./utils"

export type ButtonProps = {
    onClick?: MouseEventHandler<HTMLButtonElement>
    loading?: boolean
    disabled?: boolean
    id?: string
    className?: string
    style?: CSSProperties
    children?: ReactNode
}

export type ButtonPropsWithAppearance = {
    appearance?: ElementAppearance<ButtonProps>
} & ButtonProps

export const Button = forwardRef<HTMLButtonElement, ButtonPropsWithAppearance>((props, ref) => {
    const { elements } = useElements()
    const { appearance } = useAppearance()
    const { classes, styles, Override } = mergeProps<ButtonProps>({
        appearance: props.appearance,
        element: appearance.elements?.Button,
    })

    if (Override) {
        return (
            <Override
                loading={props.loading}
                disabled={props.disabled}
                onClick={props.onClick}
                id={props.id}
                className={classes}
                style={styles}
            >
                {props.children}
            </Override>
        )
    }

    return (
        <elements.Button
            ref={ref}
            loading={props.loading}
            disabled={props.disabled}
            onClick={props.onClick}
            id={props.id}
            className={classes}
            style={styles}
        >
            {props.children}
        </elements.Button>
    )
})
