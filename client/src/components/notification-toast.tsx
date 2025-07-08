import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, AlertCircle, Clock, Zap } from "lucide-react";

interface NotificationToastProps {
  type: 'upload' | 'parsing' | 'completed' | 'error';
  title: string;
  description: string;
  duration?: number;
}

export function showNotificationToast(props: NotificationToastProps) {
  const { toast } = useToast();
  
  const getIcon = () => {
    switch (props.type) {
      case 'upload':
        return <Clock className="h-4 w-4" />;
      case 'parsing':
        return <Zap className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    switch (props.type) {
      case 'error':
        return 'destructive' as const;
      default:
        return 'default' as const;
    }
  };

  return toast({
    title: props.title,
    description: props.description,
    variant: getVariant(),
    duration: props.duration || 4000,
  });
}

export default function NotificationToast(props: NotificationToastProps) {
  const { toast } = useToast();

  useEffect(() => {
    showNotificationToast(props);
  }, []);

  return null;
}