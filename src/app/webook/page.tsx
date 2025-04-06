'use client'

import { useState, ChangeEvent, FormEvent } from 'react';

export default function WebhookUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<string>('');

    // Файл сонгогдсон үед state-д хадгалах
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setStatus('✅ Файл сонгогдлоо: ' + e.target.files[0].name);
        }
    };

    // Форма submit хийх үед webhook руу илгээх
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) {
            setStatus('❌ Файл сонгогдоогүй байна.');
            return;
        }

        setStatus('Uploading...');
        const formData = new FormData();
        formData.append('image', file); // Make.com дээр name="image" гэж дамжуулах

        try {
            const res = await fetch(
                'https://hook.eu2.make.com/8wkp9tfkv74n1572n2008sjbljukwfer',
                {
                    method: 'POST',
                    body: formData,
                }
            );

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
        <div style={{ padding: '2rem' }}>
            <h2>📤 Upload image to Make.com Webhook</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleFileChange}
                />
                <button type="submit" style={{ marginLeft: '1rem' }}>
                    Upload
                </button>
            </form>
            {file && <p>Selected file: {file.name}</p>}
            {status && <p style={{ marginTop: '1rem' }}>{status}</p>}
        </div>
    );
}
