import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { PageProps, BreadcrumbItem } from '@/types';
import { Customer } from '@/pages/Customers/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Assets',
        href: route('assets.index'),
    },
    {
        title: 'Tambah Asset',
        href: route('assets.create'),
    },
];

interface CompressedFile {
    file: File;
    name: string;
    size: number;
    url: string;
}

export default function CreateAsset({ customers }: PageProps<{ customers: Customer[] }>) {
    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        name: '',
        code: '',
        location: '',
        note: '',
        photos: [] as File[],
    });

    const [compressedFiles, setCompressedFiles] = useState<CompressedFile[]>([]);
    const [notice, setNotice] = useState('');

    useEffect(() => {
        setData('photos', compressedFiles.map(f => f.file));
    }, [compressedFiles]);

    async function compressImageFile(
        file: File,
        maxWidthOrHeight = 1600,
        quality = 0.74
    ): Promise<Blob | File> {
        if (!file.type.startsWith("image/")) return file;
        if (file.size <= 500 * 1024) return file;

        const img = await loadImageFromFile(file);
        const { width, height } = img;
        let targetW = width, targetH = height;
        if (Math.max(width, height) > maxWidthOrHeight) {
            const ratio = width > height ? maxWidthOrHeight / width : maxWidthOrHeight / height;
            targetW = Math.round(width * ratio);
            targetH = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");
        if (!ctx) return file;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, targetW, targetH);

        let blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, "image/jpeg", quality)
        );

        if (blob && blob.size > 1200 * 1024) {
            blob = await new Promise<Blob | null>((resolve) =>
                canvas.toBlob(resolve, "image/jpeg", Math.max(0.5, quality - 0.2))
            );
        }
        return blob || file;
    }

    function loadImageFromFile(file: File): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve(img);
            };
            img.onerror = (e) => {
                URL.revokeObjectURL(url);
                reject(e);
            };
            img.src = url;
        });
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []).slice(0, 9);
        if (files.length === 0) return;

        setNotice("Mengkompres foto... tunggu sebentar (tergantung ukuran & jumlah foto).");

        const newCompressedFiles: CompressedFile[] = [];
        for (const f of files) {
            try {
                const compressed = await compressImageFile(f, 1400, 0.75);
                const name = f.name || "photo-" + Date.now() + ".jpg";
                const fileObj = compressed instanceof Blob ? new File([compressed], name, { type: "image/jpeg" }) : f;
                const url = URL.createObjectURL(fileObj);
                newCompressedFiles.push({
                    file: fileObj,
                    name,
                    size: fileObj.size,
                    url,
                });
            } catch (err) {
                console.error("compress error", err);
            }
        }
        setCompressedFiles(prev => [...prev, ...newCompressedFiles]);
        setNotice('');
    };

    const removeImage = (index: number) => {
        const file = compressedFiles[index];
        URL.revokeObjectURL(file.url);
        setCompressedFiles(prev => prev.filter((_, i) => i !== index));
    }

    const formatBytes = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('assets.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Asset" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <form onSubmit={submit}>
                                <div className="mb-4">
                                    <Label htmlFor="customer_id">Customer</Label>
                                    <select
                                        id="customer_id"
                                        value={data.customer_id}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('customer_id', e.target.value)}
                                        required
                                    >
                                        <option value="">Pilih Customer</option>
                                        {customers.map((customer) => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.customer_id && <p className="text-xs text-red-500 mt-2">{errors.customer_id}</p>}
                                </div>

                                <div className="mb-4">
                                    <Label htmlFor="name">Nama Asset</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    {errors.name && <p className="text-xs text-red-500 mt-2">{errors.name}</p>}
                                </div>

                                <div className="mb-4">
                                    <Label htmlFor="code">Kode Asset</Label>
                                    <Input
                                        id="code"
                                        type="text"
                                        value={data.code}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('code', e.target.value)}
                                    />
                                    {errors.code && <p className="text-xs text-red-500 mt-2">{errors.code}</p>}
                                </div>

                                <div className="mb-4">
                                    <Label htmlFor="location">Lokasi Asset</Label>
                                    <Input
                                        id="location"
                                        type="text"
                                        value={data.location}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('location', e.target.value)}
                                        required
                                    />
                                    {errors.location && <p className="text-xs text-red-500 mt-2">{errors.location}</p>}
                                </div>

                                <div className="mb-4">
                                    <Label htmlFor="note">Note</Label>
                                    <Textarea
                                        id="note"
                                        value={data.note}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('note', e.target.value)}
                                    />
                                    {errors.note && <p className="text-xs text-red-500 mt-2">{errors.note}</p>}
                                </div>

                                <div className="mb-4">
                                    <Label htmlFor="photos">Foto Asset</Label>
                                    <Input
                                        id="photos"
                                        type="file"
                                        multiple
                                        className="mt-1 block w-full"
                                        onChange={handleFileChange}
                                    />
                                    {errors.photos && <p className="text-xs text-red-500 mt-2">{errors.photos}</p>}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {compressedFiles.map((f, i) => (
                                        <div key={i} className="relative border rounded-lg overflow-hidden">
                                            <img src={f.url} alt={f.name} className="w-full h-32 object-cover" />
                                            <button type="button" onClick={() => removeImage(i)} className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 text-xs">✖</button>
                                            <div className="p-2 text-xs">
                                                <p className="truncate">{f.name}</p>
                                                <p className="text-gray-500">{formatBytes(f.size)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {notice && <div className="p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md">{notice}</div>}

                                <div className="flex items-center justify-end mt-4">
                                    <Button className="ml-4" disabled={processing}>
                                        Simpan
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
