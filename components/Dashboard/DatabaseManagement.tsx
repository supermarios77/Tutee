import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import logger from '@/lib/logger';

export default function DatabaseManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSetupDatabase = async (reset: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/setup-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset }),
      });
      if (!response.ok) throw new Error('Failed to setup database');
      const data = await response.json();
      toast({ title: "Success", description: data.message });
    } catch (error) {
      logger.error('Error setting up database:', error);
      toast({ title: "Error", description: "Failed to setup database", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Database Management</h2>
      <Button onClick={() => handleSetupDatabase(false)} disabled={isLoading}>
        Setup Database
      </Button>
      <Button onClick={() => handleSetupDatabase(true)} disabled={isLoading} variant="destructive">
        Reset and Setup Database
      </Button>
    </div>
  );
}