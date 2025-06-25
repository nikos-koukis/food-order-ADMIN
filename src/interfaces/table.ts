export enum TableStatus {
    AVAILABLE = 'available',
    OCCUPIED = 'occupied',
    RESERVED = 'reserved',
    MAINTENANCE = 'maintenance'
}

export interface Table {
    _id: string;
    number: string;
    capacity: number;
    section: string;
    status: TableStatus;
    storeId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TableSettings {
    _id: string;
    storeId: string;
    settings: {
        sections: string[];
    };
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}