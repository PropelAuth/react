import React from "react"
import { ElementAppearance } from "../../AppearanceProvider"
import { Alert, AlertProps } from "../../elements/Alert"
import { Input, InputProps } from "../../elements/Input"
import { Label, LabelProps } from "../../elements/Label"
import { UserPropertyComponentPropsType } from "./UserPropertyFields"

export type NameFieldAppearance = {
    firstName?: {
        NameFieldLabel?: ElementAppearance<LabelProps>
        NameFieldInput?: ElementAppearance<InputProps>
        NameFieldError?: ElementAppearance<AlertProps>
    }
    lastName?: {
        NameFieldLabel?: ElementAppearance<LabelProps>
        NameFieldInput?: ElementAppearance<InputProps>
        NameFieldError?: ElementAppearance<AlertProps>
    }
}

export type NameFieldProps<T> = UserPropertyComponentPropsType<T> & {
    appearance?: NameFieldAppearance
}

function NameField<T>({ form, appearance }: NameFieldProps<T>) {
    return (
        <div data-contain="name_fields">
            <div>
                <Label htmlFor="first_name" appearance={appearance?.firstName?.NameFieldLabel}>
                    {`First name`}
                </Label>
                <Input
                    id="first_name"
                    type="text"
                    placeholder={appearance?.firstName?.NameFieldLabel === null ? "First Name" : undefined}
                    appearance={appearance?.firstName?.NameFieldInput}
                    {...form.getInputProps("first_name")}
                />
                {form.errors["first_name"] && (
                    <Alert appearance={appearance?.firstName?.NameFieldError} type={"error"}>
                        {form.errors["first_name"]}
                    </Alert>
                )}
            </div>
            <div>
                <Label htmlFor="last_name" appearance={appearance?.lastName?.NameFieldLabel}>
                    {`Last name`}
                </Label>
                <Input
                    id="last_name"
                    type="text"
                    placeholder={appearance?.lastName?.NameFieldLabel === null ? "Last Name" : undefined}
                    appearance={appearance?.lastName?.NameFieldInput}
                    {...form.getInputProps("last_name")}
                />
                {form.errors["last_name"] && (
                    <Alert appearance={appearance?.lastName?.NameFieldError} type={"error"}>
                        {form.errors["last_name"]}
                    </Alert>
                )}
            </div>
        </div>
    )
}

export default NameField
