import React from "react"
import { ElementAppearance } from "../../AppearanceProvider"
import { Alert, AlertProps } from "../../elements/Alert"
import { Input, InputProps } from "../../elements/Input"
import { Label, LabelProps } from "../../elements/Label"
import { UserPropertyComponentPropsType } from "./UserPropertyFields"

export type IntegerFieldAppearance = {
    IntegerFieldLabel?: ElementAppearance<LabelProps>
    IntegerFieldInput?: ElementAppearance<InputProps>
    IntegerFieldError?: ElementAppearance<AlertProps>
}

export type IntegerFieldProps<T> = UserPropertyComponentPropsType<T> & {
    appearance?: IntegerFieldAppearance
}

function IntegerField<T>({ propertySetting, form, appearance }: IntegerFieldProps<T>) {
    return (
        <div>
            <Label htmlFor={propertySetting.name} appearance={appearance?.IntegerFieldLabel}>
                {propertySetting.display_name}
            </Label>
            <Input
                required={propertySetting.required_on_signup}
                type="number"
                id={propertySetting.name}
                placeholder={appearance?.IntegerFieldLabel === null ? propertySetting.display_name : undefined}
                appearance={appearance?.IntegerFieldInput}
                {...form.getInputProps(propertySetting.name)}
            />
            {form.errors[propertySetting.name] && (
                <Alert appearance={appearance?.IntegerFieldError} type={"error"}>
                    {form.errors[propertySetting.name]}
                </Alert>
            )}
        </div>
    )
}

export default IntegerField
