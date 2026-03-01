"use client";

import { useState, useEffect } from "react";
import { Download, Trash2, KeyRound, QrCode } from "lucide-react";

interface Photo { id: string; filename: string; ownerId: string; createdat: string; }

export default function AdminGallery() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [adminKey, setAdminKey] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState("");

    const fetchPhotos = async () => {
        try {
            const res = await fetch("/api/photos");
            const data = await res.json();
            if (data.photos) setPhotos(data.photos);
        } catch (e) { console.error(e); }
    }

    useEffect(() => {
        if (isAuthenticated) fetchPhotos();
    }, [isAuthenticated]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple client-side flag setting, real security enforced at API level
        if (adminKey.trim()) {
            setIsAuthenticated(true);
            setError("");
        } else {
            setError("Please enter the admin key.");
        }
    };

    const handleDelete = async (photoId: string) => {
        if (!confirm("Admin: Permanently delete this photo?")) return;
        try {
            const res = await fetch(`/api/photos?id=${photoId}&adminKey=${encodeURIComponent(adminKey)}`, {
                method: "DELETE"
            });
            const data = await res.json();

            if (!res.ok) {
                alert(`Error: ${data.error}`);
                if (res.status === 403) setIsAuthenticated(false); // Key rejected
                return;
            }

            setPhotos((prev) => prev.filter(p => p.id !== photoId));
        } catch (e) {
            console.error(e);
            alert("Network error occurred.");
        }
    }

    if (!isAuthenticated) {
        return (
            <main className="min-h-screen flex items-center justify-center p-6">
                <form onSubmit={handleLogin} className="bg-[#3b1245]/80 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] max-w-sm w-full text-center">
                    <KeyRound size={48} className="mx-auto text-[#facc15] mb-6 opacity-80" />
                    <h1 className="text-3xl font-playfair text-[#fef08a] mb-2 tracking-wide">Admin Access</h1>
                    <p className="text-white/60 text-sm mb-6">Enter the master password to manage the gallery.</p>

                    <input
                        type="password"
                        value={adminKey}
                        onChange={e => setAdminKey(e.target.value)}
                        placeholder="Admin Password"
                        className="w-full bg-[#1e0722]/60 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#facc15] transition-colors mb-4 text-center tracking-widest"
                        autoFocus
                    />

                    {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                    <button type="submit" className="w-full bg-[#facc15] text-[#2a0a2f] font-bold py-3.5 rounded-xl shadow-[0_4px_15px_rgba(250,204,21,0.3)] transition-transform active:scale-95">
                        Log In
                    </button>
                    <a href="/" className="block mt-6 text-sm text-white/40 hover:text-white transition-colors">Return to Gallery</a>
                </form>
            </main>
        );
    }

    return (
        <main className="min-h-screen pb-20">
            <header className="p-6 border-b border-white/10 bg-[#3b1245]/80 backdrop-blur-md sticky top-0 z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-playfair text-[#facc15]">Gallery Admin</h1>
                    <p className="text-white/70 text-xs">Total Photos: {photos.length}</p>
                </div>

                <div className="flex gap-3">
                    <a href="/admin/qr" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors border border-white/20 px-4 py-2 rounded-lg text-sm font-medium">
                        <QrCode size={16} /> Get QR Code
                    </a>
                    <a href="/api/admin/zip" className="flex items-center gap-2 bg-[#facc15] text-[#2a0a2f] hover:bg-[#eab308] transition-colors shadow-lg px-4 py-2 rounded-lg text-sm font-bold">
                        <Download size={16} /> Download All (ZIP)
                    </a>
                </div>
            </header>

            <section className="p-6 max-w-7xl mx-auto">
                {photos.length === 0 ? (
                    <div className="text-center text-white/40 mt-20">No photos in the system.</div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {photos.map(photo => (
                            <div key={photo.id} className="relative group overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-lg">
                                <img src={photo.filename} alt="User Upload" className="w-full h-48 object-cover" loading="lazy" />

                                <div className="absolute inset-0 bg-[#2a0a2f]/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                                    <p className="text-[10px] text-white/50 mb-2 truncate w-full text-center" title={photo.id}>ID: {photo.id.substring(0, 8)}...</p>
                                    <button
                                        onClick={() => handleDelete(photo.id)}
                                        className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95"
                                        title="Delete Permanently"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
