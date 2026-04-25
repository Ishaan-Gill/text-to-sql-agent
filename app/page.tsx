"use client";

import { useEffect, useState, useRef } from "react";
import {
  HumanMessage,
  SystemMessage,
  BaseMessage,
  AIMessage,
  mapChatMessagesToStoredMessages,
} from "@langchain/core/messages";
import { message } from "./actions";
import { seed } from "./database";

export default function Home() {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<BaseMessage[]>([
    new SystemMessage(`You are an expert SQL assistant.`),
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // ✅ run seed ONLY once
  useEffect(() => {
    seed();
  }, []);

  // ✅ auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!inputMessage.trim()) return;

    setIsLoading(true);

    const messageHistory = [...messages, new HumanMessage(inputMessage)];

    const response = await message(
      mapChatMessagesToStoredMessages(messageHistory)
    );

    if (response) {
      messageHistory.push(new AIMessage(response as string));
    }

    setMessages(messageHistory);
    setInputMessage("");
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col h-screen">

      {/* Header */}
      <header className="bg-white p-3 border-b text-center font-bold">
        Text-to-SQL Agent
      </header>

      {/* Messages (SCROLLABLE) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">

        {messages.map((msg, index) => {
          if (msg instanceof HumanMessage) {
            return (
              <div key={index} className="flex justify-start">
                <div className="bg-orange-400 text-white px-4 py-2 rounded-xl max-w-xl">
                  {msg.content as string}
                </div>
              </div>
            );
          }

          if (msg instanceof AIMessage) {
            return (
              <div key={index} className="flex justify-end">
                <div className="bg-indigo-100 text-black px-4 py-2 rounded-xl max-w-xl whitespace-pre-wrap">
                  {msg.content as string}
                </div>
              </div>
            );
          }

          return null;
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4 flex gap-2 bg-white">
        <input
          type="text"
          disabled={isLoading}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none"
          placeholder="Ask something..."
        />

        <button
          onClick={sendMessage}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          {isLoading ? "..." : "Send"}
        </button>
      </div>

    </div>
  );
}