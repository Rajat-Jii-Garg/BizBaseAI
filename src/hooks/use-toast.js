// Re-export sonner's toast for backward compatibility
// This wrapper avoids using React hooks to prevent the "Cannot read properties of null" error
import { toast as sonnerToast } from 'sonner';

// Create a wrapper that mimics the old useToast API for compatibility
// This is NOT a hook - it's a simple function that returns an object
function useToast() {
  return {
    toast: (props) => {
      if (props?.variant === 'destructive') {
        return sonnerToast.error(props.title, { description: props.description });
      }
      return sonnerToast(props?.title, { description: props?.description });
    },
    toasts: [],
    dismiss: sonnerToast.dismiss,
  };
}

// Direct toast function for simpler usage
const toast = (props) => {
  if (props?.variant === 'destructive') {
    return sonnerToast.error(props.title, { description: props.description });
  }
  return sonnerToast(props?.title, { description: props?.description });
};

export { useToast, toast };
