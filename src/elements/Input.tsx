import React, { ChangeEventHandler, CSSProperties, forwardRef } from "react"
import { ElementAppearance, useAppearance } from "../AppearanceProvider"
import { useElements } from "../ElementsProvider"
import { mergeProps } from "./utils"

export type InputProps = {
    value: string
    onChange?: ChangeEventHandler<HTMLInputElement>
    id?: string
    type?: string
    required?: boolean
    disabled?: boolean
    readOnly?: boolean
    placeholder?: string
    className?: string
    style?: CSSProperties
}

export type InputPropsWithAppearance = {
    appearance?: ElementAppearance<InputProps>
} & InputProps

export const Input = forwardRef<HTMLInputElement, InputPropsWithAppearance>((props, ref) => {
    const { elements } = useElements()
    const { appearance } = useAppearance()
    const { classes, styles, Override } = mergeProps<InputProps>({
        appearance: props.appearance,
        element: appearance.elements?.Input,
    })

    if (Override === null) {
        return null
    } else if (Override) {
        return (
            <Override
                id={props.id}
                type={props.type}
                required={props.required}
                disabled={props.disabled}
                value={props.value}
                placeholder={props.placeholder}
                onChange={props.onChange}
                className={classes}
                style={styles}
            />
        )
    }

    return (
        <elements.Input
            ref={ref}
            id={props.id}
            type={props.type}
            required={props.required}
            disabled={props.disabled}
            value={props.value}
            placeholder={props.placeholder}
            onChange={props.onChange}
            className={classes}
            style={styles}
        />
    )
})
