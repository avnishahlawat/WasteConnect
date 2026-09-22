import * as Dialog from '@radix-ui/react-dialog';
import { X, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  variant?: 'danger' | 'warning' | 'default';
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmText = 'Confirm', variant = 'default' }: ConfirmDialogProps) {
  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface rounded-xl p-6 w-full max-w-md shadow-lg border border-border z-50">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              {(isDanger || isWarning) && (
                <div className={cn("p-2 rounded-full", isDanger ? "bg-status-errorBg text-status-error" : "bg-status-warningBg text-status-warning")}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
              <Dialog.Title className="text-lg font-semibold text-text">{title}</Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="text-text-muted hover:text-text p-1 rounded-md transition-colors focus:outline-none">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>
          
          <Dialog.Description className="text-sm text-text-muted mb-6">
            {description}
          </Dialog.Description>
          
          <div className="flex justify-end gap-3">
            <Dialog.Close asChild>
              <button className="px-4 py-2 text-sm font-medium text-charcoal bg-background border border-border rounded-md hover:bg-gray-100 transition-colors">
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-colors text-white",
                isDanger ? "bg-status-error hover:bg-red-700" :
                isWarning ? "bg-status-warning hover:bg-amber-600" :
                "bg-primary hover:bg-primary-dark"
              )}
            >
              {confirmText}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
