import React, { ChangeEventHandler, CSSProperties, forwardRef } from "react"
import { ElementAppearance, useAppearance } from "../AppearanceProvider"
import { useElements } from "../ElementsProvider"
import { mergeProps } from "./utils"

export type TextAreaProps = {
    value: string
    onChange?: ChangeEventHandler<HTMLTextAreaElement>
    id?: string
    type?: string
    required?: boolean
    disabled?: boolean
    readOnly?: boolean
    placeholder?: string
    className?: string
    style?: CSSProperties
    resizable?: boolean
    wraps?: boolean
}

export type TextAreaPropsWithAppearance = {
    appearance?: ElementAppearance<TextAreaProps>
} & TextAreaProps

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaPropsWithAppearance>((props, ref) => {
    const { elements } = useElements()
    const { appearance } = useAppearance()
    const { classes, styles, Override } = mergeProps<TextAreaProps>({
        appearance: props.appearance,
        element: appearance.elements?.TextArea,
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
                resizable={props.resizable}
                wraps={props.wraps}
            />
        )
    }

    return (
        <elements.TextArea
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
            resizable={props.resizable}
            wraps={props.wraps}
        />
    )
})
