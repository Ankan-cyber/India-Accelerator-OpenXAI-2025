"use client"

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
import { Phone, Heart, User } from "lucide-react";
import type { IEmergencyContact } from "@/lib/models";

interface EmergencyContactsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function EmergencyContactsDialog({ open, onClose }: EmergencyContactsDialogProps) {
  const { data: contacts = [], isLoading } = useQuery<IEmergencyContact[]>({
    queryKey: ['/api/emergency-contacts'],
    queryFn: async () => {
      const response = await fetch('/api/emergency-contacts');
      if (!response.ok) throw new Error('Failed to fetch emergency contacts');
      return response.json();
    },
    enabled: open,
  });

  const handleCall = (phone: string, name: string) => {
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center">
            <Heart className="mr-3 text-destructive" size={28} />
            Emergency Contacts
          </DialogTitle>
          <DialogDescription className="text-lg">
            Quick access to your important contacts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-muted h-20 rounded-lg"></div>
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <User className="mx-auto mb-4 text-muted-foreground" size={48} />
                <p className="text-lg text-muted-foreground">No emergency contacts found</p>
              </CardContent>
            </Card>
          ) : (
            contacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        contact.isPrimary ? 'bg-destructive text-destructive-foreground' : 'bg-accent text-accent-foreground'
                      }`}>
                        {contact.isPrimary ? <Heart size={24} /> : <User size={24} />}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold" data-testid={`text-contact-name-${contact.id}`}>
                          {contact.name}
                        </h4>
                        <p className="text-base text-muted-foreground" data-testid={`text-contact-relationship-${contact.id}`}>
                          {contact.relationship}
                        </p>
                        <p className="text-base font-mono" data-testid={`text-contact-phone-${contact.id}`}>
                          {contact.phone}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleCall(contact.phone, contact.name)}
                      size="lg"
                      className="bg-success hover:bg-success/90 text-success-foreground"
                      data-testid={`button-call-${contact.id}`}
                    >
                      <Phone size={20} />
                      Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={onClose}
            className="w-full text-lg"
            data-testid="button-close-contacts"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}