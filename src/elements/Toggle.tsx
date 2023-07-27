import type { SwitchProps } from "@mantine/core"
import React, { ChangeEventHandler, CSSProperties, forwardRef, ReactNode } from "react"
import { ElementAppearance, useAppearance } from "../AppearanceProvider"
import { useElements } from "../ElementsProvider"
import { mergeProps } from "./utils"

export type ToggleProps = SwitchProps & {
    checked?: boolean
    onChange: ChangeEventHandler<HTMLInputElement>
    id?: string
    label?: ReactNode
    required?: boolean
    disabled?: boolean
    className?: string
    style?: CSSProperties
}

export type TogglePropsWithAppearance = {
    appearance?: ElementAppearance<ToggleProps>
} & ToggleProps

export const Toggle = forwardRef<HTMLInputElement, TogglePropsWithAppearance>((props, ref) => {
    const { elements } = useElements()
    const { appearance } = useAppearance()
    const { classes, styles, Override } = mergeProps<ToggleProps>({
        appearance: props.appearance,
        element: appearance.elements?.Toggle,
    })

    if (Override === null) {
        return null
    } else if (Override) {
        return (
            <Override
                id={props.id}
                label={props.label}
                required={props.required}
                disabled={props.disabled}
                checked={props.checked || false}
                onChange={props.onChange}
                className={classes}
                style={styles}
            />
        )
    }

    return (
        <elements.Toggle
            ref={ref}
            id={props.id}
            label={props.label}
            required={props.required}
            disabled={props.disabled}
            checked={props.checked}
            onChange={props.onChange}
            className={classes}
            style={styles}
        />
    )
})
