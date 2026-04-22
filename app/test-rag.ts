import "dotenv/config"
import { initRAG, retriveRelevantSchema } from "./rag";

async function main() {
    await initRAG();

    const res = await retriveRelevantSchema("shipping cost");
    console.log("RESULT:\n", res);
}

main()