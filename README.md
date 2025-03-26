<p align="center">
  <a href="https://www.propelauth.com?ref=github" target="_blank" align="center">
    <img src="https://www.propelauth.com/imgs/lockup.svg" width="200">
  </a>
</p>

# PropelAuth React Library

A React library for managing authentication in the browser, backed by [PropelAuth](https://www.propelauth.com?ref=github). 

[PropelAuth](https://www.propelauth.com?ref=github) makes it easy to add authentication and authorization to your B2B/multi-tenant application.

Your frontend gets a beautiful, safe, and customizable login screen. Your backend gets easy authorization with just a few lines of code. You get an easy-to-use dashboard to config and manage everything.

## Documentation

- Full reference this library is [here](https://docs.propelauth.com/reference/frontend-apis/react)
- Getting started guides for PropelAuth are [here](https://docs.propelauth.com/)

## Installation

```bash
npm install @propelauth/react
```

## Configuration

We need to tell PropelAuth where our application is running so that it will allow requests from our application.
Go to the **Frontend Integration** section of your [PropelAuth dashboard](https://app.propelauth.com), and
enter http://localhost:3000 into the **Application URL** field:

While we're here, we'll also copy the Auth URL into an `.env` file, which we'll use in a second:

```text
# Test environment only, in production, we'll use our own domain
REACT_APP_AUTH_URL=https://something.propelauthtest.com

# If you are using Vite:
# VITE_AUTH_URL=https://something.propelauthtest.com
```

## Initialization

At the root of your application, wrap your app in an [AuthProvider](https://docs.propelauth.com/reference/frontend-apis/react#auth-provider) component.

```js
import { AuthProvider } from "@propelauth/react";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <AuthProvider authUrl={process.env.REACT_APP_AUTH_URL}>
        <YourApp />
    </AuthProvider>,
    document.getElementById("root")
);
```

The [AuthProvider](https://docs.propelauth.com/reference/frontend-apis/react#auth-provider) is responsible for fetching the current user's authentication information. 
If your entire application requires the user to be logged in (for example, for a dashboard), 
use [RequiredAuthProvider](https://docs.propelauth.com/reference/frontend-apis/react#required-auth-provider) instead and you'll never have to check `isLoggedIn`.

## Authorization in the React library

On the frontend, authorization is useful for hiding UI elements that the user doesn't have access to. 
You will still need to implement authorization on the backend to prevent users from accessing data they shouldn't.

For example, you may want to hide the "Billing" page from users who aren't admins.
You can do this by using the [UserClass](https://docs.propelauth.com/reference/frontend-apis/react#user-class) to check if the user has the "Admin" role.

```jsx
const Sidebar = withRequiredAuthInfo(({userClass}) => {
    // We're using the router here to get the current orgId
    const router = useRouter()
    const orgId = router.query.orgId as string

    // Only Admins can see the billing page, so hide it from the sidebar
    const isAdmin = userClass.isAtLeastRole(orgId, "Admin")
    return <div>
        <div>Dashboard</div>
        <div>Reports</div>
        {isAdmin && <div>Billing</div>}
    </div>
})
```

## Questions?

Feel free to reach out at support@propelauth.com

