import React, { ReactNode } from "react"
import { ElementAppearance } from "../AppearanceProvider"
import { Container, ContainerProps } from "../elements/Container"
import { H3, H3Props } from "../elements/H3"
import { Image, ImageProps } from "../elements/Image"
import { Paragraph, ParagraphProps } from "../elements/Paragraph"
import { withConfig, WithConfigProps } from "../withConfig"
import { CONFIRM_EMAIL_MESSAGE } from "./constants"

export type ConfirmEmailAppearance = {
    options?: {
        displayLogo?: boolean
        headerContent?: ReactNode
        textContent?: ReactNode
    }
    elements?: {
        Container?: ElementAppearance<ContainerProps>
        Logo?: ElementAppearance<ImageProps>
        Header?: ElementAppearance<H3Props>
        Text?: ElementAppearance<ParagraphProps>
    }
}
type ConfirmEmailProps = {
    appearance?: ConfirmEmailAppearance
} & WithConfigProps

const ConfirmEmail = ({ appearance, config }: ConfirmEmailProps) => {
    return (
        <div data-contain="component">
            <Container appearance={appearance?.elements?.Container}>
                {appearance?.options?.displayLogo && config && (
                    <div data-contain="logo">
                        <Image
                            src={config.logoUrl}
                            alt={config.siteDisplayName}
                            appearance={appearance?.elements?.Logo}
                        />
                    </div>
                )}
                <div data-contain="header">
                    <H3 appearance={appearance?.elements?.Header}>
                        {appearance?.options?.headerContent || "Confirm your email"}
                    </H3>
                </div>
                <div data-contain="text">
                    <Paragraph appearance={appearance?.elements?.Text}>
                        {appearance?.options?.textContent || `${CONFIRM_EMAIL_MESSAGE}`}
                    </Paragraph>
                </div>
            </Container>
        </div>
    )
}

export default withConfig(ConfirmEmail)
