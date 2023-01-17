import React from "react"
import { ElementAppearance } from "../AppearanceProvider"
import { Alert, AlertProps } from "../elements/Alert"
import { Container, ContainerProps } from "../elements/Container"
import { UNEXPECTED_ERROR } from "./constants"

export type UnexpectedErrorAppearance = {
    elements?: {
        Container?: ElementAppearance<ContainerProps>
        Alert?: ElementAppearance<AlertProps>
    }
}

export type UnexpectedErrorProps = {
    appearance?: UnexpectedErrorAppearance
}

export const UnexpectedError = ({ appearance }: UnexpectedErrorProps) => {
    return (
        <div data-contain="component">
            <Container appearance={appearance?.elements?.Container}>
                <Alert type={"error"} appearance={appearance?.elements?.Alert}>
                    {UNEXPECTED_ERROR}
                </Alert>
            </Container>
        </div>
    )
}
