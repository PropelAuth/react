import React from "react"
import { ElementAppearance } from "../../AppearanceProvider"
import { Alert, AlertProps } from "../../elements/Alert"
import { Input, InputProps } from "../../elements/Input"
import { Label, LabelProps } from "../../elements/Label"
import { UserPropertyComponentPropsType } from "./UserPropertyFields"

export type TextFieldAppearance = {
    TextFieldLabel?: ElementAppearance<LabelProps>
    TextFieldInput?: ElementAppearance<InputProps>
    TextFieldError?: ElementAppearance<AlertProps>
}

export type TextFieldProps<T> = UserPropertyComponentPropsType<T> & {
    appearance?: TextFieldAppearance
}

function TextField<T>({ propertySetting, form, appearance }: TextFieldProps<T>) {
    return (
        <div>
            <Label htmlFor={propertySetting.name} appearance={appearance?.TextFieldLabel}>
                {propertySetting.display_name}
            </Label>
            <Input
                type="text"
                id={propertySetting.name}
                placeholder={appearance?.TextFieldLabel === null ? propertySetting.display_name : undefined}
                appearance={appearance?.TextFieldInput}
                {...form.getInputProps(propertySetting.name)}
            />
            {form.errors[propertySetting.name] && (
                <Alert appearance={appearance?.TextFieldError} type={"error"}>
                    {form.errors[propertySetting.name]}
                </Alert>
            )}
        </div>
    )
}

export default TextField
