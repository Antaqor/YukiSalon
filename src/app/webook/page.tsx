"use client";

import { useState, ChangeEvent, FormEvent } from 'react';

export default function WebhookUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<string>('');

    // Handle file selection
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setStatus(`✅ Файл сонгогдлоо: ${e.target.files[0].name}`);
        }
    };

    // Handle form submission and file upload
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) {
            setStatus('❌ Файл сонгогдоогүй байна.');
            return;
        }

        setStatus('Байршуулж байна...');
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch('https://hook.eu2.make.com/8wkp9tfkv74n1572n2008sjbljukwfer', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                setStatus('✅ Амжилттай илгээгдлээ!');
                setFile(null);
            } else {
                console.error('Response error:', res);
                setStatus(`❌ Алдаа гарлаа: ${res.status} - ${res.statusText}`);
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            setStatus(`❌ Алдаа гарлаа: ${error.message || error}`);
        }
    };

    return (
        <div
            style={{
                background: '#f0f2f5',
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2rem',
            }}
        >
            <div
                style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '3rem',
                    textAlign: 'center',
                    width: '100%',
                    maxWidth: '500px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                }}
            >
                <h2
                    style={{
                        color: '#333',
                        fontFamily: "'Helvetica Neue', sans-serif",
                        fontSize: '1.5rem',
                        marginBottom: '1.5rem',
                    }}
                >
                    Bro, ЗУРАГАА ОРУУЛ! Тэгээд ГАЙХАМШАГИЙГ МЭДЭР 😤✨
                </h2>
                <form
                    onSubmit={handleSubmit}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                    }}
                >
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{
                            padding: '1rem',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            background: '#f9f9f9',
                            color: '#333',
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            padding: '1rem',
                            backgroundColor: '#e82127',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'transform 0.2s',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        Байршуулах
                    </button>
                </form>
                {file && (
                    <p style={{ marginTop: '1rem', color: '#555' }}>
                        Сонгосон файл: {file.name}
                    </p>
                )}
                {status && (
                    <p style={{ marginTop: '1rem', color: '#555' }}>
                        {status}
                    </p>
                )}
            </div>
        </div>
    );
}
