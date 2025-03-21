import { RequestOptions } from "@/types/serverCall";

const serverCall = async (
  URL: string,
  options: RequestOptions = { method: "GET" }
): Promise<Response> => {
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

async function fetchSSE(
  url: string,
  message: string,
  onMessage: (
    data: string,
    urls_config?: {
      inProgress?: boolean;
      completed_urls?: string[];
      urls?: string[];
    }
  ) => void,
  onStreamDone: () => void
) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        onStreamDone();
        break;
      }

      try {
        const JsonData = JSON.parse(value);

        if (JsonData?.urls_config || JsonData?.text) {
          onMessage(JsonData?.text, JsonData?.urls_config);
        }
      } catch (e) {
        onMessage(value);
      }
    }
  } catch (error) {
    console.error("Error reading stream:", error);
  } finally {
    reader.releaseLock();
  }
}

export default serverCall;
export { postRequest, deleteRequest, fetchSSE };
