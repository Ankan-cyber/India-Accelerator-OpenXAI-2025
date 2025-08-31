"use client"

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import type { InsertMedication } from "@/lib/models";

interface AddMedicationDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddMedicationDialog({ open, onClose }: AddMedicationDialogProps) {
  const [formData, setFormData] = useState<InsertMedication>({
    name: "",
    dosage: "",
    instructions: "",
    times: [],
    isActive: true,
  });
  const [newTime, setNewTime] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: InsertMedication) => {
      const response = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create medication');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
      toast({
        title: "Medication added",
        description: "Your medication has been added successfully",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add medication. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setFormData({
      name: "",
      dosage: "",
      instructions: "",
      times: [],
      isActive: true,
    });
    setNewTime("");
    onClose();
  };

  const handleAddTime = () => {
    if (newTime && !formData.times.includes(newTime)) {
      setFormData(prev => ({
        ...prev,
        times: [...prev.times, newTime].sort()
      }));
      setNewTime("");
    }
  };

  const handleRemoveTime = (timeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.filter(time => time !== timeToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.dosage || formData.times.length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and add at least one time.",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center">
            <Plus className="mr-3 text-primary" size={28} />
            Add New Medication
          </DialogTitle>
          <DialogDescription className="text-lg">
            Enter your medication details and schedule
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name" className="text-lg font-semibold">
                Medication Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter medication name"
                className="text-lg"
                data-testid="input-medication-name"
                required
              />
            </div>

            <div>
              <Label htmlFor="dosage" className="text-lg font-semibold">
                Dosage *
              </Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                placeholder="e.g., 10mg, 1 tablet"
                className="text-lg"
                data-testid="input-medication-dosage"
                required
              />
            </div>

            <div>
              <Label htmlFor="instructions" className="text-lg font-semibold">
                Instructions
              </Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="e.g., Take with food"
                className="text-lg"
                data-testid="input-medication-instructions"
              />
            </div>

            <div>
              <Label className="text-lg font-semibold">
                Schedule Times *
              </Label>
              <div className="flex space-x-2 mt-2">
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="text-lg"
                  data-testid="input-time"
                />
                <Button
                  type="button"
                  onClick={handleAddTime}
                  disabled={!newTime}
                  data-testid="button-add-time"
                >
                  Add Time
                </Button>
              </div>
              
              {formData.times.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-muted-foreground">Scheduled times:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.times.map((time) => (
                      <div
                        key={time}
                        className="flex items-center bg-accent text-accent-foreground px-3 py-1 rounded-lg"
                        data-testid={`time-badge-${time}`}
                      >
                        <span className="mr-2">{time}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTime(time)}
                          className="h-auto p-1"
                          data-testid={`button-remove-time-${time}`}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="text-lg"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="text-lg"
              data-testid="button-save-medication"
            >
              {createMutation.isPending ? "Adding..." : "Add Medication"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}