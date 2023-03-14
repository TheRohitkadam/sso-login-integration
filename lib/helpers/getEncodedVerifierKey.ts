export default (clientId: any) =>
  "encodedVerifier-" + encodeURIComponent(clientId);
