import { PropelAuthFeV2 } from "@propel-auth-fern/fe_v2-client"
import React, { useEffect } from "react"
import { useLoginState } from "../useLoginState"
import CompleteAccount, { CompleteAccountAppearance } from "./CompleteAccount"
import ConfirmEmail, { ConfirmEmailAppearance } from "./ConfirmEmail"
import CreateOrg, { CreateOrgAppearance } from "./CreateOrg"
import { ErrorMessage } from "./ErrorMessage"
import { Loading } from "./Loading"
import Login, { LoginAppearance } from "./Login"
import UpdatePassword, { UpdatePasswordAppearance } from "./UpdatePassword"
import VerifyMfa, { VerifyMfaAppearance } from "./VerifyMfa"

export type LoginManagerProps = {
    onLoginCompleted: VoidFunction
    onRedirectToSignup?: VoidFunction
    onRedirectToForgotPassword?: VoidFunction
    onRedirectToPasswordlessLogin?: VoidFunction
    loginAppearance?: LoginAppearance
    confirmEmailAppearance?: ConfirmEmailAppearance
    verifyMfaAppearance?: VerifyMfaAppearance
    completeAccountAppearance?: CompleteAccountAppearance
    updatePasswordAppearance?: UpdatePasswordAppearance
    createOrgAppearance?: CreateOrgAppearance
    overrideCurrentScreenForTesting?: PropelAuthFeV2.LoginStateEnum
}

const LoginManager = ({
    onLoginCompleted,
    onRedirectToSignup,
    onRedirectToForgotPassword,
    onRedirectToPasswordlessLogin,
    loginAppearance,
    confirmEmailAppearance,
    verifyMfaAppearance,
    completeAccountAppearance,
    updatePasswordAppearance,
    createOrgAppearance,
    overrideCurrentScreenForTesting,
}: LoginManagerProps) => {
    const { loginStateLoading, loginStateError, loginState, getLoginState } = useLoginState()

    useEffect(() => {
        if (loginState === PropelAuthFeV2.LoginStateEnum.Finished) {
            onLoginCompleted()
        }
    }, [loginState, onLoginCompleted])

    if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
        if (overrideCurrentScreenForTesting) {
            switch (overrideCurrentScreenForTesting) {
                case PropelAuthFeV2.LoginStateEnum.LoginRequired:
                    return (
                        <Login
                            onStepCompleted={() => getLoginState()}
                            onRedirectToSignup={onRedirectToSignup}
                            onRedirectToForgotPassword={onRedirectToForgotPassword}
                            onRedirectToPasswordlessLogin={onRedirectToPasswordlessLogin}
                            appearance={loginAppearance}
                        />
                    )
                case PropelAuthFeV2.LoginStateEnum.ConfirmEmailRequired:
                    return <ConfirmEmail appearance={confirmEmailAppearance} />
                case PropelAuthFeV2.LoginStateEnum.TwoFactorRequired:
                    return <VerifyMfa onStepCompleted={() => getLoginState()} appearance={verifyMfaAppearance} />
                case PropelAuthFeV2.LoginStateEnum.UserMetadataRequired:
                    return (
                        <CompleteAccount
                            onStepCompleted={() => getLoginState()}
                            appearance={completeAccountAppearance}
                        />
                    )
                case PropelAuthFeV2.LoginStateEnum.UpdatePasswordRequired:
                    return (
                        <UpdatePassword onStepCompleted={() => getLoginState()} appearance={updatePasswordAppearance} />
                    )
                case PropelAuthFeV2.LoginStateEnum.OrgCreationRequired:
                    return <CreateOrg onOrgCreatedOrJoined={() => getLoginState()} appearance={createOrgAppearance} />
                default:
                    return <Loading appearance={loginAppearance} />
            }
        }
    }

    if (loginStateLoading) {
        return <Loading appearance={loginAppearance} />
    } else if (loginStateError) {
        return <ErrorMessage errorMessage={loginStateError} appearance={loginAppearance} />
    }

    switch (loginState) {
        case PropelAuthFeV2.LoginStateEnum.LoginRequired:
            return (
                <Login
                    onStepCompleted={() => getLoginState()}
                    onRedirectToSignup={onRedirectToSignup}
                    onRedirectToForgotPassword={onRedirectToForgotPassword}
                    onRedirectToPasswordlessLogin={onRedirectToPasswordlessLogin}
                    appearance={loginAppearance}
                />
            )
        case PropelAuthFeV2.LoginStateEnum.ConfirmEmailRequired:
            return <ConfirmEmail appearance={confirmEmailAppearance} />
        case PropelAuthFeV2.LoginStateEnum.TwoFactorRequired:
            return <VerifyMfa onStepCompleted={() => getLoginState()} appearance={verifyMfaAppearance} />
        case PropelAuthFeV2.LoginStateEnum.UserMetadataRequired:
            return <CompleteAccount onStepCompleted={() => getLoginState()} appearance={completeAccountAppearance} />
        case PropelAuthFeV2.LoginStateEnum.UpdatePasswordRequired:
            return <UpdatePassword onStepCompleted={() => getLoginState()} appearance={updatePasswordAppearance} />
        case PropelAuthFeV2.LoginStateEnum.OrgCreationRequired:
            return <CreateOrg onOrgCreatedOrJoined={() => getLoginState()} appearance={createOrgAppearance} />
        default:
            return <Loading appearance={loginAppearance} />
    }
}

export default LoginManager
