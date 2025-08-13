import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Customer } from '@/pages/Customers/types';
import { BreadcrumbItem, PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Asset } from './types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Assets',
        href: route('assets.index'),
    },
];

export default function Index({ customers }: PageProps<{ customers: Customer[] }>) {
    const [expandedCustomers, setExpandedCustomers] = useState<number[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleCustomerExpansion = (customerId: number) => {
        setExpandedCustomers((prev) => (prev.includes(customerId) ? prev.filter((id) => id !== customerId) : [...prev, customerId]));
    };

    const openAssetPreview = (asset: Asset) => {
        setSelectedAsset(asset);
        setIsModalOpen(true);
    };

    

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Assets" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-200 bg-white p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <h1 className="text-2xl font-semibold">Assets by Customer</h1>
                                <Link href={route('assets.create')}>
                                    <Button>Tambah Asset</Button>
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {customers.map((customer) => (
                                    <div key={customer.id} className="rounded-lg border">
                                        <div
                                            className="flex cursor-pointer items-center justify-between bg-gray-50 p-4"
                                            onClick={() => toggleCustomerExpansion(customer.id)}
                                        >
                                            <h2 className="text-lg font-medium">{customer.name}</h2>
                                            {expandedCustomers.includes(customer.id) ? <ChevronDown /> : <ChevronRight />}
                                        </div>

                                        {expandedCustomers.includes(customer.id) && (
                                            <div className="overflow-x-auto p-4">
                                                {customer.assets.length > 0 ? (
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th
                                                                    scope="col"
                                                                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                                                >
                                                                    Nama Asset
                                                                </th>
                                                                <th
                                                                    scope="col"
                                                                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                                                >
                                                                    Kode Asset
                                                                </th>
                                                                <th
                                                                    scope="col"
                                                                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                                                >
                                                                    Lokasi Asset
                                                                </th>
                                                                <th
                                                                    scope="col"
                                                                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                                                >
                                                                    Note
                                                                </th>
                                                                <th
                                                                    scope="col"
                                                                    className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                                                >
                                                                    Photos
                                                                </th>
                                                                <th scope="col" className="relative px-6 py-3">
                                                                    <span className="sr-only">Edit</span>
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-200 bg-white">
                                                            {customer.assets.map((asset) => (
                                                                <tr key={asset.id}>
                                                                    <td
                                                                        className="cursor-pointer px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900 hover:underline"
                                                                        onClick={() => openAssetPreview(asset)}
                                                                    >
                                                                        {asset.name}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                                                        {asset.code}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                                                        {asset.location}
                                                                    </td>
                                                                    <td className="px-4 py-4 text-sm text-gray-500 max-w-xs overflow-hidden text-ellipsis">
                                                                    {asset.note}
                                                                </td>
                                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                                                        <div className="flex -space-x-2 overflow-hidden">
                                                                            {asset.photos.map((photo) => (
                                                                                <img
                                                                                    key={photo.id}
                                                                                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                                                                                    src={`/storage/${photo.path}`}
                                                                                    alt=""
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                                        <Link
                                                                            href={route('assets.edit', asset.id)}
                                                                            className="text-indigo-600 hover:text-indigo-900"
                                                                        >
                                                                            Edit
                                                                        </Link>
                                                                        <Link
                                                                            href={route('assets.destroy', asset.id)}
                                                                            method="delete"
                                                                            as="button"
                                                                            className="ml-4 text-red-600 hover:text-red-900"
                                                                        >
                                                                            Delete
                                                                        </Link>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <p className="text-gray-500">No assets found for this customer.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Asset Preview Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Asset Details</DialogTitle>
                        <DialogDescription>View detailed information about the selected asset.</DialogDescription>
                    </DialogHeader>
                    {selectedAsset ? (
                        <>
                            {console.log(selectedAsset)}
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Name:</Label>
                                    <span className="col-span-3">{selectedAsset.name}</span>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Code:</Label>
                                    <span className="col-span-3">{selectedAsset.code || '-'}</span>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Location:</Label>
                                    <span className="col-span-3">{selectedAsset.location}</span>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Note:</Label>
                                    <span className="col-span-3">{selectedAsset.note || '-'}</span>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Customer:</Label>
                                    <span className="col-span-3">{selectedAsset.customer.name}</span>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Photos:</Label>
                                    <div className="col-span-3 flex flex-wrap gap-2">
                                        {selectedAsset.photos.length > 0 ? (
                                            selectedAsset.photos.map((photo) => (
                                                <img
                                                    key={photo.id}
                                                    src={`/storage/${photo.path}`}
                                                    alt="Asset Photo"
                                                    className="h-24 w-24 rounded-md object-cover"
                                                />
                                            ))
                                        ) : (
                                            <span>No photos available.</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p>Loading asset details...</p>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
