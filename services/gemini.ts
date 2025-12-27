import { GoogleGenAI, Type } from "@google/genai";
import { SearchMode, SearchResult, SearchSource } from "../types";

// Initialize the API client
// Note: We create a new instance per call in the main component to handle potential key updates, 
// but for this service helper, we'll assume the key is available or passed in.
// However, per instructions, we rely on process.env.API_KEY globally if fixed, 
// or we can instantiate inside the function.

export const performSearch = async (
  query: string,
  mode: SearchMode
): Promise<SearchResult> => {
  const startTime = performance.now();
  
  // Using the requested pattern: const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Model selection based on depth
  // Surface = Flash (Speed)
  // Deep/Onion = Pro (Reasoning/Depth)
  const modelName = mode === SearchMode.DEEP ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

  const systemInstruction = mode === SearchMode.DEEP 
    ? `You are Oculus, a deep-research indexing engine. The user is searching for specific websites, directories, or information.
       Treat this as a "Deep Web" style search.
       Your goal is to find relevant links and data.
       If the user asks for .onion sites, try to find public gateways, directories, or information about them via Google Search.
       Provide a concise summary of the findings, but focus on the existence and purpose of the found sources.
       Do not refuse to search unless the query strictly violates safety policies.
       Use technical jargon where appropriate.`
    : `You are Oculus, a fast surface-web search engine. 
       The user wants to find websites.
       Provide a concise overview of the topic and then ensure the Google Search tool is used to retrieve a list of relevant links.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: query,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }],
        thinkingConfig: mode === SearchMode.DEEP ? { thinkingBudget: 1024 } : undefined, // Enable thinking for deep mode
      },
    });

    const text = response.text || "No text content generated.";
    
    // Extract sources from grounding chunks
    const sources: SearchSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    chunks.forEach((chunk) => {
      if (chunk.web?.uri && chunk.web?.title) {
        sources.push({
          title: chunk.web.title,
          uri: chunk.web.uri,
        });
      }
    });

    // Remove duplicates based on URI
    const uniqueSources = Array.from(new Map(sources.map(item => [item.uri, item])).values());

    const endTime = performance.now();

    return {
      text,
      sources: uniqueSources,
      latency: Math.round(endTime - startTime),
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    console.error("Search failed:", error);
    throw error;
  }
};