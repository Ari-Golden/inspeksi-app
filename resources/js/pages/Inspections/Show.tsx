import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Inspection } from './types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Inspections', href: route('inspections.index') },
    { title: 'Detail Inspeksi', href: '#' },
];

export default function ShowInspection({ inspection }: PageProps<{ inspection: Inspection }>) {
    // ... kode lainnya

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Inspeksi" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-card shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-200 bg-card p-6">
                            {/* Title and Edit Button */}
                            <div className="mb-4 flex items-center justify-between">
                                <h1 className="text-2xl font-semibold text-foreground">Detail Inspeksi: {inspection.asset ? inspection.asset.name : 'N/A'}</h1>
                                <Link href={route('inspections.edit', inspection.id)}>
                                    <Button>Edit Inspeksi</Button>
                                </Link>
                            </div>

                            {/* General Info */}
                            <section className="mb-6 space-y-1 text-gray-600">
                                <p>
                                    <strong>Customer:</strong> {inspection.customer.name}
                                </p>
                                <p>
                                    <strong>Inspected By:</strong> {inspection.user.name}
                                </p>
                                {inspection.estimate_cost && (
                                    <p>
                                        <strong>Estimate Cost:</strong> {inspection.estimate_cost}
                                    </p>
                                )}
                            </section>

                            {/* Foto Unit Aset */}
                            {((inspection.photosBefore ?? []).length || (inspection.components ?? []).length) && (
                                <section className="mb-6">
                                    <h2 className="mb-3 text-xl font-semibold">Foto Unit Aset</h2>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {/* Left: Photos */}
                                        <div>
                                            <h3 className="mb-2 text-lg font-medium">Foto Sebelum Inspeksi</h3>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
                                                {inspection.photosBefore.map((photo) => (
                                                    <div
                                                        key={photo.id}
                                                        className="relative aspect-[16/9] overflow-hidden rounded-lg border bg-gray-100"
                                                    >
                                                        <img
                                                            src={photo.url}
                                                            alt={`Foto ${photo.type}`}
                                                            className="absolute inset-0 h-full w-full object-cover"
                                                        />
                                                        <p className="bg-opacity-50 absolute inset-x-0 bottom-0 truncate bg-black p-2 text-sm text-white">
                                                            Tipe: {photo.type}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Right: Asset Details */}
                                        <div>
                                            <h3 className="mb-2 text-lg font-medium">Keterangan Aset</h3>
                                            <div className="space-y-1 text-gray-600">
                                                {inspection.asset && (
                                                    <p>
                                                        <strong>Asset Code:</strong> {inspection.asset.code}
                                                    </p>
                                                )}
                                                <p>
                                                    <strong>Location:</strong> {inspection.location}
                                                </p>
                                                <p>
                                                    <strong>Condition:</strong> {inspection.condition}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Components Section */}
                            {inspection.components && inspection.components.length > 0 && (
                                <section className="mb-6">
                                    <h2 className="mb-3 text-xl font-semibold">Detail Komponen</h2>
                                    {inspection.components.map((component, index) => (
                                        <div key={component.id || index} className="mb-6 rounded-lg border p-4">
                                            <h3 className="mb-2 text-lg font-medium">Komponen: {component.name}</h3>
                                            <div className="space-y-1 text-gray-600 mb-4">
                                                <p><strong>Fungsi:</strong> {component.function}</p>
                                                <p><strong>Kondisi:</strong> {component.condition}</p>
                                                <p><strong>Hasil Pengecekan:</strong> {component.check_results}</p>
                                            </div>

                                            {/* Photos for this component */}
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                {component.photosComponent && component.photosComponent.length > 0 && (
                                                    <div>
                                                        <h4 className="mb-2 text-md font-medium">Foto Komponen</h4>
                                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
                                                            {component.photosComponent.map((photo) => (
                                                                <div key={photo.id} className="relative aspect-[16/9] overflow-hidden rounded-lg border bg-gray-100">
                                                                    <img src={photo.url} alt={`Foto ${photo.type}`} className="absolute inset-0 h-full w-full object-cover" />
                                                                    <p className="bg-opacity-50 absolute inset-x-0 bottom-0 truncate bg-black p-2 text-sm text-white">Tipe: {photo.type}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {component.photosCheck && component.photosCheck.length > 0 && (
                                                    <div>
                                                        <h4 className="mb-2 text-md font-medium">Foto Pengecekan</h4>
                                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
                                                            {component.photosCheck.map((photo) => (
                                                                <div key={photo.id} className="relative aspect-[16/9] overflow-hidden rounded-lg border bg-gray-100">
                                                                    <img src={photo.url} alt={`Foto ${photo.type}`} className="absolute inset-0 h-full w-full object-cover" />
                                                                    <p className="bg-opacity-50 absolute inset-x-0 bottom-0 truncate bg-black p-2 text-sm text-white">Tipe: {photo.type}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </section>
                            )}

                            {/* Hasil Inspeksi (General Findings) */}
                            <section>
                                <h2 className="mb-3 text-xl font-semibold">Hasil Inspeksi (Temuan Umum)</h2>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-lg font-medium">Temuan:</h4>
                                        <p className="text-gray-700">{inspection.finding}</p>
                                    </div>
                                    {inspection.analysis && (
                                        <div>
                                            <h4 className="text-lg font-medium">Analisa:</h4>
                                            <p className="text-gray-700">{inspection.analysis}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Rekomendasi */}
                                {inspection.recommendation && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-medium">Rekomendasi:</h3>
                                        <p className="text-gray-700">{inspection.recommendation}</p>
                                    </div>
                                )}
                            </section>

                            {/* Tidak ada foto atau komponen */}
                            {!((inspection.photosBefore ?? []).length || (inspection.components ?? []).length) && <p className="mb-6 text-gray-500">Tidak ada foto atau komponen tersedia untuk inspeksi ini.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
