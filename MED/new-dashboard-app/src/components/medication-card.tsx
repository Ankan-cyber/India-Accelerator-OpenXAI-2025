"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, PillBottle, Trash2, MoreVertical } from "lucide-react";
import type { IMedication } from "@/lib/models";
import { useState, useEffect, useRef } from "react";

interface MedicationCardProps {
  medication: IMedication & { 
    scheduledTime: string; 
    isTaken?: boolean; 
  };
  onMarkAsTaken: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
}

export function MedicationCard({ medication, onMarkAsTaken, onDelete, isLoading }: MedicationCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    }

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActions]);

  const handleDelete = async () => {
    if (!onDelete) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${medication.name}? This action cannot be undone.`
    );
    
    if (confirmed) {
      setIsDeleting(true);
      try {
        await onDelete();
      } catch (error) {
        console.error('Error deleting medication:', error);
      } finally {
        setIsDeleting(false);
        setShowActions(false);
      }
    }
  };

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
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
            <div 
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center border backdrop-blur-md ${colorClass} flex-shrink-0`}
              aria-hidden="true"
            >
              <PillBottle size={24} className="sm:w-8 sm:h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 
                className="text-lg sm:text-xl font-semibold mb-1 text-white truncate" 
                data-testid={`text-medication-name-${medication.id}`}
                id={`medication-name-${medication.id}`}
              >
                💊 {medication.name}
              </h4>
              <p 
                className="text-base sm:text-lg text-gray-300 truncate" 
                data-testid={`text-medication-dosage-${medication.id}`}
                aria-describedby={`medication-name-${medication.id}`}
              >
                📏 {medication.dosage}
              </p>
              {medication.instructions && (
                <p 
                  className="text-sm sm:text-base text-gray-400 mt-1 line-clamp-2" 
                  data-testid={`text-medication-instructions-${medication.id}`}
                  aria-label={`Instructions: ${medication.instructions}`}
                >
                  ℹ️ {medication.instructions}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-shrink-0">
            <div className="text-center sm:text-right">
              <div 
                className={`px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-base sm:text-lg font-semibold mb-2 backdrop-blur-md border ${
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
                className={`text-sm sm:text-base font-medium ${medication.isTaken ? 'text-emerald-400' : 'text-gray-300'}`}
                aria-label={medication.isTaken ? 'Status: Taken' : 'Status: Pending'}
              >
                {medication.isTaken ? '✅ Taken' : '⏳ Pending'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {!medication.isTaken && (
                <Button
                  onClick={onMarkAsTaken}
                  disabled={isLoading}
                  size="lg"
                  className="glass-button-primary text-base sm:text-lg px-4 py-2 sm:px-6 sm:py-3 w-full sm:w-auto large-touch-target interactive-feedback focus-ring-button"
                  data-testid={`button-mark-taken-${medication.id}`}
                  aria-label={`Mark ${medication.name} as taken`}
                  aria-describedby={`medication-name-${medication.id}`}
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      <span className="hidden sm:inline">Marking...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <Check size={20} className="mr-2" aria-hidden="true" />
                      <span className="hidden sm:inline">Mark Taken</span>
                      <span className="sm:hidden">Mark</span>
                    </>
                  )}
                </Button>
              )}
              {onDelete && (
                <div className="relative" ref={dropdownRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowActions(!showActions)}
                    className="glass-button-secondary p-2 large-touch-target"
                    aria-label="More options"
                  >
                    <MoreVertical size={16} />
                  </Button>
                  
                  {showActions && (
                    <div className="absolute right-0 top-full mt-1 w-36 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg shadow-lg z-10">
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/20 disabled:opacity-50 flex items-center rounded-lg"
                      >
                        <Trash2 size={16} className="mr-2" />
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}