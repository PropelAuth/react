import React, { CSSProperties, forwardRef, ReactNode } from "react"
import { ElementAppearance, useAppearance } from "../AppearanceProvider"
import { useElements } from "../ElementsProvider"
import { mergeProps } from "./utils"

export type H1Props = {
    className?: string
    style?: CSSProperties
    children?: ReactNode
}

export type H1PropsWithAppearance = {
    appearance?: ElementAppearance<H1Props>
} & H1Props

export const H1 = forwardRef<HTMLHeadingElement, H1PropsWithAppearance>((props, ref) => {
    const { elements } = useElements()
    const { appearance } = useAppearance()
    const { classes, styles, Override } = mergeProps<H1Props>({
        appearance: props.appearance,
        element: appearance.elements?.H1,
    })

    if (Override === null) {
        return null
    } else if (Override) {
        return (
            <Override className={classes} style={styles}>
                {props.children}
            </Override>
        )
    }

    return (
        <elements.H1 ref={ref} className={classes} style={styles}>
            {props.children}
        </elements.H1>
    )
})
