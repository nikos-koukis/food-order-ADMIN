import { TableStatus } from './table';

export interface UpdateTableForm {
    number?: string;
    capacity?: number;
    section?: string;
    status?: TableStatus;
} 