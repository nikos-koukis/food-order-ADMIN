import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableStatus } from "@/interfaces/table";
import { AddTableForm } from "@/interfaces/add-table-form";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTableSettings } from "@/hooks/use-table-settings";

interface AddTableModalProps {
    isOpen: boolean;
    onClose: () => void;
    storeId: string;
    onCreate: (data: AddTableForm) => Promise<void>;
}

export function AddTableModal({
    isOpen,
    onClose,
    storeId,
    onCreate,
}: AddTableModalProps) {
    const [formData, setFormData] = useState<AddTableForm>({
        number: '',
        capacity: 0,
        section: '',
        status: TableStatus.AVAILABLE,
        storeId,
    });
    const [isAddingNewSection, setIsAddingNewSection] = useState(false);
    const { useSections, addSectionMutation, createFirstSectionMutation } = useTableSettings(storeId);
    const { data: sections = [] } = useSections();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // If there are no sections and we have a new section input, create the section first
        if (sections.length === 0 && formData.section.trim()) {
            try {
                await createFirstSectionMutation.mutateAsync({
                    storeId,
                    sections: [formData.section],
                });
                setFormData({ ...formData, section: formData.section });
            } catch (error) {
                toast.error('Failed to create section');
                return;
            }
        }

        // If there are sections and a new section is selected, create the new section
        if (!sections.includes(formData.section.trim()) && formData.section.trim()) {
            try {
                await addSectionMutation.mutateAsync({
                    sections: [formData.section],
                });
                setFormData({ ...formData, section: formData.section });
            } catch (error) {
                toast.error('Failed to create section');
                return;
            }
        }

        // If a section is selected, proceed to create the table
        if (!formData.section) {
            toast.error('Please select a section or create a new one');
            return;
        }

        try {
            await onCreate(formData);
            onClose();
            // Reset form
            setFormData({
                number: '',
                capacity: 0,
                section: '',
                status: TableStatus.AVAILABLE,
                storeId,
            });
        } catch (error) {
            toast.error('Failed to create table');
        }
    };

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
        setFormData({ ...formData, section: '' });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Table</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new table.
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
                        {sections.length === 0 ? (
                            <Input
                                id="section"
                                value={formData.section}
                                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                placeholder="Enter section name"
                                required
                                className="min-w-1/2"
                            />
                        ) : isAddingNewSection ? (
                            <div className="flex gap-2">
                                <Input
                                    value={formData.section}
                                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                    placeholder="Enter new section name"
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
                            Create Table
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}