import React, { CSSProperties, forwardRef } from "react"
import { ElementAppearance, useAppearance } from "../AppearanceProvider"
import { useElements } from "../ElementsProvider"
import { mergeProps } from "./utils"

export type LoaderProps = {
    className?: string
    style?: CSSProperties
}

export type ProgressPropsWithAppearance = {
    appearance?: ElementAppearance<LoaderProps>
} & LoaderProps

export const Loader = forwardRef<HTMLSpanElement, ProgressPropsWithAppearance>((props, ref) => {
    const { elements } = useElements()
    const { appearance } = useAppearance()
    const { classes, styles, Override } = mergeProps<LoaderProps>({
        appearance: props.appearance,
        element: appearance.elements?.Loader,
    })

    if (Override === null) {
        return null
    } else if (Override) {
        return <Override className={classes} style={styles} />
    }

    return <elements.Loader ref={ref} className={classes} style={styles} />
})
