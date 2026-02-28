import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import archiver from 'archiver';
import { PassThrough } from 'stream';
import { UPLOADS_DIR } from '@/lib/db';

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

        // Zip the persistent uploads directory
        archive.directory(UPLOADS_DIR, false);
        archive.finalize();

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
