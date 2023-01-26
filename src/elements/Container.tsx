import React, { CSSProperties, forwardRef, ReactNode } from "react"
import { ElementAppearance, useAppearance } from "../AppearanceProvider"
import { useElements } from "../ElementsProvider"
import { mergeProps } from "./utils"

export type ContainerProps = {
    className?: string
    style?: CSSProperties
    children?: ReactNode
}

export type ContainerPropsWithAppearance = {
    appearance?: ElementAppearance<ContainerProps>
} & ContainerProps

export const Container = forwardRef<HTMLDivElement, ContainerPropsWithAppearance>((props, ref) => {
    const { elements } = useElements()
    const { appearance } = useAppearance()
    const { classes, styles, Override } = mergeProps<ContainerProps>({
        appearance: props.appearance,
        element: appearance.elements?.Container,
    })

    if (Override === null) {
        return <>{props.children}</>
    } else if (Override) {
        return (
            <Override className={classes} style={styles}>
                {props.children}
            </Override>
        )
    }

    return (
        <elements.Container ref={ref} className={classes} style={styles}>
            {props.children}
        </elements.Container>
    )
})
