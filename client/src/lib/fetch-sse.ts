import { BASE_URL } from "@/utils/api-constant";

export async function fetchSSE(
  url: string,
  data: any,
  onMessage: (
    data: string,
    configs?: {
      inProgress?: boolean;
      completed_urls?: string[];
      urls?: string[];
      conversationId?: string;
    }
  ) => void,
  onStreamDone: () => void
) {
  const response = await fetch(BASE_URL + url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
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

        if (JsonData?.conversationId) {
          onMessage("", JsonData);
        } else if (JsonData?.urls_config || JsonData?.text) {
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
