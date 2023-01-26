import React, { ReactNode } from "react"
import { ElementAppearance } from "../AppearanceProvider"
import { Divider, DividerProps } from "../elements/Divider"

export type OrDividerProps = {
    appearance?: ElementAppearance<DividerProps>
    options?: ReactNode | boolean
}

export const OrDivider = ({ appearance, options }: OrDividerProps) => {
    const innner = options === undefined ? "OR" : options === true ? null : options
    return <Divider appearance={appearance}>{innner}</Divider>
}
