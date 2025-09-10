"use client"

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [error, setError] = useState("");
  
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
      handleClose();
    },
    onError: (error) => {
      setError(error.message || "Failed to add medication");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim() || !formData.dosage.trim()) {
      setError("Name and dosage are required");
      return;
    }

    if (formData.times.length === 0) {
      setError("At least one time is required");
      return;
    }

    createMutation.mutate(formData);
  };

  const addTime = () => {
    if (newTime && !formData.times.includes(newTime)) {
      setFormData(prev => ({
        ...prev,
        times: [...prev.times, newTime]
      }));
      setNewTime("");
    }
  };

  const removeTime = (timeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.filter(time => time !== timeToRemove)
    }));
  };

  const handleClose = () => {
    setFormData({
      name: "",
      dosage: "",
      instructions: "",
      times: [],
      isActive: true,
    });
    setNewTime("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-card sm:max-w-[500px] border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="senior-text-2xl text-white">Add New Medication</DialogTitle>
          <DialogDescription className="senior-text-lg text-gray-300">
            Enter the details for your new medication
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="medication-name" className="senior-text-lg text-white">Name *</Label>
            <Input
              id="medication-name"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Aspirin"
              className="glass-button senior-text-lg text-white placeholder:text-gray-400 large-touch-target focus-ring"
              data-testid="input-medication-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medication-dosage" className="senior-text-lg text-white">Dosage *</Label>
            <Input
              id="medication-dosage"
              value={formData.dosage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
              placeholder="e.g., 100mg"
              className="glass-button senior-text-lg text-white placeholder:text-gray-400 large-touch-target focus-ring"
              data-testid="input-medication-dosage"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medication-instructions" className="senior-text-lg text-white">Instructions</Label>
            <Textarea
              id="medication-instructions"
              value={formData.instructions}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
              placeholder="e.g., Take with food"
              className="glass-input text-white placeholder:text-gray-400 min-h-[80px]"
              data-testid="textarea-medication-instructions"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-white">Times *</Label>
            <div className="flex space-x-2">
              <Input
                type="time"
                value={newTime}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTime(e.target.value)}
                className="glass-input text-white"
                data-testid="input-new-time"
              />
              <Button
                type="button"
                onClick={addTime}
                disabled={!newTime}
                className="glass-button-primary"
                data-testid="button-add-time"
              >
                <Plus size={16} className="mr-1" />
                Add
              </Button>
            </div>

            {formData.times.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-300">Scheduled times:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.times.map((time) => (
                    <div
                      key={time}
                      className="flex items-center bg-white/10 border border-white/20 rounded-lg px-3 py-1 backdrop-blur-md"
                    >
                      <span className="text-white mr-2">{time}</span>
                      <button
                        type="button"
                        onClick={() => removeTime(time)}
                        className="text-red-400 hover:text-red-300"
                        data-testid={`button-remove-time-${time}`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4 border-t border-white/20">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className="glass-button flex-1 senior-text-lg large-touch-target interactive-feedback focus-ring-button"
              data-testid="button-cancel-medication"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="glass-button-primary flex-1 senior-text-lg large-touch-target interactive-feedback focus-ring-button"
              data-testid="button-save-medication"
            >
              {createMutation.isPending ? "Adding..." : "Add Medication"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}