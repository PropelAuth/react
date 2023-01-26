import React, { CSSProperties, forwardRef, ReactNode } from "react"
import { ElementAppearance, useAppearance } from "../AppearanceProvider"
import { useElements } from "../ElementsProvider"
import { mergeProps } from "./utils"

export type H5Props = {
    className?: string
    style?: CSSProperties
    children?: ReactNode
}

export type H5PropsWithAppearance = {
    appearance?: ElementAppearance<H5Props>
} & H5Props

export const H5 = forwardRef<HTMLHeadingElement, H5PropsWithAppearance>((props, ref) => {
    const { elements } = useElements()
    const { appearance } = useAppearance()
    const { classes, styles, Override } = mergeProps<H5Props>({
        appearance: props.appearance,
        element: appearance.elements?.H5,
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
        <elements.H5 ref={ref} className={classes} style={styles}>
            {props.children}
        </elements.H5>
    )
})
