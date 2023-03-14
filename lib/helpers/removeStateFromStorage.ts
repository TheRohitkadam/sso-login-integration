import getEncodedVerifierKey from "./getEncodedVerifierKey";
type removeStateFromStoragetype = {
  clientId: string;
  storage: any;
};
export const removeStateFromStorage = ({
  clientId,
  storage,
}: removeStateFromStoragetype) => {
  const key = getEncodedVerifierKey(clientId);
  storage.removeItem(key);
};
