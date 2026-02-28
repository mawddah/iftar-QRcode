import { NextRequest, NextResponse } from 'next/server';
import { getPhotos, deletePhoto, UPLOADS_DIR } from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
    try {
        const photos = await getPhotos();
        return NextResponse.json({ photos });
    } catch (error) {
        console.error('Fetch Error:', error);
        return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const ownerId = searchParams.get('ownerId');

        if (!id || !ownerId) {
            return NextResponse.json({ error: 'Missing id or ownerId' }, { status: 400 });
        }

        const photos = await getPhotos();
        const photo = photos.find(p => p.id === id);

        if (!photo) {
            return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
        }

        if (photo.ownerId !== ownerId) {
            return NextResponse.json({ error: 'Unauthorized deletion' }, { status: 403 });
        }

        await deletePhoto(id);

        // Remove file from the persistent directory
        const filePath = path.join(UPLOADS_DIR, photo.filename);
        try {
            await fs.unlink(filePath);
        } catch (e) {
            console.warn("Could not delete file from disk:", e);
        }

        return NextResponse.json({ success: true, deleted: id });
    } catch (error) {
        console.error('Delete Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
