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
      "bg-blue-500/20 text-blue-400 border-blue-400/30",
      "bg-emerald-500/20 text-emerald-400 border-emerald-400/30", 
      "bg-purple-500/20 text-purple-400 border-purple-400/30",
      "bg-orange-500/20 text-orange-400 border-orange-400/30",
      "bg-pink-500/20 text-pink-400 border-pink-400/30",
    ];
    return colors[index % colors.length];
  };

  const colorClass = getMedicationColor(medication.name.length);
  
  // Determine status class based on medication state
  const getStatusClass = () => {
    if (medication.isTaken) return 'status-taken';
    
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    
    if (medication.scheduledTime < currentTime) return 'status-overdue';
    return 'status-pending';
  };

  const statusClass = getStatusClass();

  return (
    <Card 
      className={`glass-card border-white/20 ${medication.isTaken ? 'opacity-75 status-taken' : statusClass} interactive-feedback focus-ring large-touch-target`}
      role="listitem"
      aria-label={`${medication.name} medication card`}
      tabIndex={0}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div 
              className={`w-20 h-20 rounded-full flex items-center justify-center border backdrop-blur-md ${colorClass}`}
              aria-hidden="true"
            >
              <PillBottle size={32} />
            </div>
            <div>
              <h4 
                className="senior-text-xl font-semibold mb-1 text-white" 
                data-testid={`text-medication-name-${medication.id}`}
                id={`medication-name-${medication.id}`}
              >
                💊 {medication.name}
              </h4>
              <p 
                className="senior-text-lg text-gray-300" 
                data-testid={`text-medication-dosage-${medication.id}`}
                aria-describedby={`medication-name-${medication.id}`}
              >
                📏 {medication.dosage}
              </p>
              {medication.instructions && (
                <p 
                  className="senior-text-base text-gray-400 mt-1" 
                  data-testid={`text-medication-instructions-${medication.id}`}
                  aria-label={`Instructions: ${medication.instructions}`}
                >
                  ℹ️ {medication.instructions}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div 
                className={`px-4 py-3 rounded-lg senior-text-lg font-semibold mb-2 backdrop-blur-md border ${
                  medication.isTaken 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30' 
                    : 'bg-white/10 text-white border-white/20'
                }`} 
                data-testid={`text-medication-time-${medication.id}`}
                aria-label={`Scheduled time: ${medication.scheduledTime}`}
              >
                🕐 {medication.scheduledTime}
              </div>
              <p 
                className={`senior-text-base font-medium ${medication.isTaken ? 'text-emerald-400' : 'text-gray-300'}`}
                aria-label={medication.isTaken ? 'Status: Taken' : 'Status: Pending'}
              >
                {medication.isTaken ? '✅ Taken' : '⏳ Pending'}
              </p>
            </div>
            {!medication.isTaken && (
              <Button
                onClick={onMarkAsTaken}
                disabled={isLoading}
                size="lg"
                className="glass-button-primary senior-text-lg px-6 py-3 large-touch-target interactive-feedback focus-ring-button"
                data-testid={`button-mark-taken-${medication.id}`}
                aria-label={`Mark ${medication.name} as taken`}
                aria-describedby={`medication-name-${medication.id}`}
              >
                {isLoading ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Marking...
                  </>
                ) : (
                  <>
                    <Check size={24} className="mr-2" aria-hidden="true" />
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