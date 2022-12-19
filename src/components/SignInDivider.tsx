import React, { ReactNode } from "react"
import { ElementAppearance } from "../AppearanceProvider"
import { Divider, DividerProps } from "../elements/Divider"

export type SignInDividerProps = {
    appearance?: ElementAppearance<DividerProps>
    options?: ReactNode | boolean
}

export const SignInDivider = ({ appearance, options }: SignInDividerProps) => {
    const innner = options === undefined ? "OR" : options === true ? null : options
    return <Divider appearance={appearance}>{innner}</Divider>
}
