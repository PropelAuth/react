import React from "react"
import { Mfa, MfaAppearance } from "./Mfa"
import { ProfilePicture, ProfilePictureAppearance } from "./ProfilePicture"
import { UpdateProfile, UpdateProfileAppearance } from "./UpdateProfile"

export type ManageAccountProps = {
    profilePictureAppearance?: ProfilePictureAppearance
    updateProfileAppearance?: UpdateProfileAppearance
    mfaAppearance?: MfaAppearance
}

export const ManageAccount = ({
    profilePictureAppearance,
    updateProfileAppearance,
    mfaAppearance,
}: ManageAccountProps) => {
    return (
        <div data-contain="components">
            <ProfilePicture appearance={profilePictureAppearance} />
            <UpdateProfile appearance={updateProfileAppearance} />
            <Mfa appearance={mfaAppearance} />
        </div>
    )
}
