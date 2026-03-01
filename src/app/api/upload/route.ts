import { NextRequest, NextResponse } from 'next/server';
import { addPhoto, initDb } from '@/lib/db';
import { put } from '@vercel/blob';
import crypto from 'crypto';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        await initDb();

        const formData = await request.formData();
        const file = formData.get('photo') as File | null;
        const ownerId = formData.get('ownerId') as string | null;

        if (!file || !ownerId) {
            return NextResponse.json({ error: 'Missing file or ownerId' }, { status: 400 });
        }

        // Generate unique ID
        const id = crypto.randomUUID();
        const ext = path.extname(file.name) || '.jpg';
        const filename = `${id}${ext}`;

        // Upload exactly to Vercel Blob
        const blob = await put(filename, file, { access: 'public' });

        const now = new Date().toISOString();

        const photoData = {
            id,
            filename: blob.url, // Save the absolute blob URL as the filename to render directly
            originalname: file.name,
            createdat: now,
            ownerid: ownerId
        };

        // Save to Vercel Postgres
        await addPhoto(photoData);

        return NextResponse.json({ success: true, photo: photoData });
    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
