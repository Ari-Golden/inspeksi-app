import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { PageProps, BreadcrumbItem } from '@/types';
import { Customer } from './types';

export default function EditCustomer({ customer }: PageProps<{ customer: Customer }>) {
    const { data, setData, post, processing, errors } = useForm({
        name: customer.name,
        location: customer.location,
        issue_note: customer.issue_note || '',
        photo: null as File | null,
        _method: 'put',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Customers',
            href: route('customers.index'),
        },
        {
            title: customer.name,
            href: route('customers.edit', customer.id),
        },
    ];

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('customers.update', customer.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Customer: ${customer.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <form onSubmit={submit}>
                                <div className="mb-4">
                                    <Label htmlFor="name">Nama Instansi</Label>
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
                                    <Label htmlFor="location">Lokasi</Label>
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
                                    <Label htmlFor="issue_note">Issue Note</Label>
                                    <Textarea
                                        id="issue_note"
                                        value={data.issue_note}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('issue_note', e.target.value)}
                                    />
                                    {errors.issue_note && <p className="text-xs text-red-500 mt-2">{errors.issue_note}</p>}
                                </div>

                                <div className="mb-4">
                                    <Label htmlFor="photo">Foto Lokasi/Gedung</Label>
                                    <Input
                                        id="photo"
                                        type="file"
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('photo', e.target.files ? e.target.files[0] : null)}
                                    />
                                    {errors.photo && <p className="text-xs text-red-500 mt-2">{errors.photo}</p>}
                                    {customer.photo_path && (
                                        <div className="mt-2">
                                            <img src={`/storage/${customer.photo_path}`} alt="Customer Photo" className="w-32 h-32 object-cover rounded-md" />
                                        </div>
                                    )}
                                </div>

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
