"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, PillBottle } from "lucide-react";
import type { IMedication } from "@/lib/models";

interface MedicationCardProps {
  medication: IMedication & { 
    scheduledTime: string; 
    isTaken?: boolean; 
  };
  onMarkAsTaken: () => void;
  isLoading?: boolean;
}

export function MedicationCard({ medication, onMarkAsTaken, isLoading }: MedicationCardProps) {
  const getMedicationColor = (index: number) => {
    const colors = [
      "bg-blue-100 text-blue-600",
      "bg-green-100 text-green-600", 
      "bg-purple-100 text-purple-600",
      "bg-orange-100 text-orange-600",
      "bg-pink-100 text-pink-600",
    ];
    return colors[index % colors.length];
  };

  const colorClass = getMedicationColor(medication.name.length);

  return (
    <Card className={`medication-card ${medication.isTaken ? 'opacity-60' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${colorClass}`}>
              <PillBottle size={28} />
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-1" data-testid={`text-medication-name-${medication.id}`}>
                {medication.name}
              </h4>
              <p className="text-lg text-muted-foreground" data-testid={`text-medication-dosage-${medication.id}`}>
                {medication.dosage}
              </p>
              {medication.instructions && (
                <p className="text-base text-muted-foreground" data-testid={`text-medication-instructions-${medication.id}`}>
                  {medication.instructions}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className={`time-badge px-3 py-2 rounded-lg text-lg font-semibold mb-2 ${
                medication.isTaken ? 'bg-success text-success-foreground' : 'bg-accent text-accent-foreground'
              }`} data-testid={`text-medication-time-${medication.id}`}>
                {medication.scheduledTime}
              </div>
              <p className={`text-sm ${medication.isTaken ? 'text-success' : 'text-muted-foreground'}`}>
                {medication.isTaken ? '✓ Taken' : 'Next dose'}
              </p>
            </div>
            {!medication.isTaken && (
              <Button
                onClick={onMarkAsTaken}
                disabled={isLoading}
                size="lg"
                className="bg-success hover:bg-success/90 text-success-foreground"
                data-testid={`button-mark-taken-${medication.id}`}
              >
                {isLoading ? (
                  "..."
                ) : (
                  <>
                    <Check size={20} />
                    Mark Taken
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}