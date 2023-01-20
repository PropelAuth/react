import React, { CSSProperties, forwardRef, ReactNode } from "react"
import { ElementAppearance, useAppearance } from "../AppearanceProvider"
import { useElements } from "../ElementsProvider"
import { mergeProps } from "./utils"

export type ParagraphProps = {
    className?: string
    style?: CSSProperties
    children?: ReactNode
}

export type ParagraphPropsWithAppearance = {
    appearance?: ElementAppearance<ParagraphProps>
} & ParagraphProps

export const Paragraph = forwardRef<HTMLParagraphElement, ParagraphPropsWithAppearance>((props, ref) => {
    const { elements } = useElements()
    const { appearance } = useAppearance()
    const { classes, styles, Override } = mergeProps<ParagraphProps>({
        appearance: props.appearance,
        element: appearance.elements?.Paragraph,
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
        <elements.Paragraph ref={ref} className={classes} style={styles}>
            {props.children}
        </elements.Paragraph>
    )
})
