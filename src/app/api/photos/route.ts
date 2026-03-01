import { NextRequest, NextResponse } from 'next/server';
import { getPhotos, deletePhoto, initDb } from '@/lib/db';
import { del } from '@vercel/blob';

export async function GET() {
    try {
        await initDb();
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
        const adminKey = searchParams.get('adminKey');

        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }

        const photos = await getPhotos();
        const photo = photos.find(p => p.id === id);

        if (!photo) {
            return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
        }

        const isAdmin = adminKey === (process.env.ADMIN_PASSWORD || 'ramadan123');

        // Must match the original lowercase definition in Postgres
        if (!isAdmin && photo.ownerid !== ownerId) {
            return NextResponse.json({ error: 'Unauthorized deletion' }, { status: 403 });
        }

        // Delete from Postgres database
        await deletePhoto(id);

        // Delete the file from Vercel Blob (filename contains the full URL in this context)
        try {
            await del(photo.filename);
        } catch (e) {
            console.warn("Could not delete from Vercel Blob:", e);
        }

        return NextResponse.json({ success: true, deleted: id });
    } catch (error) {
        console.error('Delete Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
