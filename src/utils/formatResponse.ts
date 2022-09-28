import { formatJSon } from "./formatJson";

export const formatResponse = (body: object, headers: { [key: string]: string | string[] }) => {
  if (headers?.['content-type']?.includes('application/json')) {
    return formatJSon(body);
  } else {
    return body;
  }
}