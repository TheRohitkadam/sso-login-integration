type fetchTokenType = {
  clientId: string;
  code: string;
  state: any;
  tokenEndpoint: string;
  fetch: any;
};

export const fetchToken = ({
  clientId,
  code,
  state,
  tokenEndpoint,
  fetch = window.fetch,
}: fetchTokenType) => {
  const payload = {
    client_id: clientId,
    code,
    grant_type: "authorization_code",
    code_verifier: state.encodedVerifier,
    redirect_uri: state.redirect_uri,
  };
  // if (clientSecret) {
  //   payload.client_secret = clientSecret
  // }
  return fetch(tokenEndpoint, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
    body: new window.URLSearchParams(payload),
  })
    .then((r: any) => {
      if (!r.ok) {
        throw new Error(
          `Token response not ok, status is ${r.status}, check the react-u5auth configuration (wrong provider or token endpoint?)`
        );
      }
      return r.json();
    })
    .then((token: any) => {
      const { expires_in } = token;
      if (expires_in && Number.isFinite(expires_in)) {
        const slackSeconds = 10;
        // add 'expires_at', with the given slack
        token.expires_at = new Date(
          new Date().getTime() + expires_in * 1000 - slackSeconds * 1000
        );
      }
      return token;
    })
    .catch((err: any) => {
      console.error("ERR (fetch)", err);
      throw err;
    });
};
