export default function hashed(o: any) {
  return Object.getOwnPropertyNames(o)
    .map((prop) => `${prop}=${encodeURIComponent(o[prop])}`)
    .join("&");
}
