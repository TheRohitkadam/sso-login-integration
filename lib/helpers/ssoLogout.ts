export const ssoLogout = (tokenObj:any, logoutProvider: string,logoutURL: string) => {
  const {idTokenHint} = tokenObj
  const id_token_hint = idTokenHint;
  // const logoutURL = sessionStorage.getItem("logoutUrl")
  // const logout = sessionStorage.getItem("logout")
  if (id_token_hint) {
    // let url = `${process.env.REACT_APP_LOGOUT}?id_token_hint=${id_token_hint}&post_logout_redirect_uri=${process.env.REACT_APP_LOGOUT_URL}`;
    const url = `${logoutProvider}?id_token_hint=${id_token_hint}&post_logout_redirect_uri=${logoutURL}`;

    window.location.href = url;
  }
};