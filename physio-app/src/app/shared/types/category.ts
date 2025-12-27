export interface Category {
    id: number;
    name: string;
    code: string;
    description: string;
    type: string;
    parentId: number | null;
    status: 'active' | 'inactive';
    itemCount: number;
    color: string;
    icon: string;
    createdDate: string;
}