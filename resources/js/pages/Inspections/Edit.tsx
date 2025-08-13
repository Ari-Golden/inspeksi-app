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
import { Inspection } from './types';

interface CompressedFile {
    file: File;
    name: string;
    size: number;
    url: string;
}

interface ExistingPhoto {
    id: number;
    url: string;
}

export default function EditInspection({ inspection, customers, assets }: PageProps<{ inspection: Inspection, customers: Customer[], assets: Asset[] }>) {
    const { data, setData, post, processing, errors } = useForm<{
        customer_id: string;
        asset_id: string;
        location: string;
        condition: string;
        estimate_cost: string;
        finding: string;
        analysis: string;
        recommendation: string;
        photos_before: File[];
        components: {
            id?: number;
            name: string;
            function: string;
            condition: string;
            check_results: string;
            photos_component: CompressedFile[];
            photos_check: CompressedFile[];
            existing_photos_component: ExistingPhoto[];
            existing_photos_check: ExistingPhoto[];
            _delete_photos_component: number[];
            _delete_photos_check: number[];
        }[];
        _delete_components: number[];
        _delete_photos_before: number[];
        _method: 'put';
    }>({
        customer_id: inspection.customer_id.toString(),
        asset_id: inspection.asset_id?.toString() || '',
        location: inspection.location,
        condition: inspection.condition,
        estimate_cost: inspection.estimate_cost || '',
        finding: inspection.finding,
        analysis: inspection.analysis || '',
        recommendation: inspection.recommendation || '',
        photos_before: [],
        components: inspection.components.map(comp => ({
            id: comp.id,
            name: comp.name,
            function: comp.function,
            condition: comp.condition,
            check_results: comp.check_results,
            photos_component: [],
            photos_check: [],
            existing_photos_component: comp.photos_component || [],
            existing_photos_check: comp.photos_check || [],
            _delete_photos_component: [],
            _delete_photos_check: [],
        })),
        _delete_components: [],
        _delete_photos_before: [],
        _method: 'put',
    });

    const [selectedCustomerLocation, setSelectedCustomerLocation] = useState<string | null>(null);
    const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
    const [compressedPhotosBefore, setCompressedPhotosBefore] = useState<CompressedFile[]>([]);
    const [notice, setNotice] = useState('');

    // Update data when compressed photos change
    useEffect(() => {
        setData('photos_before', compressedPhotosBefore.map(f => f.file));
    }, [compressedPhotosBefore]);

    // Update customer location and filter assets
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

    // Update location based on selected asset or customer
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

    // Compress image
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

    // Load image from file
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

    // Handle new photo upload (inspection level)
    const handleFileChange = (setter: React.Dispatch<React.SetStateAction<CompressedFile[]>>) => async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []).slice(0, 9);
        if (files.length === 0) return;

        setNotice("Mengkompres foto... tunggu sebentar (tergantung ukuran & jumlah foto).");

        const newCompressedFiles: CompressedFile[] = [];
        for (const f of files) {
            try {
                const compressed = await compressImageFile(f, 1400, 0.75);
                const name = f.name || `photo-${Date.now()}.jpg`;
                const fileObj = compressed instanceof Blob ? new File([compressed], name, { type: "image/jpeg" }) : f;
                const url = URL.createObjectURL(fileObj);
                newCompressedFiles.push({ file: fileObj, name, size: fileObj.size, url });
            } catch (err) {
                console.error("Error compressing image", err);
            }
        }

        setter(prev => [...prev, ...newCompressedFiles]);
        setNotice('');
    };

    // Remove new photo (not yet saved)
    const removeNewImage = (setter: React.Dispatch<React.SetStateAction<CompressedFile[]>>) => (index: number) => {
        setter(prev => {
            URL.revokeObjectURL(prev[index].url);
            return prev.filter((_, i) => i !== index);
        });
    };

    // Remove existing photo and mark for deletion
    const removeExistingImage = (
        photoId: number,
        deleteKey: '_delete_photos_before' | '_delete_photos_component' | '_delete_photos_check',
        componentIndex?: number
    ) => {
        if (componentIndex !== undefined) {
            setData(prevData => ({
                ...prevData,
                components: prevData.components.map((comp, i) =>
                    i === componentIndex
                        ? {
                            ...comp,
                            existing_photos_component: comp.existing_photos_component.filter(photo => photo.id !== photoId),
                            existing_photos_check: comp.existing_photos_check.filter(photo => photo.id !== photoId),
                            _delete_photos_component: [...comp._delete_photos_component, photoId],
                            _delete_photos_check: [...comp._delete_photos_check, photoId],
                        }
                        : comp
                ),
            }));
        } else {
            setData('_delete_photos_before', [...data._delete_photos_before, photoId]);
            setCompressedPhotosBefore(prev => prev.filter(photo => !(photo as any).id && photo)); // Hanya hapus preview jika bukan existing
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    // Add new component
    const handleAddComponent = () => {
        setData(prevData => ({
            ...prevData,
            components: [
                ...prevData.components,
                {
                    id: undefined,
                    name: '',
                    function: '',
                    condition: '',
                    check_results: '',
                    photos_component: [],
                    photos_check: [],
                    existing_photos_component: [],
                    existing_photos_check: [],
                    _delete_photos_component: [],
                    _delete_photos_check: [],
                },
            ],
        }));
    };

    // Remove component (mark for deletion if has ID)
    const handleRemoveComponent = (index: number) => {
        setData(prevData => {
            const componentToRemove = prevData.components[index];
            const newDeleteComponents = componentToRemove.id
                ? [...prevData._delete_components, componentToRemove.id]
                : prevData._delete_components;

            return {
                ...prevData,
                components: prevData.components.filter((_, i) => i !== index),
                _delete_components: newDeleteComponents,
            };
        });
    };

    // Update component field
    const handleComponentChange = (componentIndex: number, field: string, value: string) => {
        setData(prevData => ({
            ...prevData,
            components: prevData.components.map((comp, i) =>
                i === componentIndex ? { ...comp, [field]: value } : comp
            ),
        }));
    };

    // Handle component photo upload
    const handleComponentFileChange = (componentIndex: number, photoType: 'photos_component' | 'photos_check') => async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []).slice(0, 9);
        if (files.length === 0) return;

        setNotice("Mengkompres foto... tunggu sebentar.");

        const newCompressedFiles: CompressedFile[] = [];
        for (const f of files) {
            try {
                const compressed = await compressImageFile(f, 1400, 0.75);
                const name = f.name || `photo-${Date.now()}.jpg`;
                const fileObj = compressed instanceof Blob ? new File([compressed], name, { type: "image/jpeg" }) : f;
                const url = URL.createObjectURL(fileObj);
                newCompressedFiles.push({ file: fileObj, name, size: fileObj.size, url });
            } catch (err) {
                console.error("Error compressing image", err);
            }
        }

        setData(prevData => ({
            ...prevData,
            components: prevData.components.map((comp, i) =>
                i === componentIndex
                    ? { ...comp, [photoType]: [...comp[photoType], ...newCompressedFiles] }
                    : comp
            ),
        }));
        setNotice('');
    };

    // Remove new component photo
    const handleRemoveComponentImage = (componentIndex: number, photoType: 'photos_component' | 'photos_check', imageIndex: number) => {
        setData(prevData => ({
            ...prevData,
            components: prevData.components.map((comp, i) =>
                i === componentIndex
                    ? {
                        ...comp,
                        [photoType]: comp[photoType].filter((_, idx) => idx !== imageIndex),
                    }
                    : comp
            ),
        }));
    };

    // Remove existing component photo
    const handleRemoveExistingComponentImage = (componentIndex: number, photoType: 'existing_photos_component' | 'existing_photos_check', photoId: number) => {
        setData(prevData => ({
            ...prevData,
            components: prevData.components.map((comp, i) =>
                i === componentIndex
                    ? {
                        ...comp,
                        [photoType]: comp[photoType].filter(photo => photo.id !== photoId),
                        [`_delete_${photoType}`]: [...comp[`_delete_${photoType}`], photoId],
                    }
                    : comp
            ),
        }));
    };

    // Submit form
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('inspections.update', inspection.id));
    };

    return (
        <AppLayout breadcrumbs={[
            ...breadcrumbs,
            { title: inspection.asset ? inspection.asset.name : 'Detail Inspeksi', href: route('inspections.edit', inspection.id) }
        ]}>
            <Head title={`Edit Inspeksi: ${inspection.asset ? inspection.asset.name : 'N/A'}`} />
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-xl font-semibold">Edit Inspeksi</h1>
                    <p className="text-sm text-gray-500">Ubah data inspeksi sesuai kebutuhan.</p>

                    <form onSubmit={submit} className="mt-6 space-y-8">
                        {/* 1. Customer */}
                        <div>
                            <Label htmlFor="customer_id">1. Pilih Customer</Label>
                            <select
                                id="customer_id"
                                value={data.customer_id}
                                onChange={(e) => setData('customer_id', e.target.value)}
                                required
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
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

                        {/* 2. Photos Before */}
                        <div>
                            <Label htmlFor="photos_before">2. Foto aktual aset sebelum inspeksi</Label>
                            <Input
                                id="photos_before"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange(setCompressedPhotosBefore)}
                                className="mt-1 block w-full"
                            />
                            {errors.photos_before && <p className="text-xs text-red-500 mt-2">{errors.photos_before}</p>}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                                {inspection.photos_before?.map((photo) => (
                                    <div key={photo.id} className="relative border rounded-lg overflow-hidden">
                                        <img src={photo.url} alt="Existing" className="w-full h-32 object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(photo.id, '_delete_photos_before')}
                                            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 text-xs"
                                        >
                                            ✖
                                        </button>
                                        <div className="p-2 text-xs truncate">Existing</div>
                                    </div>
                                ))}
                                {compressedPhotosBefore.map((f, i) => (
                                    <div key={i} className="relative border rounded-lg overflow-hidden">
                                        <img src={f.url} alt={f.name} className="w-full h-32 object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(setCompressedPhotosBefore)(i)}
                                            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 text-xs"
                                        >
                                            ✖
                                        </button>
                                        <div className="p-2 text-xs">
                                            <p className="truncate">{f.name}</p>
                                            <p className="text-gray-500">{formatBytes(f.size)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Asset */}
                        <div>
                            <Label htmlFor="asset_id">3. Pilih Aset</Label>
                            <select
                                id="asset_id"
                                value={data.asset_id}
                                onChange={(e) => setData('asset_id', e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                            >
                                <option value="">Pilih Aset (Opsional)</option>
                                {filteredAssets.map((asset) => (
                                    <option key={asset.id} value={asset.id}>
                                        {asset.name} ({asset.code})
                                    </option>
                                ))}
                            </select>
                            {errors.asset_id && <p className="text-xs text-red-500 mt-2">{errors.asset_id}</p>}
                            <p className="text-sm text-gray-600 mt-2">Jika tidak ada aset, isi lokasi secara manual.</p>
                        </div>

                        {/* Lokasi */}
                        <div>
                            <Label htmlFor="location">Lokasi Aset</Label>
                            <Input
                                id="location"
                                type="text"
                                value={data.location}
                                onChange={(e) => setData('location', e.target.value)}
                                required
                                className="mt-1 block w-full"
                            />
                            {errors.location && <p className="text-xs text-red-500 mt-2">{errors.location}</p>}
                        </div>

                        {/* 4. Components */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2">4. Detail Komponen</h3>
                            {data.components.map((component, componentIndex) => (
                                <div key={component.id || `new-${componentIndex}`} className="border p-4 rounded-md mb-4 relative">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleRemoveComponent(componentIndex)}
                                        className="absolute top-2 right-2"
                                    >
                                        Hapus
                                    </Button>
                                    <h4 className="font-medium mb-2">Komponen #{componentIndex + 1}</h4>

                                    <div className="space-y-4">
                                        <div>
                                            <Label>Nama Komponen</Label>
                                            <Input
                                                value={component.name}
                                                onChange={(e) => handleComponentChange(componentIndex, 'name', e.target.value)}
                                                required
                                            />
                                            {errors[`components.${componentIndex}.name`] && <p className="text-xs text-red-500">{errors[`components.${componentIndex}.name`]}</p>}
                                        </div>

                                        <div>
                                            <Label>Fungsi Komponen</Label>
                                            <Input
                                                value={component.function}
                                                onChange={(e) => handleComponentChange(componentIndex, 'function', e.target.value)}
                                                required
                                            />
                                            {errors[`components.${componentIndex}.function`] && <p className="text-xs text-red-500">{errors[`components.${componentIndex}.function`]}</p>}
                                        </div>

                                        <div>
                                            <Label>Kondisi Komponen</Label>
                                            <Textarea
                                                value={component.condition}
                                                onChange={(e) => handleComponentChange(componentIndex, 'condition', e.target.value)}
                                                required
                                            />
                                            {errors[`components.${componentIndex}.condition`] && <p className="text-xs text-red-500">{errors[`components.${componentIndex}.condition`]}</p>}
                                        </div>

                                        <div>
                                            <Label>Hasil Pengecekan</Label>
                                            <Textarea
                                                value={component.check_results}
                                                onChange={(e) => handleComponentChange(componentIndex, 'check_results', e.target.value)}
                                                required
                                            />
                                            {errors[`components.${componentIndex}.check_results`] && <p className="text-xs text-red-500">{errors[`components.${componentIndex}.check_results`]}</p>}
                                        </div>

                                        {/* Foto Komponen */}
                                        <div>
                                            <Label>Foto Komponen</Label>
                                            <Input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleComponentFileChange(componentIndex, 'photos_component')}
                                            />
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                                                {component.existing_photos_component.map((photo) => (
                                                    <div key={photo.id} className="relative border rounded overflow-hidden">
                                                        <img src={photo.url} alt="Comp" className="w-full h-24 object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveExistingComponentImage(componentIndex, 'existing_photos_component', photo.id)}
                                                            className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded p-0.5 text-xs"
                                                        >
                                                            ✖
                                                        </button>
                                                    </div>
                                                ))}
                                                {component.photos_component.map((f, i) => (
                                                    <div key={i} className="relative border rounded overflow-hidden">
                                                        <img src={f.url} alt={f.name} className="w-full h-24 object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveComponentImage(componentIndex, 'photos_component', i)}
                                                            className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded p-0.5 text-xs"
                                                        >
                                                            ✖
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Foto Pengecekan */}
                                        <div>
                                            <Label>Foto Pengecekan</Label>
                                            <Input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleComponentFileChange(componentIndex, 'photos_check')}
                                            />
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                                                {component.existing_photos_check.map((photo) => (
                                                    <div key={photo.id} className="relative border rounded overflow-hidden">
                                                        <img src={photo.url} alt="Check" className="w-full h-24 object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveExistingComponentImage(componentIndex, 'existing_photos_check', photo.id)}
                                                            className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded p-0.5 text-xs"
                                                        >
                                                            ✖
                                                        </button>
                                                    </div>
                                                ))}
                                                {component.photos_check.map((f, i) => (
                                                    <div key={i} className="relative border rounded overflow-hidden">
                                                        <img src={f.url} alt={f.name} className="w-full h-24 object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveComponentImage(componentIndex, 'photos_check', i)}
                                                            className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded p-0.5 text-xs"
                                                        >
                                                            ✖
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button type="button" onClick={handleAddComponent}>+ Tambah Komponen</Button>
                        </div>

                        {/* 5. Temuan */}
                        <div>
                            <Label>5. Temuan</Label>
                            <Textarea
                                value={data.finding}
                                onChange={(e) => setData('finding', e.target.value)}
                                required
                            />
                            {errors.finding && <p className="text-xs text-red-500">{errors.finding}</p>}
                        </div>

                        {/* 6. Analisis */}
                        <div>
                            <Label>6. Analisa Penyebab</Label>
                            <Textarea
                                value={data.analysis}
                                onChange={(e) => setData('analysis', e.target.value)}
                            />
                            {errors.analysis && <p className="text-xs text-red-500">{errors.analysis}</p>}
                        </div>

                        {/* 7. Rekomendasi */}
                        <div>
                            <Label>7. Rekomendasi</Label>
                            <Textarea
                                value={data.recommendation}
                                onChange={(e) => setData('recommendation', e.target.value)}
                            />
                            {errors.recommendation && <p className="text-xs text-red-500">{errors.recommendation}</p>}
                        </div>

                        {notice && (
                            <div className="p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded">
                                {notice}
                            </div>
                        )}

                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Mengupdate...' : 'Update Inspeksi'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

// Breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Inspections',
        href: route('inspections.index'),
    },
];