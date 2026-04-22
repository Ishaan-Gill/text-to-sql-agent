// "use server"

import { schemaDocs } from "./schema";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

let vectorStore: MemoryVectorStore | null = null;

const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-embedding-001",
    taskType: TaskType.RETRIEVAL_DOCUMENT,
});

export async function retriveRelevantSchema(query: string) {
    if (!vectorStore) {
        throw new Error("RAG not initialized");
    }
    const results = await vectorStore.similaritySearch(query, 2);
    return results.map((doc) => doc.pageContent).join("\n\n");
}

export async function initRAG() {
    vectorStore = await MemoryVectorStore.fromTexts(
        schemaDocs,
        schemaDocs.map((_, i) => `doc-${i}`),
        embeddings
    );
}
export async function testRAG() {
    await initRAG();
    const res = await retriveRelevantSchema("show customer emails");
    console.log("RAG RESULT:",res)
    
}
