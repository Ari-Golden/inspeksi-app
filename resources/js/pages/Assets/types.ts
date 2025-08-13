import { Customer } from '@/pages/Customers/types';

export interface AssetPhoto {
    id: number;
    asset_id: number;
    path: string;
    created_at: string;
    updated_at: string;
}

export interface Asset {
    id: number;
    customer_id: number;
    customer: Customer;
    name: string;
    code: string | null;
    location: string;
    note: string | null;
    photos: AssetPhoto[];
    created_at: string;
    updated_at: string;
}
