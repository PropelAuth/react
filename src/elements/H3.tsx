import React, { CSSProperties, forwardRef, ReactNode } from "react"
import { ElementAppearance, useAppearance } from "../AppearanceProvider"
import { useElements } from "../ElementsProvider"
import { mergeProps } from "./utils"

export type H3Props = {
    className?: string
    style?: CSSProperties
    children?: ReactNode
}

export type H3PropsWithAppearance = {
    appearance?: ElementAppearance<H3Props>
} & H3Props

export const H3 = forwardRef<HTMLHeadingElement, H3PropsWithAppearance>((props, ref) => {
    const { elements } = useElements()
    const { appearance } = useAppearance()
    const { classes, styles, Override } = mergeProps<H3Props>({
        appearance: props.appearance,
        element: appearance.elements?.H3,
    })

    if (Override) {
        return (
            <Override className={classes} style={styles}>
                {props.children}
            </Override>
        )
    }

    return (
        <elements.H3 ref={ref} className={classes} style={styles}>
            {props.children}
        </elements.H3>
    )
})
