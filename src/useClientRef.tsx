import { createClient, IAuthClient } from "@propelauth/javascript"
import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react"

type ClientRef = {
    authUrl: string
    client: IAuthClient
}

export const useClientRef = (props: { authUrl: string }) => {
    const [accessTokenChangeCounter, setAccessTokenChangeCounter] = useState(0)

    // Use a ref to store the client so that it doesn't get recreated on every render
    const clientRef = useRef<ClientRef | null>(null)
    if (clientRef.current === null) {
        const client = createClient({ authUrl: props.authUrl, enableBackgroundTokenRefresh: true })
        client.addAccessTokenChangeObserver(() => setAccessTokenChangeCounter((x) => x + 1))
        clientRef.current = { authUrl: props.authUrl, client }
    }

    // If the authUrl changes, destroy the old client and create a new one
    useEffect(() => {
        if (clientRef.current === null) {
            return
        } else if (clientRef.current.authUrl === props.authUrl) {
            return
        } else {
            clientRef.current.client.destroy()

            const newClient = createClient({ authUrl: props.authUrl, enableBackgroundTokenRefresh: true })
            newClient.addAccessTokenChangeObserver(() => setAccessTokenChangeCounter((x) => x + 1))
            clientRef.current = { authUrl: props.authUrl, client: newClient }
        }
    }, [props.authUrl])

    return { clientRef, accessTokenChangeCounter }
}

export const useClientRefCallback = <I, O>(
    clientRef: MutableRefObject<ClientRef | null>,
    callback: (client: IAuthClient) => (input: I) => O
): ((input: I) => O) => {
    return useCallback(
        (input: I) => {
            const client = clientRef.current?.client
            if (!client) {
                throw new Error("Client is not initialized")
            }
            return callback(client)(input)
        },
        [callback]
    )
}

export const useClientRefNoArgCallback = <O,>(
    clientRef: MutableRefObject<ClientRef | null>,
    callback: (client: IAuthClient) => () => O
): (() => O) => {
    return useCallback(() => {
        const client = clientRef.current?.client
        if (!client) {
            throw new Error("Client is not initialized")
        }
        return callback(client)()
    }, [callback])
}
