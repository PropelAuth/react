import React from "react"
import { ElementAppearance } from "../../AppearanceProvider"
import { Alert, AlertProps } from "../../elements/Alert"
import { Label, LabelProps } from "../../elements/Label"
import { TextArea, TextAreaProps } from "../../elements/TextArea"
import { UserPropertyComponentPropsType } from "./UserPropertyFields"

export type LongTextFieldAppearance = {
    LongTextFieldLabel?: ElementAppearance<LabelProps>
    LongTextFieldInput?: ElementAppearance<TextAreaProps>
    LongTextFieldError?: ElementAppearance<AlertProps>
}

export type LongTextFieldProps<T> = UserPropertyComponentPropsType<T> & {
    appearance?: LongTextFieldAppearance
}

function LongTextField<T>({ propertySetting, form, appearance }: LongTextFieldProps<T>) {
    return (
        <div>
            <Label htmlFor={propertySetting.name} appearance={appearance?.LongTextFieldLabel}>
                {propertySetting.display_name}
            </Label>
            <TextArea
                required={propertySetting.required_on_signup}
                type="text"
                id={propertySetting.name}
                placeholder={appearance?.LongTextFieldLabel === null ? propertySetting.display_name : undefined}
                appearance={appearance?.LongTextFieldInput}
                resizable
                wraps
                {...form.getInputProps(propertySetting.name)}
            />
            {form.errors[propertySetting.name] && (
                <Alert appearance={appearance?.LongTextFieldError} type={"error"}>
                    {form.errors[propertySetting.name]}
                </Alert>
            )}
        </div>
    )
}

export default LongTextField
