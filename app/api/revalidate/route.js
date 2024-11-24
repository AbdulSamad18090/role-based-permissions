import { revalidatePath } from 'next/cache';

export async function POST(request) {
  try {
    const { path } = await request.json();

    if (!path) {
      return new Response(
        JSON.stringify({ message: 'Path is required' }),
        { status: 400 }
      );
    }

    revalidatePath(path);

    return new Response(
      JSON.stringify({ revalidated: true, path }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error revalidating path:', error);
    return new Response(
      JSON.stringify({ message: 'Error revalidating path', error: error.message }),
      { status: 500 }
    );
  }
}
