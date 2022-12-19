import React, { CSSProperties, forwardRef, ReactNode } from "react"
import { ElementAppearance, useAppearance } from "../AppearanceProvider"
import { useElements } from "../ElementsProvider"
import { mergeProps } from "./utils"

export type Column = ReactNode

export type Row = {
    [key: string]: ReactNode
}

export type TableProps = {
    columns: Column[]
    rows?: Row[]
    className?: string
    style?: CSSProperties
}

export type TablePropsWithAppearance = {
    appearance?: ElementAppearance<TableProps>
} & TableProps

export const Table = forwardRef<HTMLTableElement, TablePropsWithAppearance>((props, ref) => {
    const { elements } = useElements()
    const { appearance } = useAppearance()
    const { classes, styles, Override } = mergeProps<TableProps>({
        appearance: props.appearance,
        element: appearance.elements?.Table,
    })

    if (Override) {
        return <Override columns={props.columns} rows={props.rows} className={classes} style={styles} />
    }

    return <elements.Table ref={ref} columns={props.columns} rows={props.rows} className={classes} style={styles} />
})
