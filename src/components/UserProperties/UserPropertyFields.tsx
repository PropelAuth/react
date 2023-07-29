import type { UseFormReturnType } from "@mantine/form"
import React from "react"
import CheckboxField, { CheckboxFieldAppearance } from "./CheckboxField"
import DateField, { DateFieldAppearance } from "./DateField"
import EnumField, { EnumFieldAppearance } from "./EnumField"
import IntegerField, { IntegerFieldAppearance } from "./IntegerField"
import LongTextField, { LongTextFieldAppearance } from "./LongTextField"
import NameField, { NameFieldAppearance } from "./NameField"
import TextField, { TextFieldAppearance } from "./TextField"
import ToggleField, { ToggleFieldAppearance } from "./ToggleField"
import TosField, { TosFieldAppearance } from "./TosField"
import UrlField, { UrlFieldAppearance } from "./UrlField"

export type UserPropertySettings = {
    fields: UserPropertySetting[]
}

export type UserPropertySetting = {
    is_user_facing: boolean
    user_writable: UserPropertyWritable
    show_in_account: boolean
    collect_on_signup: boolean
    collect_via_saml: boolean
    required: boolean
    required_by: number | undefined
    in_jwt: boolean
    name: string
    display_name: string
    field_type: UserPropertyFieldType
    metadata: UserPropertyMetadata
    is_enabled: boolean
}

export type UserPropertyMetadata = {
    tos_links?: UserPropertyToS[]
    enum_values?: string[]
}

export type UserPropertyToS = {
    name: string
    url: string
}

export type UserPropertyFieldType =
    | "Text"
    | "LongText"
    | "Integer"
    | "Date"
    | "Checkbox"
    | "Toggle"
    | "PhoneNumber"
    | "Enum"
    | "Url"
    | "Json"
    | "Name"
    | "PictureUrl"
    | "Tos"

export type UserPropertyWritable = "Write" | "WriteIfUnset" | "Read"

export type UserPropertyComponentPropsType<T> = {
    propertySetting: UserPropertySetting
    form: UseFormReturnType<T>
    placeholder?: string
}

type UserPropertyComponentType =
    | typeof TextField
    | typeof NameField
    | typeof EnumField
    | typeof LongTextField
    | typeof IntegerField
    | typeof DateField
    | typeof CheckboxField
    | typeof ToggleField
    | typeof UrlField
    | typeof TosField

type TypeToComponentMapType = {
    [key: string]: UserPropertyComponentType
}

const TypeToComponentMap: TypeToComponentMapType = {
    Name: NameField,
    Text: TextField,
    Enum: EnumField,
    LongText: LongTextField,
    Integer: IntegerField,
    Date: DateField,
    Checkbox: CheckboxField,
    Toggle: ToggleField,
    Url: UrlField,
    Tos: TosField,
}

type UserPropertiesFieldsType<T> = {
    propertySettings: UserPropertySetting[]
    form: UseFormReturnType<T>
}

type UserPropertyFieldAppearance =
    | NameFieldAppearance
    | TextFieldAppearance
    | EnumFieldAppearance
    | LongTextFieldAppearance
    | IntegerFieldAppearance
    | DateFieldAppearance
    | CheckboxFieldAppearance
    | ToggleFieldAppearance
    | UrlFieldAppearance
    | TosFieldAppearance

export type UserPropertyFieldsAppearance = {
    [key: string]: UserPropertyFieldAppearance
}

type UserPropertyFieldsProps<T> = UserPropertiesFieldsType<T> & { appearance?: UserPropertyFieldsAppearance }

type TypeToAppearanceKeyMapType = {
    [key: string]: string
}

const TypeToAppearanceKeyMap: TypeToAppearanceKeyMapType = {
    Name: "NameField",
    Text: "TextField",
    Enum: "EnumField",
    LongText: "LongTextField",
    Integer: "IntegerField",
    Date: "DateField",
    Checkbox: "CheckboxField",
    Toggle: "ToggleField",
    Url: "UrlField",
    Tos: "TosField",
}

function UserPropertyFields<T>({ propertySettings, form, appearance }: UserPropertyFieldsProps<T>) {
    return (
        <div>
            {propertySettings.map((propertySetting) => {
                const Component = TypeToComponentMap[propertySetting.field_type]
                const componentAppearance = TypeToAppearanceKeyMap[propertySetting.field_type]
                return (
                    <Component
                        key={propertySetting.name}
                        propertySetting={propertySetting}
                        form={form}
                        appearance={appearance?.[componentAppearance]}
                    />
                )
            })}
        </div>
    )
}

export default UserPropertyFields
