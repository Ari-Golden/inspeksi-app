import { Link, Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageProps, BreadcrumbItem, Paginated } from '@/types';
import { Inspection } from './types';
import { Button } from '@/components/ui/button';
import { Customer } from '@/pages/Customers/types';
import { useState, useEffect } from 'react';

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

export default function Index({ inspections, customers }: PageProps<{ inspections: Paginated<Inspection>, customers: Customer[] }>) {
    const [selectedCustomerId, setSelectedCustomerId] = useState('');

    useEffect(() => {
        const queryParams = selectedCustomerId ? { customer_id: selectedCustomerId } : {};
        router.get(route('inspections.index'), queryParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [selectedCustomerId]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inspections Report" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <h1 className="text-2xl font-semibold">Inspections Report</h1>
                                <Link href={route('inspections.create')}>
                                    <Button>Tambah Inspeksi</Button>
                                </Link>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="customer-filter" className="block text-sm font-medium text-gray-700">Filter by Customer:</label>
                                <select
                                    id="customer-filter"
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    value={selectedCustomerId}
                                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                                >
                                    <option value="">All Customers</option>
                                    {customers.map((customer) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Asset
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Inspected By
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">View</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {inspections.data.length > 0 ? (
                                        inspections.data.map((inspection) => (
                                            <tr key={inspection.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {inspection.customer.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {inspection.asset ? inspection.asset.name : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {inspection.location}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {inspection.user.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(inspection.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link href={route('inspections.show', inspection.id)} className="text-indigo-600 hover:text-indigo-900">View</Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                No inspections found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
