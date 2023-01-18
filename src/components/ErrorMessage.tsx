import React from "react"
import { ElementAppearance } from "../AppearanceProvider"
import { Alert, AlertProps } from "../elements/Alert"
import { Container, ContainerProps } from "../elements/Container"
import { UNEXPECTED_ERROR } from "./constants"

export type ErrorMessageAppearance = {
    elements?: {
        Container?: ElementAppearance<ContainerProps>
        Alert?: ElementAppearance<AlertProps>
    }
}

export type ErrorMessageProps = {
    errorMessage?: string
    appearance?: ErrorMessageAppearance
}

export const ErrorMessage = ({ errorMessage, appearance }: ErrorMessageProps) => {
    return (
        <div data-contain="component">
            <Container appearance={appearance?.elements?.Container}>
                <Alert type={"error"} appearance={appearance?.elements?.Alert}>
                    {errorMessage || UNEXPECTED_ERROR}
                </Alert>
            </Container>
        </div>
    )
}
