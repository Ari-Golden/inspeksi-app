import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { PageProps, BreadcrumbItem } from '@/types';
import { Customer } from '@/pages/Customers/types';
import { Asset } from '@/pages/Assets/types';
import { Inspection, Component, InspectionPhoto, ComponentPhoto } from '@/pages/Inspections/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Laporan Umum', href: route('reports.general') },
];

interface ReportCustomer extends Customer {
    assets: (Asset & {
        inspections: (Inspection & {
            components: (Component & {
                photos: ComponentPhoto[];
            })[];
        })[];
    })[];
}

interface GeneralReportProps {
    customers: ReportCustomer[];
}

export default function GeneralReport({ customers }: PageProps<GeneralReportProps>) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Umum Aset" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-2xl font-semibold mb-4">Laporan Umum Aset dan Komponen</h1>

                            {customers.length === 0 ? (
                                <p>Tidak ada data laporan tersedia.</p>
                            ) : (
                                <div className="space-y-8">
                                    {customers.map(customer => (
                                        <div key={customer.id} className="border p-4 rounded-lg shadow-sm">
                                            <h2 className="text-xl font-semibold mb-3">Customer: {customer.name}</h2>
                                            
                                            {customer.assets.length === 0 ? (
                                                <p className="ml-4">Tidak ada aset untuk customer ini.</p>
                                            ) : (
                                                <div className="ml-4 space-y-6">
                                                    {customer.assets.map(asset => (
                                                        <div key={asset.id} className="border-l-4 border-blue-500 pl-4">
                                                            <h3 className="text-lg font-semibold">Aset: {asset.name} ({asset.code})</h3>
                                                            {asset.inspections.length === 0 ? (
                                                                <p className="ml-4">Tidak ada inspeksi untuk aset ini.</p>
                                                            ) : (
                                                                <div className="ml-4 space-y-4">
                                                                    {asset.inspections.map(inspection => (
                                                                        <div key={inspection.id} className="border p-3 rounded-md">
                                                                            <h4 className="font-semibold">Inspeksi pada: {new Date(inspection.created_at).toLocaleDateString()}</h4>
                                                                            <p className="text-sm text-gray-700">Lokasi: {inspection.location}</p>
                                                                            <p className="text-sm text-gray-700">Kondisi Aset: {inspection.condition}</p>
                                                                            <p className="text-sm text-gray-700">Temuan Umum: {inspection.finding}</p>
                                                                            <p className="text-sm text-gray-700">Rekomendasi Umum: {inspection.recommendation}</p>

                                                                            {/* Photos Before Inspection */}
                                                                            {inspection.photosBefore && inspection.photosBefore.length > 0 && (
                                                                                <div className="mt-2">
                                                                                    <h5 className="text-md font-medium">Foto Sebelum Inspeksi:</h5>
                                                                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                                                                        {inspection.photosBefore.map(photo => (
                                                                                            <img key={photo.id} src={photo.url} alt="Foto Sebelum" className="w-full h-24 object-cover rounded" />
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            {/* Components for this Inspection */}
                                                                            {inspection.components.length === 0 ? (
                                                                                <p className="ml-4 mt-2">Tidak ada komponen untuk inspeksi ini.</p>
                                                                            ) : (
                                                                                <div className="ml-4 mt-2 space-y-3">
                                                                                    {inspection.components.map(component => (
                                                                                        <div key={component.id} className="border-t border-gray-200 pt-3">
                                                                                            <h5 className="font-semibold">Komponen: {component.name}</h5>
                                                                                            <p className="text-sm text-gray-700">Fungsi: {component.function}</p>
                                                                                            <p className="text-sm text-gray-700">Kondisi: {component.condition}</p>
                                                                                            <p className="text-sm text-gray-700">Hasil Pengecekan: {component.check_results}</p>

                                                                                            {/* Component Photos */}
                                                                                            {(component.photosComponent && component.photosComponent.length > 0) && (
                                                                                                <div className="mt-2">
                                                                                                    <h6 className="text-sm font-medium">Foto Komponen:</h6>
                                                                                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                                                                                        {component.photosComponent.map(photo => (
                                                                                                            <img key={photo.id} src={photo.url} alt="Foto Komponen" className="w-full h-24 object-cover rounded" />
                                                                                                        ))}
                                                                                                    </div>
                                                                                                </div>
                                                                                            )}
                                                                                            {(component.photosCheck && component.photosCheck.length > 0) && (
                                                                                                <div className="mt-2">
                                                                                                    <h6 className="text-sm font-medium">Foto Pengecekan:</h6>
                                                                                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                                                                                        {component.photosCheck.map(photo => (
                                                                                                            <img key={photo.id} src={photo.url} alt="Foto Pengecekan" className="w-full h-24 object-cover rounded" />
                                                                                                        ))}
                                                                                                    </div>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
