import React, { createContext, useContext } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import type { BaseModalProps, BaseComponentProps } from "@/types";

// Context for compound modal components
interface ModalContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("Modal compound components must be used within CompoundModal");
  }
  return context;
}

// Main compound modal component
interface CompoundModalProps extends Omit<BaseModalProps, 'children'> {
  children: React.ReactNode;
}

function CompoundModal({ open, onOpenChange, children, ...props }: CompoundModalProps) {
  return (
    <ModalContext.Provider value={{ open, onOpenChange }}>
      <BaseModal open={open} onOpenChange={onOpenChange} {...props}>
        {children}
      </BaseModal>
    </ModalContext.Provider>
  );
}

// Trigger component
interface ModalTriggerProps extends BaseComponentProps {
  asChild?: boolean;
}

function ModalTrigger({ children, asChild = false }: ModalTriggerProps) {
  const { onOpenChange } = useModalContext();
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...children.props,
      onClick: (e: any) => {
        children.props.onClick?.(e);
        onOpenChange(true);
      },
    } as any);
  }

  return (
    <button onClick={() => onOpenChange(true)}>
      {children}
    </button>
  );
}

// Content component
function ModalContent({ children, className }: BaseComponentProps) {
  return <div className={className}>{children}</div>;
}

// Header component
function ModalHeader({ children, className }: BaseComponentProps) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

// Footer component
function ModalFooter({ children, className }: BaseComponentProps) {
  return <div className={`mt-6 flex justify-end gap-2 ${className}`}>{children}</div>;
}

// Body component
function ModalBody({ children, className }: BaseComponentProps) {
  return <div className={`flex-1 ${className}`}>{children}</div>;
}

// Compose compound modal
CompoundModal.Trigger = ModalTrigger;
CompoundModal.Content = ModalContent;
CompoundModal.Header = ModalHeader;
CompoundModal.Body = ModalBody;
CompoundModal.Footer = ModalFooter;

export { CompoundModal, useModalContext };