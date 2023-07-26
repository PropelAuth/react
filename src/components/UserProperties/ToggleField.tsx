import React from "react"
import { ElementAppearance } from "../../AppearanceProvider"
import { Checkbox, CheckboxProps } from "../../elements/Checkbox"
import { UserPropertyComponentPropsType } from "./UserPropertyFields"

export type ToggleFieldAppearance = {
    ToggleFieldInput?: ElementAppearance<CheckboxProps>
}

export type ToggleFieldProps<T> = UserPropertyComponentPropsType<T> & {
    appearance?: ToggleFieldAppearance
}

function ToggleField<T>({ propertySetting, form, appearance }: ToggleFieldProps<T>) {
    return (
        <Checkbox
            id={propertySetting.name}
            label={propertySetting.display_name}
            disabled={propertySetting.visibility !== "Public"}
            appearance={appearance?.ToggleFieldInput}
            {...form.getInputProps(propertySetting.name, { type: "checkbox" })}
        />
    )
}

export default ToggleField
