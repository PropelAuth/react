import React from "react"
import { ElementAppearance } from "../../AppearanceProvider"
import { Alert, AlertProps } from "../../elements/Alert"
import { Input, InputProps } from "../../elements/Input"
import { Label, LabelProps } from "../../elements/Label"
import { UserPropertyComponentPropsType } from "./UserPropertyFields"

export type DateFieldAppearance = {
    DateFieldLabel?: ElementAppearance<LabelProps>
    DateFieldInput?: ElementAppearance<InputProps>
    DateFieldError?: ElementAppearance<AlertProps>
}

export type DateFieldProps<T> = UserPropertyComponentPropsType<T> & {
    appearance?: DateFieldAppearance
}

function DateField<T>({ propertySetting, form, appearance }: DateFieldProps<T>) {
    return (
        <div>
            <Label htmlFor={propertySetting.name} appearance={appearance?.DateFieldLabel}>
                {propertySetting.display_name}
            </Label>
            <Input
                required={propertySetting.required_on_signup}
                type="date"
                id={propertySetting.name}
                placeholder={propertySetting.display_name}
                appearance={appearance?.DateFieldInput}
                {...form.getInputProps(propertySetting.name)}
            />
            {form.errors[propertySetting.name] && (
                <Alert appearance={appearance?.DateFieldError} type={"error"}>
                    {form.errors[propertySetting.name]}
                </Alert>
            )}
        </div>
    )
}

export default DateField
