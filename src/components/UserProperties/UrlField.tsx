import React from "react"
import { ElementAppearance } from "../../AppearanceProvider"
import { Alert, AlertProps } from "../../elements/Alert"
import { Input, InputProps } from "../../elements/Input"
import { Label, LabelProps } from "../../elements/Label"
import { UserPropertyComponentPropsType } from "./UserPropertyFields"

export type UrlFieldAppearance = {
    UrlFieldLabel?: ElementAppearance<LabelProps>
    UrlFieldInput?: ElementAppearance<InputProps>
    UrlFieldError?: ElementAppearance<AlertProps>
}

export type UrlFieldProps<T> = UserPropertyComponentPropsType<T> & {
    appearance?: UrlFieldAppearance
}

function UrlField<T>({ propertySetting, form, appearance }: UrlFieldProps<T>) {
    return (
        <div>
            <Label htmlFor={propertySetting.name} appearance={appearance?.UrlFieldLabel}>
                {propertySetting.display_name}
            </Label>
            <Input
                type="url"
                id={propertySetting.name}
                placeholder={"https://example.com"}
                appearance={appearance?.UrlFieldInput}
                {...form.getInputProps(propertySetting.name)}
            />
            {form.errors[propertySetting.name] && (
                <Alert appearance={appearance?.UrlFieldError} type={"error"}>
                    {form.errors[propertySetting.name]}
                </Alert>
            )}
        </div>
    )
}

export default UrlField
