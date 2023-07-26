import React from "react"
import { ElementAppearance } from "../../AppearanceProvider"
import { Alert, AlertProps } from "../../elements/Alert"
import { Label, LabelProps } from "../../elements/Label"
import { Option, Select, SelectProps } from "../../elements/Select"
import { UserPropertyComponentPropsType } from "./UserPropertyFields"

export type EnumFieldAppearance = {
    EnumFieldLabel?: ElementAppearance<LabelProps>
    EnumFieldInput?: ElementAppearance<SelectProps>
    EnumFieldError?: ElementAppearance<AlertProps>
}

export type EnumFieldProps<T> = UserPropertyComponentPropsType<T> & {
    appearance?: EnumFieldAppearance
}

function EnumField<T>({ propertySetting, form, appearance }: EnumFieldProps<T>) {
    // TODO: find a better way to select default options
    const options = [
        { label: "Select an option", value: "" },
        ...[
            propertySetting.metadata?.enum_values?.map((value) => ({
                label: value,
                value,
            })),
        ],
    ]

    return (
        <div>
            <Label htmlFor={propertySetting.name} appearance={appearance?.EnumFieldLabel}>
                {propertySetting.display_name}
            </Label>
            <Select
                id={propertySetting.name}
                appearance={appearance?.EnumFieldInput}
                options={options.flatMap((option) => option) as Option[]}
                {...form.getInputProps(propertySetting.name)}
            />
            {form.errors[propertySetting.name] && (
                <Alert appearance={appearance?.EnumFieldError} type={"error"}>
                    {form.errors[propertySetting.name]}
                </Alert>
            )}
        </div>
    )
}

export default EnumField
