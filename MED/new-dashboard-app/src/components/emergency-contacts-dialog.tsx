"use client"

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InsertEmergencyContact } from "@/lib/models";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmergencyContactsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function EmergencyContactsDialog({ open, onClose }: EmergencyContactsDialogProps) {
  const [formData, setFormData] = useState<InsertEmergencyContact>({
    name: "",
    phone: "",
    relationship: "",
    isPrimary: false,
  });
  const [error, setError] = useState("");
  
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: InsertEmergencyContact) => {
      const response = await fetch('/api/emergency-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create emergency contact');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emergency-contacts'] });
      handleClose();
    },
    onError: (error) => {
      setError(error.message || "Failed to add emergency contact");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim() || !formData.phone.trim()) {
      setError("Name and phone are required");
      return;
    }

    createMutation.mutate(formData);
  };

  const handleClose = () => {
    setFormData({
      name: "",
      phone: "",
      relationship: "",
      isPrimary: false,
    });
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] glass-card text-white">
        <DialogHeader>
          <DialogTitle>Add Emergency Contact</DialogTitle>
          <DialogDescription>
            Add a new emergency contact. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="bg-red-900/50 border border-red-500/50 text-red-300 p-3 rounded-lg">
                <p>{error}</p>
              </div>
            )}

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter contact name"
                required
                className="bg-black/20 border-white/20 focus:ring-purple-500/50"
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
                required
                className="bg-black/20 border-white/20 focus:ring-purple-500/50"
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="relationship">Relationship</Label>
              <Input
                id="relationship"
                type="text"
                value={formData.relationship}
                onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                placeholder="e.g., Doctor, Family"
                className="bg-black/20 border-white/20 focus:ring-purple-500/50"
              />
            </div>

            <div className="flex items-center space-x-2 mt-2">
              <input
                id="isPrimary"
                type="checkbox"
                checked={formData.isPrimary}
                onChange={(e) => setFormData(prev => ({ ...prev, isPrimary: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-500 text-purple-600 focus:ring-purple-500 bg-black/20"
              />
              <Label htmlFor="isPrimary" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Set as primary contact
              </Label>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={handleClose} className="glass-button">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="glass-button-primary"
            >
              {createMutation.isPending ? "Adding..." : "Add Contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
