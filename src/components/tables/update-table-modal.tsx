import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableStatus } from "@/interfaces/table";
import { UpdateTableForm } from "@/interfaces/update-table-form";
import { toast } from "sonner";
import { useTableSettings } from "@/hooks/use-table-settings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UpdateTableModalProps {
    isOpen: boolean;
    onClose: () => void;
    table: Table;
    onUpdate: (id: string, data: UpdateTableForm) => Promise<void>;
}

export function UpdateTableModal({
    isOpen,
    onClose,
    table,
    onUpdate,
}: UpdateTableModalProps) {
    const [formData, setFormData] = useState<UpdateTableForm>({
        number: table.number,
        capacity: table.capacity,
        section: table.section,
        status: table.status,
    });
    const [isAddingNewSection, setIsAddingNewSection] = useState(false);
    const { useSections, addSectionMutation } = useTableSettings(table.storeId);
    const { data: sections = [] } = useSections();

    useEffect(() => {
        setFormData({
            number: table.number,
            capacity: table.capacity,
            section: table.section,
            status: table.status,
        });
        setIsAddingNewSection(false);
    }, [table]);

    const handleSectionChange = async (value: string) => {
        if (value === 'new') {
            setIsAddingNewSection(true);
            setFormData({ ...formData, section: '' });
        } else {
            setFormData({ ...formData, section: value });
        }
    };

    const handleCancelNewSection = () => {
        setIsAddingNewSection(false);
        setFormData({ ...formData, section: table.section });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();        const sectionValue = formData.section || '';
        
        // If adding a new section and it's not empty
        if (!sections.includes(sectionValue.trim()) && sectionValue.trim()) {
            try {
                await addSectionMutation.mutateAsync({
                    sections: [sectionValue],
                });
            } catch (error) {
                toast.error('Failed to create section');
                return;
            }
        }

        // If no section is selected
        if (!sectionValue) {
            toast.error('Please select a section or create a new one');
            return;
        }

        try {
            await onUpdate(table._id, formData);
            onClose();
        } catch (error) {
            // Error toast is handled in the page component
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Table</DialogTitle>
                    <DialogDescription>
                        Update the details of table {table.number}.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="number">Table Number</Label>
                        <Input
                            id="number"
                            value={formData.number}
                            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="capacity">Capacity</Label>
                        <Input
                            id="capacity"
                            type="number"
                            value={formData.capacity}
                            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                            required
                            min="1"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="section">Section</Label>
                        {isAddingNewSection ? (
                            <div className="flex gap-2">
                                <Input
                                    value={formData.section}
                                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                    placeholder="Enter new section name"
                                    required
                                />
                                <Button
                                    type="button"
                                    onClick={handleCancelNewSection}
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <Select
                                value={formData.section}
                                onValueChange={handleSectionChange}
                            >
                                <SelectTrigger className="min-w-1/2">
                                    <SelectValue placeholder="Select a section" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sections?.map((section) => (
                                        <SelectItem key={section} value={section}>
                                            {section}
                                        </SelectItem>
                                    ))}
                                    <SelectItem value="new">+ Add a new section</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value: TableStatus) => setFormData({ ...formData, status: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={TableStatus.AVAILABLE}>Available</SelectItem>
                                <SelectItem value={TableStatus.OCCUPIED}>Occupied</SelectItem>
                                <SelectItem value={TableStatus.RESERVED}>Reserved</SelectItem>
                                <SelectItem value={TableStatus.MAINTENANCE}>Maintenance</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button className="cursor-pointer" variant="outline" type="button" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button className="cursor-pointer" type="submit">
                            Update Table
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}