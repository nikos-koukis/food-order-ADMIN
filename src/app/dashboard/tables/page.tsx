"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useTables } from '@/hooks/use-tables';
import { useTableSettings } from '@/hooks/use-table-settings';
import { Table, TableStatus } from '@/interfaces/table';
import { useAuthMutations } from '@/hooks/use-auth-mutations';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AddTableModal } from '@/components/tables/add-table-modal';
import { UpdateTableModal } from '@/components/tables/update-table-modal';
import { Edit, Trash, Users, MapPin, CheckCircle2, Circle, Clock, Wrench } from 'lucide-react';
import { UpdateTableForm } from '@/interfaces/update-table-form';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from "@/components/ui/badge";

export default function TablesPage() {
  const { useAllTables, deleteTableMutation, createTableMutation, updateTableMutation } = useTables();
  const { useVerifyToken } = useAuthMutations();
  const { data: userData } = useVerifyToken();
  const { data: tables, isLoading, error } = useAllTables();
  const [tableToDelete, setTableToDelete] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [statusFilter, setStatusFilter] = useState<TableStatus | 'all'>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const { useSections } = useTableSettings(userData?.storeId || '');
  const { data: sections } = useSections();

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Tables</h2>
          <Button className="cursor-pointer" onClick={() => setIsAddModalOpen(true)}>
            Add Table
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Tables</CardTitle>
              <CardDescription>All business tables</CardDescription>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Business Tables</CardTitle>
            <CardDescription>Manage your business tables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Tables</h2>
        </div>
        <div className="text-red-500">Error loading tables</div>
      </div>
    );
  }

  const handleDeleteClick = (id: string) => {
    setTableToDelete(id);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (tableToDelete) {
      const tableToDeleteNumber = tables?.find((table: Table) => table._id === tableToDelete)?.number || 'Unknown Table';
      deleteTableMutation.mutate(tableToDelete, {
        onSuccess: () => {
          toast.success(`Table "${tableToDeleteNumber}" deleted successfully`);
        },
        onError: () => {
          toast.error(`Failed to delete table "${tableToDeleteNumber}"`);
        }
      });
      setConfirmDialogOpen(false);
      setTableToDelete(null);
    }
  };

  const handleCreateTable = async (data: any) => {
    try {
      await createTableMutation.mutateAsync(data);
      toast.success('Table created successfully');
      setIsAddModalOpen(false);
    } catch (error) {
      toast.error('Failed to create table');
    }
  };

  const handleUpdateTable = async (id: string, data: UpdateTableForm) => {
    try {
      await updateTableMutation.mutateAsync({ 
        id, 
        ...data,
        storeId: userData?.storeId || '' 
      });
      toast.success('Table updated successfully');
      setIsUpdateModalOpen(false);
      setSelectedTable(null);
    } catch (error) {
      toast.error('Failed to update table');
    }
  };

  const handleEditClick = (table: Table) => {
    setSelectedTable(table);
    setIsUpdateModalOpen(true);
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Tables</h2>
        <Button 
          className="cursor-pointer"
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Table
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Tables</CardTitle>
            <CardDescription>All business tables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold align-bottom">{tables?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Tables</CardTitle>
            <CardDescription>Ready to serve customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {tables?.filter(table => table.status === TableStatus.AVAILABLE).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Occupied Tables</CardTitle>
            <CardDescription>Currently serving customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {tables?.filter(table => table.status === TableStatus.OCCUPIED).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reserved Tables</CardTitle>
            <CardDescription>Booked for future use</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {tables?.filter(table => table.status === TableStatus.RESERVED).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Business Tables</CardTitle>
            <CardDescription>Manage your business tables</CardDescription>
          </div>
          <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
            <Select value={sectionFilter} onValueChange={setSectionFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {sections?.map((section) => (
                  <SelectItem key={section} value={section}>
                    {section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as TableStatus | 'all')}>
              <TabsList className="w-full inline-flex items-center justify-start overflow-x-auto space-x-1">
                <TabsTrigger 
                  value="all"
                  className="data-[state=active]:text-foreground dark:data-[state=active]:text-foreground"
                >
                  All
                </TabsTrigger>
                <TabsTrigger 
                  value={TableStatus.AVAILABLE}
                  className="text-green-600 dark:text-green-400 data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400"
                >
                  Available
                </TabsTrigger>
                <TabsTrigger 
                  value={TableStatus.OCCUPIED}
                  className="text-red-600 dark:text-red-400 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400"
                >
                  Occupied
                </TabsTrigger>
                <TabsTrigger 
                  value={TableStatus.RESERVED}
                  className="text-yellow-600 dark:text-yellow-400 data-[state=active]:text-yellow-600 dark:data-[state=active]:text-yellow-400"
                >
                  Reserved
                </TabsTrigger>
                <TabsTrigger 
                  value={TableStatus.MAINTENANCE}
                  className="text-orange-600 dark:text-orange-400 data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400"
                >
                  Maintenance
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables
                ?.filter(table => 
                  (statusFilter === 'all' ? true : table.status === statusFilter) &&
                  (sectionFilter === 'all' ? true : table.section === sectionFilter)
                )
                ?.sort((a, b) => {
                  if (a.section === b.section) {
                    return Number(a.number) - Number(b.number);
                  }
                  return a.section.localeCompare(b.section);
                })
                ?.map((table: Table) => (
                  <div
                    key={table._id}
                    className="bg-card rounded-lg shadow-sm p-4 border"
                  >
                    <div className="flex flex-col justify-between items-start gap-4">
                      <div className='flex flex-row w-full justify-between items-center'>
                        <h3 className="text-xl font-bold">Table {table.number}</h3>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => handleEditClick(table)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => handleDeleteClick(table._id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge 
                          variant="soft" 
                          color={
                            table.status === TableStatus.AVAILABLE ? 'success' :
                            table.status === TableStatus.OCCUPIED ? 'destructive' :
                            table.status === TableStatus.RESERVED ? 'warning' :
                            table.status === TableStatus.MAINTENANCE ? 'orange' :
                            'default'
                          }
                          className="flex items-center gap-2 px-2 py-1"
                        >
                          {table.status === TableStatus.AVAILABLE ? <CheckCircle2 className="h-4 w-4" /> :
                            table.status === TableStatus.OCCUPIED ? <Users className="h-4 w-4" /> :
                            table.status === TableStatus.RESERVED ? <Clock className="h-4 w-4" /> :
                            table.status === TableStatus.MAINTENANCE ? <Wrench className="h-4 w-4" /> :
                            <Circle className="h-4 w-4" />
                          }
                          {table.status}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-2 px-2 py-1">
                          <Users className="h-4 w-4" />
                          {table.capacity}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-2 px-2 py-1">
                          <MapPin className="h-4 w-4" />
                          {table.section}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this table? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex items-center justify-end space-x-2 pt-4">
            <Button className="cursor-pointer" variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="cursor-pointer" variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Table Modal */}
      <AddTableModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        storeId={userData?.storeId || ''}
        onCreate={handleCreateTable}
      />

      {/* Update Table Modal */}
      {selectedTable && (
        <UpdateTableModal
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedTable(null);
          }}
          table={selectedTable}
          onUpdate={handleUpdateTable}
        />
      )}
    </div>
  );
}