import React, { CSSProperties, forwardRef, MouseEventHandler, ReactNode } from "react"
import { ElementAppearance, useAppearance } from "../AppearanceProvider"
import { useElements } from "../ElementsProvider"
import { mergeProps } from "./utils"

export type AnchorButtonProps = {
    onClick?: MouseEventHandler<HTMLButtonElement>
    loading?: boolean
    disabled?: boolean
    id?: string
    className?: string
    style?: CSSProperties
    children?: ReactNode
}

export type AnchorButtonPropsWithAppearance = {
    appearance?: ElementAppearance<AnchorButtonProps>
} & AnchorButtonProps

export const AnchorButton = forwardRef<HTMLButtonElement, AnchorButtonPropsWithAppearance>((props, ref) => {
    const { elements } = useElements()
    const { appearance } = useAppearance()
    const { classes, styles, Override } = mergeProps<AnchorButtonProps>({
        appearance: props.appearance,
        element: appearance.elements?.AnchorButton,
    })

    if (Override === null) {
        return null
    } else if (Override) {
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
        <elements.AnchorButton
            ref={ref}
            loading={props.loading}
            disabled={props.disabled}
            onClick={props.onClick}
            id={props.id}
            className={classes}
            style={styles}
        >
            {props.children}
        </elements.AnchorButton>
    )
})
