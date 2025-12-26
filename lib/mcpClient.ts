/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import { Recipe, RecipeStep } from "@/types";

const MCP_SERVER_DIR = path.resolve(process.cwd(), "../fridge-chef-mcp");

async function createMcpClient() {
  const transport = new StdioClientTransport({
    command: "npx", // We assume npx is available in PATH
    args: ["ts-node", "index.ts"],
    cwd: MCP_SERVER_DIR,
  });

  const client = new Client(
    {
      name: "fridge-chef-web",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  await client.connect(transport);
  return client;
}

export async function suggestRecipes(ingredients: string[]): Promise<Recipe[]> {
  let client;
  try {
    client = await createMcpClient();
    const result: any = await client.callTool({
      name: "suggest_recipes",
      arguments: { ingredients },
    });

    if (result.content[0].type === "text") {
       return JSON.parse(result.content[0].text);
    }
    return [];
  } catch (error) {
    console.error("Failed to suggest recipes (mcpClient):", error);
    if (error instanceof Error && 'stderr' in error) {
        console.error("MCP Server Stderr:", (error as any).stderr);
    }
    // Return empty array on error for now
    return [];
  } finally {
    if (client) await client.close();
  }
}

// We now accept title as well, or we try to find it.
// For the stateless app, it's best if the component passes the title.
// But the server action signature is fixed for now?
// Let's overload or change signature.
export async function getRecipeSteps(recipeId: string, recipeTitle?: string, servings: number = 2): Promise<RecipeStep[]> {
  let client;
  try {
    client = await createMcpClient();
    
    // If title missing, use ID as fallback title
    const title = recipeTitle || recipeId;

    const result: any = await client.callTool({
      name: "get_recipe_steps",
      arguments: { recipe_id: recipeId, recipe_title: title, servings },
    });
    
     if (result.content[0].type === "text") {
       const parsed = JSON.parse(result.content[0].text);
       if (parsed.error) throw new Error(parsed.error);
       return parsed;
    }
    return [];
  } catch (error) {
    console.error("Failed to get recipe steps:", error);
    return [];
  } finally {
    if (client) await client.close();
  }
}
export async function getSubstitutes(ingredient: string, recipeContext?: string): Promise<any> {
  let client;
  try {
    client = await createMcpClient();
    const result: any = await client.callTool({
      name: "get_substitutes",
      arguments: { ingredient, recipe_context: recipeContext },
    });
    
     if (result.content[0].type === "text") {
       return JSON.parse(result.content[0].text);
    }
    return null;
  } catch (error) {
    console.error("Failed to get substitutes:", error);
    return null;
  } finally {
    if (client) await client.close();
  }
}
