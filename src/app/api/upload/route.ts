import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { addPhoto, UPLOADS_DIR, initDb } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        await initDb();
        const formData = await request.formData();
        const file = formData.get('photo') as File | null;
        const ownerId = formData.get('ownerId') as string | null;

        if (!file || !ownerId) {
            return NextResponse.json({ error: 'Missing file or ownerId' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Generate a unique ID for the photo
        const id = crypto.randomUUID();
        // Keep original extension, but normalize the filename
        const ext = path.extname(file.name) || '.jpg';
        const filename = `${id}${ext}`;

        // Write image to the safe uploads directory
        const filePath = path.join(UPLOADS_DIR, filename);
        await fs.writeFile(filePath, buffer);

        const now = new Date().toISOString();

        const photoData = {
            id,
            filename,
            originalName: file.name,
            createdAt: now,
            ownerId
        };

        await addPhoto(photoData);

        return NextResponse.json({ success: true, photo: photoData });
    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
