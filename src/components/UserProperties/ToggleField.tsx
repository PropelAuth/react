import React from "react"
import { ElementAppearance } from "../../AppearanceProvider"
import { Toggle, ToggleProps } from "../../elements/Toggle"
import { UserPropertyComponentPropsType } from "./UserPropertyFields"

export type ToggleFieldAppearance = {
    ToggleFieldInput?: ElementAppearance<ToggleProps>
}

export type ToggleFieldProps<T> = UserPropertyComponentPropsType<T> & {
    appearance?: ToggleFieldAppearance
}

function ToggleField<T>({ propertySetting, form, appearance }: ToggleFieldProps<T>) {
    return (
        <Toggle
            id={propertySetting.name}
            label={propertySetting.display_name}
            disabled={propertySetting.visibility !== "Public"}
            appearance={appearance?.ToggleFieldInput}
            {...form.getInputProps(propertySetting.name, { type: "checkbox" })}
        />
    )
}

export default ToggleField
