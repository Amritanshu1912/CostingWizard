import type { DataType } from "./data-management-constants";

export interface SavedData {
    key: string;
    name: string;
    timestamp: number;
    size: string;
    type: DataType;
    data: any;
}

export interface ExportData {
    name: string;
    type: DataType;
    timestamp: number;
    data: any;
}

export interface BulkExportData {
    exportDate: string;
    version: string;
    data: ExportData[];
}
