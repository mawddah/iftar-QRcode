"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, Image as ImageIcon, Download, Trash2, X } from "lucide-react";

interface Photo { id: string; filename: string; ownerId: string; }

export default function Home() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [ownerId, setOwnerId] = useState("");
    const [uploading, setUploading] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

    const cameraInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let id = localStorage.getItem("iftarOwnerId");
        if (!id) {
            id = Math.random().toString(36).substring(2, 15);
            localStorage.setItem("iftarOwnerId", id);
        }
        setOwnerId(id);
        fetchPhotos();

        const interval = setInterval(fetchPhotos, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchPhotos = async () => {
        try {
            const res = await fetch("/api/photos");
            const data = await res.json();
            if (data.photos) setPhotos(data.photos);
        } catch (e) { console.error(e); }
    }

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("photo", file);
        formData.append("ownerId", ownerId);

        try {
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            if (res.ok) fetchPhotos();
        } catch (err) { console.error(err); }
        finally { setUploading(false); }

        e.target.value = "";
    }

    const handleDelete = async (photo: Photo) => {
        if (!confirm("Are you sure you want to delete this photo?")) return;
        try {
            await fetch(`/api/photos?id=${photo.id}&ownerId=${ownerId}`, { method: "DELETE" });
            setPhotos((prev) => prev.filter(p => p.id !== photo.id));
            setSelectedPhoto(null);
        } catch (e) { console.error(e); }
    }

    return (
        <main className="min-h-screen pb-20">
            <header className="p-8 text-center border-b border-[#222] bg-[#111]">
                <h1 className="text-4xl font-playfair text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] mb-3 tracking-wide drop-shadow-sm">Corporate Dinner</h1>
                <p className="text-[#a0a0a0] font-inter text-sm max-w-[280px] mx-auto leading-relaxed">Capture, Share & Download Tonight’s Memories</p>
            </header>

            <section className="p-6 flex flex-col items-center gap-4 max-w-sm mx-auto mt-4">
                <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleUpload} />
                <input type="file" accept="image/*" className="hidden" ref={galleryInputRef} onChange={handleUpload} />

                <button
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full bg-gradient-to-r from-[#D4AF37] to-[#C5A017] text-black font-semibold py-4 rounded-xl flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(212,175,55,0.2)] transition-transform active:scale-95 disabled:opacity-70 disabled:scale-100"
                >
                    <Camera size={22} className={uploading ? "animate-pulse" : ""} />
                    {uploading ? "Uploading..." : "Take a Photo"}
                </button>

                <button
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full bg-[#1a1a1a] text-[#D4AF37] border border-[#D4AF37]/30 font-medium py-4 rounded-xl flex items-center justify-center gap-3 transition-transform hover:bg-[#222] active:scale-95 disabled:opacity-50"
                >
                    <ImageIcon size={22} />
                    Upload from Gallery
                </button>
            </section>

            {photos.length === 0 ? (
                <div className="text-center text-gray-500 mt-10 px-6 font-inter text-sm">
                    <p>No memories shared yet.</p>
                    <p>Be the first to upload!</p>
                </div>
            ) : (
                <section className="px-4 mt-6 columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4">
                    {photos.map(photo => (
                        <div key={photo.id} className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-xl shadow-lg border border-[#333]/50" onClick={() => setSelectedPhoto(photo)}>
                            <img src={`/api/image?file=${photo.filename}`} alt="Memory" className="w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                        </div>
                    ))}
                </section>
            )}

            {selectedPhoto && (
                <div className="fixed inset-0 z-50 bg-black/95 flex flex-col p-4 backdrop-blur-md transition-opacity">
                    <div className="flex justify-end p-2 mt-2">
                        <button onClick={() => setSelectedPhoto(null)} className="p-3 bg-[#222] rounded-full text-white hover:bg-[#333] transition"><X size={24} /></button>
                    </div>
                    <div className="flex-1 flex items-center justify-center overflow-hidden px-2">
                        <img src={`/api/image?file=${selectedPhoto.filename}`} className="max-h-full max-w-full object-contain rounded-lg shadow-2xl" />
                    </div>
                    <div className="flex justify-center gap-4 py-8 pb-12">
                        <a href={`/api/image?file=${selectedPhoto.filename}`} download className="flex items-center gap-2 px-6 py-3.5 bg-[#D4AF37] text-black rounded-full font-semibold shadow-lg active:scale-95 transition"><Download size={20} /> Download</a>
                        {selectedPhoto.ownerId === ownerId && (
                            <button onClick={() => handleDelete(selectedPhoto)} className="flex items-center gap-2 px-6 py-3.5 bg-red-950/40 text-red-300 border border-red-900/50 rounded-full font-medium active:scale-95 transition"><Trash2 size={20} /> Delete</button>
                        )}
                    </div>
                </div>
            )}

            <div className="text-center mt-20 pb-8">
                <a href="/api/admin/zip" className="text-xs text-[#555] font-inter hover:text-[#D4AF37] transition inline-block px-4 py-2 border border-transparent hover:border-[#333] rounded">
                    Admin: Download All Photos
                </a>
            </div>
        </main>
    );
}
