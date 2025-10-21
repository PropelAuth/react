import { createClient, IAuthClient } from "@propelauth/javascript"
import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react"

type ClientRef = {
    authUrl: string
    client: IAuthClient
}

interface UseClientRefProps {
    authUrl: string
    minSecondsBeforeRefresh?: number
}

export const useClientRef = (props: UseClientRefProps) => {
    const [accessTokenChangeCounter, setAccessTokenChangeCounter] = useState(0)
    const { authUrl, minSecondsBeforeRefresh } = props

    // Use a ref to store the client so that it doesn't get recreated on every render
    const clientRef = useRef<ClientRef | null>(null)
    if (clientRef.current === null) {
        const client = createClient({ authUrl, enableBackgroundTokenRefresh: true, minSecondsBeforeRefresh, skipInitialFetch: true })
        client.addAccessTokenChangeObserver(() => setAccessTokenChangeCounter((x) => x + 1))
        clientRef.current = { authUrl, client }
    }

    // If the authUrl changes, destroy the old client and create a new one
    useEffect(() => {
        if (clientRef.current === null) {
            return
        } else if (clientRef.current.authUrl === authUrl) {
            return
        } else {
            clientRef.current.client.destroy()

            const newClient = createClient({ authUrl, enableBackgroundTokenRefresh: true, minSecondsBeforeRefresh, skipInitialFetch: true })
            newClient.addAccessTokenChangeObserver(() => setAccessTokenChangeCounter((x) => x + 1))
            clientRef.current = { authUrl, client: newClient }
        }
    }, [authUrl])

    return { clientRef, accessTokenChangeCounter }
}

export const useClientRefCallback = <I extends unknown[], O>(
    clientRef: MutableRefObject<ClientRef | null>,
    callback: (client: IAuthClient) => (...inputs: I) => O
): ((...inputs: I) => O) => {
    return useCallback(
        (...inputs: I) => {
            const client = clientRef.current?.client
            if (!client) {
                throw new Error("Client is not initialized")
            }
            return callback(client)(...inputs)
        },
        [callback]
    )
}
