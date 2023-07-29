import React from "react"
import { ElementAppearance } from "../../AppearanceProvider"
import { Checkbox, CheckboxProps } from "../../elements/Checkbox"
import { UserPropertyComponentPropsType } from "./UserPropertyFields"

export type CheckboxFieldAppearance = {
    CheckboxFieldInput?: ElementAppearance<CheckboxProps>
}

export type CheckboxFieldProps<T> = UserPropertyComponentPropsType<T> & {
    appearance?: CheckboxFieldAppearance
}

function CheckboxField<T>({ propertySetting, form, appearance }: CheckboxFieldProps<T>) {
    return (
        <Checkbox
            id={propertySetting.name}
            label={propertySetting.display_name}
            appearance={appearance?.CheckboxFieldInput}
            {...form.getInputProps(propertySetting.name, { type: "checkbox" })}
        />
    )
}

export default CheckboxField
