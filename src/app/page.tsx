"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, Image as ImageIcon, Download, Trash2, X, Plus } from "lucide-react";

interface Photo { id: string; filename: string; ownerid: string; }

export default function Home() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [ownerId, setOwnerId] = useState("");
    const [uploading, setUploading] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [showUploadMenu, setShowUploadMenu] = useState(false);

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
            const data = await res.json();
            if (res.ok) {
                fetchPhotos();
            } else {
                alert(`Upload failed: ${data.error || 'Server error'}. Please check Vercel API keys.`);
            }
        } catch (err) {
            console.error(err);
            alert("Upload failed completely. Network or server error.");
        }
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

    const handleDownload = async (photo: Photo) => {
        try {
            const res = await fetch(photo.filename);
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = blobUrl;
            // Best effort generic filename converted to PNG
            a.download = `Ramadan_Iftar_${photo.id.substring(0, 8)}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error("Download failed:", err);
            // Fallback for strict browsers
            window.open(photo.filename, "_blank");
        }
    }

    return (
        <main className="min-h-screen pb-20">
            <header className="p-8 text-center border-b border-white/10 bg-[#3b1245]/80 backdrop-blur-md sticky top-0 z-10">
                <h1 className="text-4xl font-playfair text-transparent bg-clip-text bg-gradient-to-r from-[#facc15] to-[#fef08a] mb-3 tracking-wide drop-shadow-[0_0_15px_rgba(250,204,21,0.3)]">Ramadan Kareem</h1>
                <p className="text-white/80 font-inter text-sm max-w-[280px] mx-auto leading-relaxed">Daily Checklist & Activity Memories</p>
            </header>

            <section className="px-6 flex flex-col items-center gap-4 max-w-sm mx-auto mt-4">
                <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleUpload} />
                <input type="file" accept="image/*" className="hidden" ref={galleryInputRef} onChange={handleUpload} />
            </section>

            {photos.length === 0 ? (
                <div className="text-center text-[#d8b4e2] mt-10 px-6 font-inter text-sm max-w-sm mx-auto p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                    <p className="mb-2">No memories shared yet.</p>
                    <p>Be the first to upload!</p>
                </div>
            ) : (
                <section className="px-4 mt-8 columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4">
                    {photos.map(photo => (
                        <div key={photo.id} className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.4)] border border-white/15 bg-white/5 backdrop-blur-md transition-all duration-300 hover:shadow-[0_8px_30px_rgba(250,204,21,0.2)] hover:-translate-y-1" onClick={() => setSelectedPhoto(photo)}>
                            <img src={photo.filename} alt="Memory" className="w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#2a0a2f]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        </div>
                    ))}
                </section>
            )}

            {selectedPhoto && (
                <div className="fixed inset-0 z-50 bg-[#1e0722]/95 flex flex-col p-4 backdrop-blur-md transition-opacity">
                    <div className="flex justify-end p-2 mt-2">
                        <button onClick={() => setSelectedPhoto(null)} className="p-3 bg-[#4a1c57] rounded-full text-white hover:bg-[#5c236d] transition"><X size={24} /></button>
                    </div>
                    <div className="flex-1 flex items-center justify-center overflow-hidden px-2">
                        <img src={selectedPhoto.filename} className="max-h-full max-w-full object-contain rounded-lg shadow-2xl" />
                    </div>
                    <div className="flex justify-center gap-4 py-8 pb-12">
                        <button onClick={() => handleDownload(selectedPhoto)} className="flex items-center gap-2 px-6 py-3.5 bg-[#facc15] text-[#2a0a2f] rounded-full font-bold shadow-[0_4px_15px_rgba(250,204,21,0.3)] active:scale-95 transition"><Download size={20} /> Download</button>
                        {selectedPhoto.ownerid === ownerId && (
                            <button onClick={() => handleDelete(selectedPhoto)} className="flex items-center gap-2 px-6 py-3.5 bg-red-950/40 text-red-300 border border-red-900/50 hover:bg-red-900/60 rounded-full font-medium active:scale-95 transition"><Trash2 size={20} /> Delete</button>
                        )}
                    </div>
                </div>
            )}

            <div className="text-center mt-20 pb-20">
                <a href="/admin/gallery" className="text-xs text-white/40 font-inter hover:text-[#facc15] transition inline-block px-4 py-2 border border-transparent hover:border-white/10 rounded">
                    Admin Access
                </a>
            </div>

            {/* Floating Action Button (FAB) */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
                <button
                    onClick={() => setShowUploadMenu(true)}
                    disabled={uploading}
                    className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#eab308] to-[#fef08a] text-[#2a0a2f] flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.6)] transition-transform hover:scale-110 active:scale-95 disabled:opacity-70 disabled:scale-100 group relative"
                    aria-label="Upload Photo Menu"
                >
                    <Plus size={32} className={`transition-transform duration-300 ${uploading ? "animate-spin" : "group-hover:rotate-90"}`} />

                    {/* Soft glowing ring around the button */}
                    <span className="absolute inset-0 rounded-full border border-[#fef08a] opacity-50 blur-sm scale-110 pointer-events-none" />
                </button>
            </div>

            {/* Upload Action Sheet Modal */}
            {showUploadMenu && (
                <div
                    className="fixed inset-0 z-50 bg-[#1e0722]/80 backdrop-blur-sm flex flex-col justify-end transition-opacity duration-300"
                    onClick={() => setShowUploadMenu(false)}
                >
                    <div
                        className="bg-[#3b1245] w-full rounded-t-3xl border-t border-white/10 p-6 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col gap-4 animate-in slide-in-from-bottom"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4" />

                        <button
                            onClick={() => { cameraInputRef.current?.click(); setShowUploadMenu(false); }}
                            className="w-full bg-gradient-to-r from-[#facc15] to-[#eab308] text-[#2a0a2f] font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(250,204,21,0.3)] transition-transform active:scale-95"
                        >
                            <Camera size={22} className={uploading ? "animate-pulse" : ""} />
                            Take a Photo
                        </button>

                        <button
                            onClick={() => { galleryInputRef.current?.click(); setShowUploadMenu(false); }}
                            className="w-full bg-[#4a1c57]/60 backdrop-blur-sm text-[#facc15] border border-[#facc15]/30 font-medium py-4 rounded-xl flex items-center justify-center gap-3 transition-transform hover:bg-[#5c236d]/80 active:scale-95"
                        >
                            <ImageIcon size={22} />
                            Upload from Gallery
                        </button>

                        <button
                            onClick={() => setShowUploadMenu(false)}
                            className="w-full mt-2 text-white/60 font-medium py-3 rounded-xl hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
