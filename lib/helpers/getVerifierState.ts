import getEncodedVerifierKey from "./getEncodedVerifierKey";

type getVerifierStatetype = {
  clientId: string;
  storage: any;
};
export const getVerifierState = ({
  clientId,
  storage,
}: getVerifierStatetype) => {
  const key = getEncodedVerifierKey(clientId);
  const value = JSON.parse(storage.getItem(key));
  return value;
};
