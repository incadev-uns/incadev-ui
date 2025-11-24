import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IconCheck, IconAlertCircle } from "@tabler/icons-react";

interface AlertMessageProps {
  message: { type: 'success' | 'error', text: string } | null;
}

export function AlertMessage({ message }: AlertMessageProps) {
  if (!message) return null;

  return (
    <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
      {message.type === 'success' ? (
        <IconCheck className="h-4 w-4" />
      ) : (
        <IconAlertCircle className="h-4 w-4" />
      )}
      <AlertTitle>
        {message.type === 'success' ? '¡Éxito!' : 'Error'}
      </AlertTitle>
      <AlertDescription>{message.text}</AlertDescription>
    </Alert>
  );
}