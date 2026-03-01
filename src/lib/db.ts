import { sql } from '@vercel/postgres';

export interface Photo {
    id: string;
    filename: string;
    originalname: string;
    createdat: string;
    ownerid: string;
}

export async function initDb() {
    try {
        await sql`
      CREATE TABLE IF NOT EXISTS photos (
        id VARCHAR(255) PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        originalname VARCHAR(255) NOT NULL,
        createdat TIMESTAMP NOT NULL,
        ownerid VARCHAR(255) NOT NULL
      );
    `;
    } catch (error) {
        console.error("Error initializing database:", error);
    }
}

export async function getPhotos(): Promise<Photo[]> {
    try {
        const { rows } = await sql<Photo>`SELECT * FROM photos ORDER BY createdat DESC`;
        return rows;
    } catch (error) {
        console.error("Error fetching photos:", error);
        return [];
    }
}

export async function addPhoto(photo: Photo): Promise<void> {
    try {
        await sql`
      INSERT INTO photos (id, filename, originalname, createdat, ownerid)
      VALUES (${photo.id}, ${photo.filename}, ${photo.originalname}, ${photo.createdat}, ${photo.ownerid})
    `;
    } catch (error) {
        console.error("Error adding photo to database:", error);
        throw error;
    }
}

export async function deletePhoto(id: string): Promise<Photo | null> {
    try {
        const { rows } = await sql<Photo>`
      DELETE FROM photos
      WHERE id = ${id}
      RETURNING *
    `;
        return rows[0] || null;
    } catch (error) {
        console.error("Error deleting photo:", error);
        return null;
    }
}
