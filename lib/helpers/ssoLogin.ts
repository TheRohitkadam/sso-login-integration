import axios, { AxiosRequestConfig } from "axios";
import { SSO_LOGIN_URL } from "../../components/GlobalDefinations/GlobalConstants/GlobalUrl";

export const ssoLogin = async (
  token: string,
  callback: (data: any) => void,
  errorCallback: (data: any) => void
) => {
  let config: AxiosRequestConfig = {
    method: "POST",
    url: SSO_LOGIN_URL,
    headers: { Authorization: token },
    data: {},
  };

  await axios(config)
    .then((res) => {
      if (res.headers && res.headers.authorization) {
        callback({
          token: res.headers.authorization,
          refresh_token: res.headers["Refresh-Token"],
          status: "success",
          message: "Login successful",
          error: null,
          code: 200,
        });
      }
    })
    .catch((err) => {
      errorCallback(err.response);
    });
};
