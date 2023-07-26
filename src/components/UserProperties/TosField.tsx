import React from "react"
import { ElementAppearance } from "../../AppearanceProvider"
import { Alert, AlertProps } from "../../elements/Alert"
import { Checkbox, CheckboxProps } from "../../elements/Checkbox"
import { Paragraph } from "../../elements/Paragraph"
import { UserPropertyComponentPropsType } from "./UserPropertyFields"

export type TosFieldAppearance = {
    TosFieldInput?: ElementAppearance<CheckboxProps>
    TosFieldError?: ElementAppearance<AlertProps>
}

export type TosFieldProps<T> = UserPropertyComponentPropsType<T> & {
    appearance?: TosFieldAppearance
}

function TosField<T>({ propertySetting, form, appearance }: TosFieldProps<T>) {
    const TermsPreview = () => {
        const tos_links = propertySetting.metadata.tos_links || []
        const links = tos_links.map(({ name, url }, index) => {
            let delimiter = ""
            if (tos_links.length > 1) {
                if (index === tos_links.length - 2) {
                    delimiter = " and "
                } else if (index < tos_links.length - 2) {
                    delimiter = ", "
                }
            }

            return (
                <span key={`previewURL_${index}`}>
                    <a href={url} target={"_blank"}>
                        {name}
                    </a>
                    {delimiter}
                </span>
            )
        })

        return (
            <Paragraph>
                {"I agree to the "} {links}
                {"."}
            </Paragraph>
        )
    }
    return (
        <div data-contains="tos" style={{ marginTop: "20px" }}>
            <Checkbox
                id={propertySetting.name}
                label={<TermsPreview />}
                appearance={appearance?.TosFieldInput}
                {...form.getInputProps(propertySetting.name, { type: "checkbox" })}
            />
            {form.errors["tos"] && (
                <Alert appearance={appearance?.TosFieldError} type={"error"}>
                    {form.errors["tos"]}
                </Alert>
            )}
        </div>
    )
}

export default TosField
