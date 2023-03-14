import hashed from "./hashed";
import getEncodedVerifierKey from "./getEncodedVerifierKey";
import pkceChallenge from "pkce-challenge";

type authorizeType = {
  clientId: string;
  scopes: string;
  storage?: any;

  redirect_uri?: string
  method?: string
  state?: string,
  authorizeEndpoint?: string
};

export default function authorize({
  clientId,
  scopes,
  storage = sessionStorage,
  authorizeEndpoint,
  method,
  redirect_uri,
  state
}: authorizeType) {
  
  const challenge = pkceChallenge();
  
  // const redirect_uri = process.env.REACT_APP_REDIRECT_URI;
  // const method = process.env.REACT_APP_METHOD;
  // const state = process.env.REACT_APP_STATE;

  

  const encodedVerifier = challenge.code_verifier;
  storage.setItem(
    getEncodedVerifierKey(clientId),
    JSON.stringify({
      encodedVerifier,
      redirect_uri,
    })
  );

  const query: any = {
    client_id: clientId,
    response_type: "code",
    redirect_uri,
    code_challenge: challenge.code_challenge,
    code_challenge_method: method,
    state: state,
  };

  let arrScopes = scopes ? JSON.parse(scopes) : [];

  if (arrScopes && arrScopes.length > 0) {
    query.scope = arrScopes.join(" ");
  }

  // const url = `${process.env.REACT_APP_AUTHORIZE_ENDPOINT}?${hashed(query)}`;
  const url = `${authorizeEndpoint}?${hashed(query)}`;
  window.location.replace(url);
}
