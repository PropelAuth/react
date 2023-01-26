import React, { ChangeEventHandler, CSSProperties, forwardRef } from "react"
import { ElementAppearance, useAppearance } from "../AppearanceProvider"
import { useElements } from "../ElementsProvider"
import { mergeProps } from "./utils"

export type Option = {
    label: string
    value: string
}

export type OptionGroup = {
    label: string
    options: Array<Option>
}

export type SelectProps = {
    value: string
    onChange: ChangeEventHandler<HTMLSelectElement>
    options?: Array<OptionGroup | Option>
    disabled?: boolean
    id?: string
    className?: string
    style?: CSSProperties
}

export type SelectPropsWithAppearance = {
    appearance?: ElementAppearance<SelectProps>
} & SelectProps

export const Select = forwardRef<HTMLSelectElement, SelectPropsWithAppearance>((props, ref) => {
    const { elements } = useElements()
    const { appearance } = useAppearance()
    const { classes, styles, Override } = mergeProps<SelectProps>({
        appearance: props.appearance,
        element: appearance.elements?.Select,
    })

    if (Override === null) {
        return null
    } else if (Override) {
        return (
            <Override
                value={props.value}
                onChange={props.onChange}
                options={props.options}
                disabled={props.disabled}
                id={props.id}
                className={classes}
                style={styles}
            />
        )
    }

    return (
        <elements.Select
            ref={ref}
            value={props.value}
            onChange={props.onChange}
            options={props.options}
            disabled={props.disabled}
            id={props.id}
            className={classes}
            style={styles}
        />
    )
})
