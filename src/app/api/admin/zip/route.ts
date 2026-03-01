import { NextResponse } from 'next/server';
import archiver from 'archiver';
import { PassThrough } from 'stream';
import { getPhotos } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        archive.on('error', function (err) {
            console.error("Archive Error:", err);
            throw err;
        });

        const passThrough = new PassThrough();
        archive.pipe(passThrough);

        const photos = await getPhotos();

        // We can't zip a whole directory anymore, we have to download each blob and append it to the zip
        // Note: for very large sets of photos, this approach could timeout on Vercel's free tier (10s limit)
        const downloadAndZip = async () => {
            for (const photo of photos) {
                try {
                    // Fetch the image from Blob storage
                    const res = await fetch(photo.filename);
                    if (!res.ok) continue;

                    const arrayBuffer = await res.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);

                    // Append the fetched buffer to the zip archive using the photo's random uuid
                    const name = photo.filename.split('/').pop() || `${photo.id}.jpg`;
                    archive.append(buffer, { name });
                } catch (e) {
                    console.error("Failed to append file to zip:", e);
                }
            }
            archive.finalize();
        };

        // Start zipping async
        downloadAndZip();

        const iterator = (async function* () {
            for await (const chunk of passThrough) {
                yield chunk;
            }
        })();

        const stream = new ReadableStream({
            async pull(controller) {
                const { value, done } = await iterator.next();
                if (done) {
                    controller.close();
                } else {
                    controller.enqueue(value);
                }
            }
        });

        return new NextResponse(stream as any, {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': 'attachment; filename=iftar-memories.zip'
            }
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to create zip file' }, { status: 500 });
    }
}
