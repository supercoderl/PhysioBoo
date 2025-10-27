export interface Column {
    id: string;
    label: string;
    sortable: boolean;
    draggable: boolean;
    hasActions: boolean;
    pinned: boolean;
}

export interface TableRow {
    id: number;
    name: string;
    image: string;
    category: string[];
    price: number;
    quantity: number;
    active: boolean;
    link: string;
}