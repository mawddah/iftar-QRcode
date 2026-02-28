import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { UPLOADS_DIR } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const filename = searchParams.get('file');

        if (!filename) {
            return new NextResponse('Missing file parameter', { status: 400 });
        }

        // Prevent directory traversal attacks
        const safeFilename = path.basename(filename);
        const filePath = path.join(UPLOADS_DIR, safeFilename);

        try {
            const fileBuffer = await fs.readFile(filePath);

            // Determine content type
            const ext = path.extname(safeFilename).toLowerCase();
            let contentType = 'image/jpeg';
            if (ext === '.png') contentType = 'image/png';
            else if (ext === '.gif') contentType = 'image/gif';
            else if (ext === '.webp') contentType = 'image/webp';

            return new NextResponse(fileBuffer, {
                headers: {
                    'Content-Type': contentType,
                    'Cache-Control': 'public, max-age=31536000, immutable',
                },
            });
        } catch (e) {
            return new NextResponse('Image not found', { status: 404 });
        }
    } catch (error) {
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
