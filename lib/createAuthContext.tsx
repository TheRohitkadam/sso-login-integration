import React, { createContext, useState, useEffect, useContext } from "react";
import authorize from "./helpers/authorize";
import { getCodeFromLocation } from "./helpers/getCodeFromLocation";
import { fetchToken } from "./helpers/fetchToken";
import { removeCodeFromLocation } from "./helpers/removeCodeFromLocation";
import { getVerifierState } from "./helpers/getVerifierState";
import { removeStateFromStorage } from "./helpers/removeStateFromStorage";
import { ssoLogin } from "./helpers/ssoLogin";
import { Button, Result, Spin } from "antd";
import { getLoggedinUser } from "../router/functions/getLoggedinUser";

type params = {
  clientId: string;
  scopes: string;
  tokenEndpoint?: string;
  storage?: any;
  fetch?: any;
  busyIndicator?: React.ReactNode;

  redirect_uri?: string
  method?: string
  state?: string,
  authorizeEndpoint?: string
  unauthorizedPage?: React.ReactNode
};
export const context = createContext({});

type AuthContextType = {
  onLoginSuccess: (token: any, username: string) => void
  children?: any
}

const createAuthContext = ({
  clientId,
  scopes,
  tokenEndpoint = `${process.env.REACT_APP_TOKEN_ENDPOINT}`,
  storage = sessionStorage,
  fetch = window.fetch,
  busyIndicator = <div style={{ position: 'absolute', top: "50%", left: '50%' }}>
    <Spin size="large" />
  </div>,

  authorizeEndpoint,
  method,
  redirect_uri,
  state,
  unauthorizedPage = <div style={{ position: 'absolute', top: "50%", left: '50%' }}>
    Unauthorized!
  </div>
}: params) => {
  const { Provider } = context;

  class Authenticated extends React.Component {
    static contextType = context;
    componentDidMount() {
      const { ensureAuthenticated } = this.context;
      ensureAuthenticated();
    }
    render() {
      const { token, unauthorized } = this.context;
      const { children } = this.props;

      if (unauthorized) {
        return unauthorizedPage
      }

      if (!token) {
        return busyIndicator;
      } else {
        return children;
      }
    }
  }

  const useToken = () => {
    const { token }: any = useContext(context);
    if (!token) {
      console.warn(
        `Trying to useToken() while not being authenticated.\nMake sure to useToken() only inside of an <Authenticated /> component.`
      );
    }
    return token;
  };

  return {
    AuthContext: ({ children, onLoginSuccess }: AuthContextType) => {
      const [token, setToken] = useState(null);
      const [isLoggedIn, setIsLoggedIn] = useState(false)
      const [idTokenHint, setIdTokenHint] = useState(null)
      const [accessToken, setAccessToken] = useState(null)
      const [unauthorized, setUnauthorized] = useState<boolean>(false)

      const setTokenCallback = (res: any) => {
        // console.log("res", res)
        ssoLogin(res.access_token, (response: any) => {
          // console.log("res", res)
          setIdTokenHint(res.id_token)
          setAccessToken(response.token)
          setToken(response)
          sessionStorage.setItem("token", response.token)
          getLoggedinUser((res) => {
            if (res.payload && res.payload[0]) {
              onLoginSuccess(null, res.payload[0].username)
            }
          }, (err) => {
            console.log(err)
          })

        }, (error: any) => {
          console.log("error", error)
          console.log(JSON.stringify(error))
          if (error.status === 401) {
            setUnauthorized(true)
          }
        })

      }
      // if we have no token, but code and verifier are present,
      // then we try to swap code for token
      useEffect(() => {
        if (!token) {
          const code = getCodeFromLocation({ location: window.location });
          const state = getVerifierState({ clientId, storage });
          if (code && state) {
            fetchToken({
              clientId,
              tokenEndpoint,
              code,
              state,
              fetch,
            })
              .then(setTokenCallback)
              .then(() => {
                removeCodeFromLocation();
                removeStateFromStorage({ clientId, storage });
              })
              .catch((e: any) => {
                console.error(e);
                alert(`Error fetching auth token: ${e.message}`);
              });
          }
        }
      }, [token]);

      const ensureAuthenticated = () => {
        const code = getCodeFromLocation({ location: window.location });
        if (code) {
          setIsLoggedIn(true)
        }
        if (!token && !code) {
          authorize({ clientId, scopes, authorizeEndpoint, method, redirect_uri, state });
        }
      };

      return (
        <Provider value={{ token, ensureAuthenticated, isLoggedIn, idTokenHint, accessToken, unauthorized }}>{children}</Provider>
      );
    },
    Authenticated,
    useToken,
  };
};

export default createAuthContext