import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { PageProps, BreadcrumbItem } from '@/types';
import { Customer } from '@/pages/Customers/types';
import { Asset } from '@/pages/Assets/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Tambah Inspeksi',
        href: route('inspections.create'),
    },
];

interface CompressedFile {
    file: File;
    name: string;
    size: number;
    url: string;
}

export default function CreateInspection({ customers, assets }: PageProps<{ customers: Customer[], assets: Asset[] }>) {
    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        asset_id: '',
        location: '',
        condition: 'baik',
        estimate_cost: '',
        finding: '',
        analysis: '',
        recommendation: '',
        photos_before: [] as File[],
        components: [] as { 
            name: string; 
            function: string; 
            condition: string; 
            check_results: string; 
            photos_component: File[]; 
            photos_check: File[]; 
        }[],
    });

    const [selectedCustomerLocation, setSelectedCustomerLocation] = useState<string | null>(null);
    const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);

    const [compressedPhotosBefore, setCompressedPhotosBefore] = useState<CompressedFile[]>([]);
    const [compressedPhotosComponent, setCompressedPhotosComponent] = useState<CompressedFile[]>([]);
    const [compressedPhotosCheck, setCompressedPhotosCheck] = useState<CompressedFile[]>([]);

    const [notice, setNotice] = useState('');

    useEffect(() => {
        setData('photos_before', compressedPhotosBefore.map(f => f.file));
    }, [compressedPhotosBefore]);

    useEffect(() => {
        if (data.customer_id) {
            const customer = customers.find(c => c.id.toString() === data.customer_id);
            if (customer) {
                setSelectedCustomerLocation(customer.location);
                setFilteredAssets(assets.filter(a => a.customer_id.toString() === data.customer_id));
            }
        } else {
            setSelectedCustomerLocation(null);
            setFilteredAssets([]);
            setData('asset_id', '');
        }
    }, [data.customer_id, customers, assets]);

    useEffect(() => {
        if (data.asset_id) {
            const asset = filteredAssets.find(a => a.id.toString() === data.asset_id);
            if (asset && asset.location) {
                setData('location', asset.location);
            } else {
                setData('location', selectedCustomerLocation || '');
            }
        } else {
            setData('location', selectedCustomerLocation || '');
        }
    }, [data.asset_id, filteredAssets, selectedCustomerLocation]);

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

    const handleFileChange = (setter: (files: CompressedFile[]) => void) => async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setter(prev => [...prev, ...newCompressedFiles]);
        setNotice('');
    };

    const removeImage = (setter: (index: number) => void) => (index: number) => {
        setter(prev => {
            const file = prev[index];
            URL.revokeObjectURL(file.url);
            return prev.filter((_, i) => i !== index);
        });
    }

    const formatBytes = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }

    const handleAddComponent = () => {
        setData(prevData => ({
            ...prevData,
            components: [
                ...prevData.components,
                {
                    name: '',
                    function: '',
                    condition: '',
                    check_results: '',
                    photos_component: [],
                    photos_check: [],
                },
            ],
        }));
    };

    const handleRemoveComponent = (index: number) => {
        setData(prevData => ({
            ...prevData,
            components: prevData.components.filter((_, i) => i !== index),
        }));
    };

    const handleComponentChange = (componentIndex: number, field: string, value: string) => {
        setData(prevData => ({
            ...prevData,
            components: prevData.components.map((comp, i) =>
                i === componentIndex ? { ...comp, [field]: value } : comp
            ),
        }));
    };

    const handleComponentFileChange = (componentIndex: number, photoType: 'photos_component' | 'photos_check') => async (e: React.ChangeEvent<HTMLInputElement>) => {
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

        setData(prevData => ({
            ...prevData,
            components: prevData.components.map((comp, i) =>
                i === componentIndex ? { ...comp, [photoType]: [...comp[photoType], ...newCompressedFiles] } : comp
            ),
        }));
        setNotice('');
    };

    const handleRemoveComponentImage = (componentIndex: number, photoType: 'photos_component' | 'photos_check', imageIndex: number) => {
        setData(prevData => ({
            ...prevData,
            components: prevData.components.map((comp, i) =>
                i === componentIndex
                    ? {
                          ...comp,
                          [photoType]: comp[photoType].filter((_, imgIdx) => imgIdx !== imageIndex),
                      }
                    : comp
            ),
        }));
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('inspections.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Form Inspeksi" />
            <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-xl font-semibold">Form Inspeksi</h1>
                    <p className="text-sm text-gray-500">Isi data inspeksi sesuai langkah-langkah berikut.</p>

                    <form onSubmit={submit} className="mt-6 space-y-6">
                        {/* Langkah 1: Pilih Customer */}
                        <div>
                            <Label htmlFor="customer_id">1. Pilih Customer</Label>
                            <select
                                id="customer_id"
                                value={data.customer_id}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
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
                            {selectedCustomerLocation && (
                                <p className="text-sm text-gray-600 mt-2">Lokasi Customer: {selectedCustomerLocation}</p>
                            )}
                        </div>

                        {/* Langkah 2: Foto Aktual Aset Sebelum Pembongkaran */}
                        <div>
                            <Label htmlFor="photos_before">2. Foto aktual aset sebelum melakukan pembongkaran/inspeksi (foto utuh, name plate, merk dll)</Label>
                            <Input
                                id="photos_before"
                                type="file"
                                multiple
                                className="mt-1 block w-full"
                                onChange={handleFileChange(setCompressedPhotosBefore)}
                            />
                            {errors.photos_before && <p className="text-xs text-red-500 mt-2">{errors.photos_before}</p>}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                                {compressedPhotosBefore.map((f, i) => (
                                    <div key={i} className="relative border rounded-lg overflow-hidden">
                                        <img src={f.url} alt={f.name} className="w-full h-32 object-cover" />
                                        <button type="button" onClick={() => removeImage(setCompressedPhotosBefore)(i)} className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 text-xs">✖</button>
                                        <div className="p-2 text-xs">
                                            <p className="truncate">{f.name}</p>
                                            <p className="text-gray-500">{formatBytes(f.size)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Langkah 3: Pilih Aset */}
                        <div>
                            <Label htmlFor="asset_id">3. Pilih Aset berdasarkan ID Customer</Label>
                            <select
                                id="asset_id"
                                value={data.asset_id}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                                onChange={(e) => setData('asset_id', e.target.value)}
                            >
                                <option value="">Pilih Aset (Opsional)</option>
                                {filteredAssets.map((asset) => (
                                    <option key={asset.id} value={asset.id}>
                                        {asset.name} ({asset.code})
                                    </option>
                                ))}
                            </select>
                            {errors.asset_id && <p className="text-xs text-red-500 mt-2">{errors.asset_id}</p>}
                            <p className="text-sm text-gray-600 mt-2">Jika tidak ada aset, inspektor wajib mengisi lokasi aset di bawah.</p>
                        </div>

                        {/* Lokasi Aset (jika tidak dipilih dari dropdown) */}
                        <div>
                            <Label htmlFor="location">Lokasi Aset (Contoh: Gedung A Lantai 2)</Label>
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

                        

                        {/* Langkah 4: Komponen Inspeksi */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2">4. Detail Komponen</h3>
                            {data.components.map((component, componentIndex) => (
                                <div key={componentIndex} className="border p-4 rounded-md mb-4 relative">
                                    <Button
                                        type="button"
                                        onClick={() => handleRemoveComponent(componentIndex)}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                                    >
                                        ✖
                                    </Button>
                                    <h4 className="font-medium mb-2">Komponen #{componentIndex + 1}</h4>

                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor={`components-${componentIndex}-name`}>Nama Komponen</Label>
                                            <Input
                                                id={`components-${componentIndex}-name`}
                                                type="text"
                                                value={component.name}
                                                className="mt-1 block w-full"
                                                onChange={(e) => handleComponentChange(componentIndex, 'name', e.target.value)}
                                                required
                                            />
                                            {errors[`components.${componentIndex}.name`] && <p className="text-xs text-red-500 mt-2">{errors[`components.${componentIndex}.name`]}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor={`components-${componentIndex}-function`}>Fungsi Komponen</Label>
                                            <Input
                                                id={`components-${componentIndex}-function`}
                                                type="text"
                                                value={component.function}
                                                className="mt-1 block w-full"
                                                onChange={(e) => handleComponentChange(componentIndex, 'function', e.target.value)}
                                                required
                                            />
                                            {errors[`components.${componentIndex}.function`] && <p className="text-xs text-red-500 mt-2">{errors[`components.${componentIndex}.function`]}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor={`components-${componentIndex}-condition`}>Kondisi Komponen</Label>
                                            <Textarea
                                                id={`components-${componentIndex}-condition`}
                                                value={component.condition}
                                                className="mt-1 block w-full"
                                                onChange={(e) => handleComponentChange(componentIndex, 'condition', e.target.value)}
                                                required
                                            />
                                            {errors[`components.${componentIndex}.condition`] && <p className="text-xs text-red-500 mt-2">{errors[`components.${componentIndex}.condition`]}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor={`components-${componentIndex}-check_results`}>Hasil Pengecekan</Label>
                                            <Textarea
                                                id={`components-${componentIndex}-check_results`}
                                                value={component.check_results}
                                                className="mt-1 block w-full"
                                                onChange={(e) => handleComponentChange(componentIndex, 'check_results', e.target.value)}
                                                required
                                            />
                                            {errors[`components.${componentIndex}.check_results`] && <p className="text-xs text-red-500 mt-2">{errors[`components.${componentIndex}.check_results`]}</p>}
                                        </div>

                                        {/* Photos Component */}
                                        <div>
                                            <Label htmlFor={`components-${componentIndex}-photos_component`}>Foto Komponen</Label>
                                            <Input
                                                id={`components-${componentIndex}-photos_component`}
                                                type="file"
                                                multiple
                                                className="mt-1 block w-full"
                                                onChange={handleComponentFileChange(componentIndex, 'photos_component')}
                                            />
                                            {errors[`components.${componentIndex}.photos_component`] && <p className="text-xs text-red-500 mt-2">{errors[`components.${componentIndex}.photos_component`]}</p>}
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                                                {component.photos_component.map((f, i) => (
                                                    <div key={i} className="relative border rounded-lg overflow-hidden">
                                                        <img src={f.url} alt={f.name} className="w-full h-32 object-cover" />
                                                        <button type="button" onClick={() => handleRemoveComponentImage(componentIndex, 'photos_component', i)} className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 text-xs">✖</button>
                                                        <div className="p-2 text-xs">
                                                            <p className="truncate">{f.name}</p>
                                                            <p className="text-gray-500">{formatBytes(f.size)}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Photos Check */}
                                        <div>
                                            <Label htmlFor={`components-${componentIndex}-photos_check`}>Foto Pengecekan</Label>
                                            <Input
                                                id={`components-${componentIndex}-photos_check`}
                                                type="file"
                                                multiple
                                                className="mt-1 block w-full"
                                                onChange={handleComponentFileChange(componentIndex, 'photos_check')}
                                            />
                                            {errors[`components.${componentIndex}.photos_check`] && <p className="text-xs text-red-500 mt-2">{errors[`components.${componentIndex}.photos_check`]}</p>}
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                                                {component.photos_check.map((f, i) => (
                                                    <div key={i} className="relative border rounded-lg overflow-hidden">
                                                        <img src={f.url} alt={f.name} className="w-full h-32 object-cover" />
                                                        <button type="button" onClick={() => handleRemoveComponentImage(componentIndex, 'photos_check', i)} className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 text-xs">✖</button>
                                                        <div className="p-2 text-xs">
                                                            <p className="truncate">{f.name}</p>
                                                            <p className="text-gray-500">{formatBytes(f.size)}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button type="button" onClick={handleAddComponent} className="mt-4">Tambah Komponen</Button>
                        </div>

                        {/* Langkah 5: Temuan Umum */}
                        <div>
                            <Label htmlFor="finding">5. Temuan (contoh: ditemukan kebocoran oli pada seal kompresor)</Label>
                            <Textarea
                                id="finding"
                                value={data.finding}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('finding', e.target.value)}
                                required
                            />
                            {errors.finding && <p className="text-xs text-red-500 mt-2">{errors.finding}</p>}
                        </div>

                        {/* Langkah 6: Hasil Analisa Penyebab */}
                        <div>
                            <Label htmlFor="analysis">6. Isi hasil analisa penyebab (contoh: kompresor shot body dikarenakan tegangan berlebih)</Label>
                            <Textarea
                                id="analysis"
                                value={data.analysis}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('analysis', e.target.value)}
                            />
                            {errors.analysis && <p className="text-xs text-red-500 mt-2">{errors.analysis}</p>}
                        </div>

                        {/* Langkah 7: Rekomendasi */}
                        <div>
                            <Label htmlFor="recommendation">7. Isi rekomendasi (Contoh: Kompresor masih bisa di perbaiki dngan di rewaending dengan estimasi biya 5 jt atau kompresor sudah tidak bisa di perbaiki disarankan untuk penggantian unit baru dengan estimasi harga 50jt)</Label>
                            <Textarea
                                id="recommendation"
                                value={data.recommendation}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('recommendation', e.target.value)}
                            />
                            {errors.recommendation && <p className="text-xs text-red-500 mt-2">{errors.recommendation}</p>}
                        </div>
