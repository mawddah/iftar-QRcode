import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const imageUrl = searchParams.get('url');
        const id = searchParams.get('id') || 'memory';

        if (!imageUrl) {
            return new Response('Missing image URL', { status: 400 });
        }

        // Fetch the image securely from server-side (bypasses browser CORS)
        const response = await fetch(imageUrl);

        if (!response.ok) {
            return new Response('Failed to fetch image', { status: response.status });
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Force browser to download it as an attachment as a PNG
        return new Response(buffer, {
            headers: {
                'Content-Type': 'image/png',
                'Content-Disposition': `attachment; filename="Ramadan_Iftar_${id.substring(0, 8)}.png"`,
            },
        });
    } catch (error) {
        console.error('Download Proxy Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
