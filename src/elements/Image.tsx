import React, { CSSProperties, forwardRef } from "react"
import { ElementAppearance, useAppearance } from "../AppearanceProvider"
import { useElements } from "../ElementsProvider"
import { mergeProps } from "./utils"

export type ImageProps = {
    src: string
    alt?: string
    className?: string
    style?: CSSProperties
}

export type ImagePropsWithAppearance = {
    appearance?: ElementAppearance<ImageProps>
} & ImageProps

export const Image = forwardRef<HTMLImageElement, ImagePropsWithAppearance>((props, ref) => {
    const { elements } = useElements()
    const { appearance } = useAppearance()
    const { classes, styles, Override } = mergeProps<ImageProps>({
        appearance: props.appearance,
        element: appearance.elements?.Image,
    })

    if (Override) {
        return <Override src={props.src} alt={props.alt} className={classes} style={styles} />
    }

    return <elements.Image ref={ref} src={props.src} alt={props.alt} className={classes} style={styles} />
})
