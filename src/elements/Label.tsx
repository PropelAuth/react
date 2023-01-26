import React, { CSSProperties, forwardRef, ReactNode } from "react"
import { ElementAppearance, useAppearance } from "../AppearanceProvider"
import { useElements } from "../ElementsProvider"
import { mergeProps } from "./utils"

export type LabelProps = {
    htmlFor?: string
    className?: string
    style?: CSSProperties
    children?: ReactNode
}

export type LabelPropsWithAppearance = {
    appearance?: ElementAppearance<LabelProps>
} & LabelProps

export const Label = forwardRef<HTMLLabelElement, LabelPropsWithAppearance>((props, ref) => {
    const { elements } = useElements()
    const { appearance } = useAppearance()
    const { classes, styles, Override } = mergeProps<LabelProps>({
        appearance: props.appearance,
        element: appearance.elements?.Label,
    })

    if (Override === null) {
        return null
    } else if (Override) {
        return (
            <Override htmlFor={props.htmlFor} className={classes} style={styles}>
                {props.children}
            </Override>
        )
    }

    return (
        <elements.Label ref={ref} htmlFor={props.htmlFor} className={classes} style={styles}>
            {props.children}
        </elements.Label>
    )
})
