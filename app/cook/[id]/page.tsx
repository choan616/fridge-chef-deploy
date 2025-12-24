import { getRecipeSteps } from "@/lib/mcpClient";
import CookingChat from "@/components/CookingChat";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ title?: string }>;
}

export default async function CookingPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { title } = await searchParams;
  const steps = await getRecipeSteps(id, title);

  if (!steps || steps.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1>레시피를 찾을 수 없거나 단계가 없습니다.</h1>
      </div>
    );
  }

  return (
    <main style={{ padding: '2rem', minHeight: '100vh', background: 'var(--background)' }}>
      <CookingChat steps={steps} recipeId={id} title={title || id} />
    </main>
  );
}
