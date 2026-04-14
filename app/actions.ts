"user server"

import { ChatWatsonx } from "@langchain/community/chat_models/ibm";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import {
    mapStoredMessagesToChatMessages,
    StoredMessage
} from "@langchain/core/messages";
import { version } from "os";

export async function message(messages: StoredMessage[]) {
    const deserialized = mapStoredMessagesToChatMessages(messages);

    const agent = createReactAgent({
        llm: new ChatWatsonx({
            model: "mistrallai/mistral-large",
            projectId: process.env.WATSONX_AI_PROJECT_ID,
            serviceUrl: process.env.WATSONX_AI_ENDPOINT,
            version: "2026-04-13",
        }),
        tools: [],
    });

    const response = await agent.invoke({
        messages: deserialized,
    });

    return response.messages[response.messages.length - 1].content;

}