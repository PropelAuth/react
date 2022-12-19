import React, { CSSProperties, forwardRef, ReactNode } from "react"
import { ElementAppearance, useAppearance } from "../AppearanceProvider"
import { useElements } from "../ElementsProvider"
import { mergeProps } from "./utils"

export type DividerProps = {
    className?: string
    style?: CSSProperties
    children?: ReactNode
}

export type DividerPropsWithAppearance = {
    appearance?: ElementAppearance<DividerProps>
} & DividerProps

export const Divider = forwardRef<HTMLDivElement, DividerPropsWithAppearance>((props, ref) => {
    const { elements } = useElements()
    const { appearance } = useAppearance()
    const { classes, styles, Override } = mergeProps<DividerProps>({
        appearance: props.appearance,
        element: appearance.elements?.Divider,
    })

    if (Override) {
        return (
            <Override className={classes} style={styles}>
                {props.children}
            </Override>
        )
    }

    return (
        <elements.Divider ref={ref} className={classes} style={styles}>
            {props.children}
        </elements.Divider>
    )
})
