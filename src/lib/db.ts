import fs from 'fs/promises';
import path from 'path';

// Use environment variable DATA_DIR if set, otherwise fallback to local /data directory
export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
export const DB_PATH = path.join(DATA_DIR, 'photos.json');

export interface Photo {
    id: string;
    filename: string;
    originalName: string;
    createdAt: string;
    ownerId: string;
}

// Ensure the storage paths exist
export async function initDb() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        await fs.mkdir(UPLOADS_DIR, { recursive: true });
    } catch (e) { /* ignore */ }
}

export async function getPhotos(): Promise<Photo[]> {
    await initDb();
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if ((error as any).code === 'ENOENT') {
            await fs.writeFile(DB_PATH, '[]');
            return [];
        }
        throw error;
    }
}

export async function addPhoto(photo: Photo): Promise<void> {
    const photos = await getPhotos();
    photos.unshift(photo);
    await fs.writeFile(DB_PATH, JSON.stringify(photos, null, 2));
}

export async function deletePhoto(id: string): Promise<Photo | null> {
    const photos = await getPhotos();
    const index = photos.findIndex(p => p.id === id);
    if (index === -1) return null;
    const [deleted] = photos.splice(index, 1);
    await fs.writeFile(DB_PATH, JSON.stringify(photos, null, 2));
    return deleted;
}
