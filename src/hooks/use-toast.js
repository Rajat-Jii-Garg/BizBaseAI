// Re-export sonner's toast for backward compatibility
import { toast } from 'sonner';

// Create a wrapper that mimics the old useToast API for compatibility
function useToast() {
  return {
    toast: (props) => {
      if (props?.variant === 'destructive') {
        return toast.error(props.title, { description: props.description });
      }
      return toast(props?.title, { description: props?.description });
    },
    toasts: [],
    dismiss: toast.dismiss,
  };
}

export { useToast, toast };
