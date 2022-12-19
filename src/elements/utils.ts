import { CSSProperties } from "react"
import { Element, ElementAppearance } from "../AppearanceProvider"

export type PropsFromAppearance<T> = {
    classes?: string
    styles?: CSSProperties
    Element?: Element<T>
}

export function getPropsFromAppearance<T>(appearance: ElementAppearance<T> | undefined): PropsFromAppearance<T> {
    switch (typeof appearance) {
        case "string":
            return { classes: appearance, styles: undefined, Element: undefined }
        case "object":
            return { classes: undefined, styles: appearance, Element: undefined }
        case "function":
            return { classes: undefined, styles: undefined, Element: appearance }
        default:
            return { classes: undefined, styles: undefined, Element: undefined }
    }
}

export function joinClasses(x?: string, y?: string): string | undefined {
    if (!x && !y) {
        return undefined
    }

    if (!x) {
        return y
    }

    if (!y) {
        return x
    }

    return x + " " + y
}

export function joinStyles(x?: CSSProperties, y?: CSSProperties): CSSProperties | undefined {
    if (!x && !y) {
        return undefined
    }

    if (!x) {
        return y
    }

    if (!y) {
        return x
    }

    return {
        ...x,
        ...y,
    }
}

export type MergeProps<T> = {
    appearance?: ElementAppearance<T>
    element?: ElementAppearance<T>
}

export function mergeProps<T>({ appearance, element }: MergeProps<T>) {
    const globalProps = getPropsFromAppearance(element)
    const localProps = getPropsFromAppearance(appearance)
    const classes = joinClasses(globalProps.classes, localProps.classes)
    const styles = joinStyles(globalProps.styles, localProps.styles)
    const Override = localProps.Element || globalProps.Element
    return { classes, styles, Override }
}
