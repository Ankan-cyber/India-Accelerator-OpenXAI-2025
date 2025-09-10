"use client"

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Heart, User, Plus } from "lucide-react";
import type { IEmergencyContact } from "@/lib/models";
import { EmergencyContactsDialog } from "./emergency-contacts-dialog";

interface EmergencyContactsDisplayDialogProps {
  open: boolean;
  onClose: () => void;
}

export function EmergencyContactsDisplayDialog({ open, onClose }: EmergencyContactsDisplayDialogProps) {
  const [showAddContactDialog, setShowAddContactDialog] = useState(false);

  const { data: contacts = [], isLoading } = useQuery<IEmergencyContact[]>({
    queryKey: ['/api/emergency-contacts'],
    queryFn: async () => {
      const response = await fetch('/api/emergency-contacts');
      if (!response.ok) throw new Error('Failed to fetch emergency contacts');
      return response.json();
    },
    enabled: open,
  });

  const handleCall = (phone: string) => {
    if (phone === "911") {
      if (confirm(`Are you sure you want to call Emergency Services (911)?`)) {
        window.open(`tel:${phone}`);
      }
    } else {
      window.open(`tel:${phone}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent showClose={false} className="glass-dialog sm:max-w-[500px] border-white/20 text-white">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl flex items-center text-white">
              <Heart className="mr-3 text-red-400" size={28} />
              Emergency Contacts
            </DialogTitle>
            <Button
              size="sm"
              className="glass-button"
              onClick={() => setShowAddContactDialog(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </Button>
          </div>
          <DialogDescription className="text-lg text-gray-300 pt-2">
            Quick access to your important contacts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card h-20 rounded-lg shimmer"></div>
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <Card className="glass-card border-white/20">
              <CardContent className="p-6 text-center">
                <User className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-lg text-gray-300">No emergency contacts found</p>
                <Button className="mt-4 glass-button-primary" onClick={() => setShowAddContactDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add a Contact
                </Button>
              </CardContent>
            </Card>
          ) : (
            contacts.map((contact) => (
              <Card key={contact.id} className="glass-card border-white/20 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border ${
                        contact.isPrimary 
                          ? 'bg-red-500/20 text-red-400 border-red-400/30' 
                          : 'bg-white/10 text-white border-white/20'
                      }`}>
                        {contact.isPrimary ? <Heart size={24} /> : <User size={24} />}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white" data-testid={`text-contact-name-${contact.id}`}>
                          {contact.name}
                        </h4>
                        <p className="text-base text-gray-300" data-testid={`text-contact-relationship-${contact.id}`}>
                          {contact.relationship}
                        </p>
                        <a href={`tel:${contact.phone}`} className="text-base font-mono text-gray-300 hover:text-white" data-testid={`text-contact-phone-${contact.id}`}>
                          {contact.phone}
                        </a>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleCall(contact.phone)}
                      size="lg"
                      className="glass-button-primary"
                      data-testid={`button-call-${contact.id}`}
                    >
                      <Phone size={20} className="mr-2" />
                      Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="pt-4 border-t border-white/20">
          <Button
            onClick={onClose}
            className="glass-button w-full text-lg text-white hover:text-white"
            data-testid="button-close-contacts"
          >
            Close
          </Button>
        </div>
      </DialogContent>
      <EmergencyContactsDialog
        open={showAddContactDialog}
        onClose={() => setShowAddContactDialog(false)}
      />
    </Dialog>
  );
}
