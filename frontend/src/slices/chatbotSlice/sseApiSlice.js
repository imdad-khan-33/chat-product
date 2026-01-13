import { createApi } from "@reduxjs/toolkit/query/react";

export const sseApi = createApi({
  reducerPath: "sseApi",
  baseQuery: () => ({}),
  endpoints: (builder) => ({
    postChatStream: builder.query({
      async queryFn() {
        return { data: "" };
      },
      onCacheEntryAdded: async (
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) => {
        const controller = new AbortController();
        await cacheDataLoaded;

        const token = localStorage.getItem("Therapy-user-token") || "";

        try {
          const response = await fetch(
            "https://virtual-therapist-production.up.railway.app/api/v1/therapy/chat/stream",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ message: arg }),
              signal: controller.signal,
            }
          );

          const reader = response.body?.getReader();
          const decoder = new TextDecoder("utf-8");
          let buffer = "";
          let done = false;

          while (!done) {
            const { value, done: streamDone } = await reader.read();
            done = streamDone;

            buffer += decoder.decode(value || new Uint8Array(), {
              stream: true,
            });

            const lines = buffer.split("\n");
            buffer = lines.pop() || ""; // Save any incomplete line

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;

              let clean = line.replace(/^data:\s*/, "").trim();
              if (!clean) continue;

              if (clean === "[ERROR]") {
                updateCachedData((draft) => {
                  const current = typeof draft === "string" ? draft : "";
                  return (
                    current +
                    `<p class='text-red-500 font-semibold'>⚠️ An error occurred during streaming.</p>`
                  );
                });
                done = true;
                break;
              }

              // Clean and format streamed content
              const formatted = clean
                .replace(/<\s*/g, "<")
                .replace(/\s*>/g, ">")
                .replace(/<\/?li>/gi, (tag) => tag.toLowerCase())
                .replace(/<\/?ul>/gi, (tag) => tag.toLowerCase())
                .replace(/<\/?p>/gi, (tag) => tag.toLowerCase())
                .replace(/<li>(.*?)<\/li>/g, "<li>$1</li>") // Fix broken <li> tags
                .replace(/^>\s*/gm, "<blockquote>")
                .replace(/^[-*]\s+/gm, "<li>• ")
                .replace(/\n{2,}/g, "<br/>")
                .replace(/\n/g, " ")
                .replace(/^\s*data:\s*/gm, "");

              updateCachedData((draft) => {
                const current = typeof draft === "string" ? draft : "";
                return current + " " + formatted;
              });
            }
          }
        } catch (error) {
          console.error("Streaming error:", error);
          updateCachedData(() => `[ERROR]`);
        }

        await cacheEntryRemoved;
        controller.abort();
      },
    }),
  }),
});

export const { useLazyPostChatStreamQuery } = sseApi;
