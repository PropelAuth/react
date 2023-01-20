import React, { ChangeEventHandler, CSSProperties, forwardRef, ReactNode } from "react"
import { ElementAppearance, useAppearance } from "../AppearanceProvider"
import { useElements } from "../ElementsProvider"
import { mergeProps } from "./utils"

export type CheckboxProps = {
    checked: boolean
    onChange: ChangeEventHandler<HTMLInputElement>
    id?: string
    label?: ReactNode
    required?: boolean
    disabled?: boolean
    className?: string
    style?: CSSProperties
}

export type CheckboxPropsWithAppearance = {
    appearance?: ElementAppearance<CheckboxProps>
} & CheckboxProps

export const Checkbox = forwardRef<HTMLInputElement, CheckboxPropsWithAppearance>((props, ref) => {
    const { elements } = useElements()
    const { appearance } = useAppearance()
    const { classes, styles, Override } = mergeProps<CheckboxProps>({
        appearance: props.appearance,
        element: appearance.elements?.Checkbox,
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
                checked={props.checked}
                onChange={props.onChange}
                className={classes}
                style={styles}
            />
        )
    }

    return (
        <elements.Checkbox
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
