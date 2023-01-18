import { PropelAuthFeV2 } from "@propel-auth-fern/fe_v2-client"
import React, { useEffect } from "react"
import { useLoginState } from "../useLoginState"
import ConfirmEmail, { ConfirmEmailAppearance } from "./ConfirmEmail"
import CreateOrg, { CreateOrgAppearance } from "./CreateOrg"
import { ErrorMessage } from "./ErrorMessage"
import { Loading } from "./Loading"
import Login, { LoginAppearance } from "./Login"
import UpdatePassword, { UpdatePasswordAppearance } from "./UpdatePassword"
import UserMetadata, { UserMetadataAppearance } from "./UserMetadata"
import Verify, { VerifyAppearance } from "./Verify"

export type LoginManagerProps = {
    onFinish: VoidFunction
    loginAppearance: LoginAppearance
    confirmEmailAppearance: ConfirmEmailAppearance
    verifyAppearance: VerifyAppearance
    userMetadataAppearance: UserMetadataAppearance
    updatePasswordAppearance: UpdatePasswordAppearance
    createOrgAppearance: CreateOrgAppearance
}

const LoginManager = ({
    onFinish,
    loginAppearance,
    confirmEmailAppearance,
    verifyAppearance,
    userMetadataAppearance,
    updatePasswordAppearance,
    createOrgAppearance,
}: LoginManagerProps) => {
    const { loginStateLoading, loginStateError, loginState, getLoginState } = useLoginState()

    useEffect(() => {
        if (loginState === PropelAuthFeV2.LoginStateEnum.Finished) {
            onFinish()
        }
    }, [loginState, onFinish])

    if (loginStateLoading) {
        return <Loading appearance={loginAppearance} />
    } else if (loginStateError) {
        return <ErrorMessage errorMessage={loginStateError} appearance={loginAppearance} />
    }

    switch (loginState) {
        case PropelAuthFeV2.LoginStateEnum.LoginRequired:
            return <Login onStepCompleted={() => getLoginState()} appearance={loginAppearance} />

        case PropelAuthFeV2.LoginStateEnum.ConfirmEmailRequired:
            return <ConfirmEmail appearance={confirmEmailAppearance} />

        case PropelAuthFeV2.LoginStateEnum.TwoFactorRequired:
            return <Verify onStepCompleted={() => getLoginState()} appearance={verifyAppearance} />

        case PropelAuthFeV2.LoginStateEnum.UserMetadataRequired:
            return <UserMetadata onStepCompleted={() => getLoginState()} appearance={userMetadataAppearance} />

        case PropelAuthFeV2.LoginStateEnum.UpdatePasswordRequired:
            return <UpdatePassword onStepCompleted={() => getLoginState()} appearance={updatePasswordAppearance} />

        case PropelAuthFeV2.LoginStateEnum.OrgCreationRequired:
            return <CreateOrg onOrgCreated={() => getLoginState()} appearance={createOrgAppearance} />

        default:
            return <Loading appearance={loginAppearance} />
    }
}

export default LoginManager
