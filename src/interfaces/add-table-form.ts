import { TableStatus } from './table';

export interface AddTableForm {
    number: string;
    capacity: number;
    section: string;
    status: TableStatus;
    storeId: string;
} 