import { RequestOptions } from "@/types/serverCall";

const serverCall = async (
  URL: string,
  options: RequestOptions = { method: "GET" }
): Promise<Response> => {
  if (!options.headers) {
    options.headers = {
      "Content-type": "application/json",
    };
  }

  return await fetch(URL, {
    credentials: "include",
    ...options,
  });
};

const postRequest = async (
  URL: string,
  data: Record<string, unknown> = {}
): Promise<Response> => {
  return await serverCall(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(data),
  });
};

const deleteRequest = async (URL: string): Promise<Response> => {
  return await serverCall(URL, {
    method: "DELETE",
  });
};

export default serverCall;
export { postRequest, deleteRequest };
