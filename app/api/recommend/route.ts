import { NextRequest, NextResponse } from 'next/server';
import { suggestRecipes } from '@/lib/mcpClient';

export async function POST(request: NextRequest) {
  try {
    const { ingredients } = await request.json();
    
    if (!ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json({ error: 'Invalid ingredients' }, { status: 400 });
    }

    const recipes = await suggestRecipes(ingredients);
    return NextResponse.json(recipes);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
  }
}
