"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "react-qr-code";

export default function AdminQR() {
    const [url, setUrl] = useState("");
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // default to the current window location origin
        setUrl(window.location.origin);
    }, []);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-10 print:bg-white print:py-0">

            <div className="mb-6 print:hidden bg-white p-4 rounded-lg shadow-md flex gap-4 items-center">
                <label className="font-medium text-gray-700">App URL:</label>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="border px-3 py-2 rounded text-black w-64"
                />
                <button
                    onClick={handlePrint}
                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                >
                    Print QR Code
                </button>
            </div>

            <div
                ref={printRef}
                className="bg-white w-[210mm] min-h-[297mm] shadow-2xl print:shadow-none flex flex-col items-center justify-center p-12 text-center border box-border print:border-none print:w-full print:min-h-full"
            >
                <div className="border-4 border-blue-900 p-16 rounded-3xl flex flex-col items-center max-w-2xl bg-slate-50">
                    <h1 className="text-5xl font-playfair font-bold text-blue-900 mb-16 tracking-wider uppercase">
                        Ramadan Iftar
                    </h1>

                    <div className="bg-white p-6 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.2)] mb-12">
                        <QRCode
                            value={url || "https://example.com"}
                            size={300}
                            fgColor="#1e3a8a"
                            bgColor="#FFFFFF"
                            level="H"
                        />
                    </div>

                    <h2 className="text-3xl font-playfair font-medium text-slate-800 max-w-lg leading-relaxed mb-4">
                        Scan to Capture, Share & Download
                    </h2>
                    <h3 className="text-3xl font-playfair font-bold text-blue-600 italic">
                        Tonight's Memories
                    </h3>
                </div>
            </div>

        </div>
    );
}
