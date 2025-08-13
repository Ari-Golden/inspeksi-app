import { Customer } from '@/pages/Customers/types';
import { Asset } from '@/pages/Assets/types';
import { User } from '@/types';

export interface InspectionPhoto {
    id: number;
    inspection_id: number;
    path: string;
    type: string | null;
    created_at: string;
    updated_at: string;
    url: string;
}

export interface ComponentPhoto {
    id: number;
    component_id: number;
    path: string;
    type: string | null;
    created_at: string;
    updated_at: string;
    url: string;
}

export interface Component {
    id: number;
    inspection_id: number;
    name: string;
    function: string;
    condition: string;
    check_results: string;
    photos: ComponentPhoto[];
    photosComponent: ComponentPhoto[];
    photosCheck: ComponentPhoto[];
    created_at: string;
    updated_at: string;
}

export interface Inspection {
    id: number;
    user_id: number;
    user: User;
    customer_id: number;
    customer: Customer;
    asset_id: number | null;
    asset: Asset | null;
    location: string;
    condition: string;
    estimate_cost: string | null;
    finding: string;
    analysis: string | null;
    recommendation: string | null;
    components: Component[];
    photos: InspectionPhoto[];
    photosBefore: InspectionPhoto[];
    created_at: string;
    updated_at: string;
}
