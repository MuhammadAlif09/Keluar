import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

const DrawerTrigger = DialogPrimitive.Trigger;
const DrawerPortal = DialogPrimitive.Portal;
const DrawerClose = DialogPrimitive.Close;

type DrawerContextType = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const DrawerContext = React.createContext<DrawerContextType>({});

type DragContextType = {
  dragHandlers: {
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => void;
  };
};

const DrawerDragContext = React.createContext<DragContextType | null>(null);

function Drawer({
  open,
  onOpenChange,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return (
    <DrawerContext.Provider value={{ open, onOpenChange }}>
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange} {...props}>
        {children}
      </DialogPrimitive.Root>
    </DrawerContext.Provider>
  );
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] drawer-overlay-backdrop",
        className,
      )}
      {...props}
    />
  );
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  const { onOpenChange } = React.useContext(DrawerContext);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const dragRef = React.useRef<{
    isDragging: boolean;
    startY: number;
    startTime: number;
    currentTranslateY: number;
    pointerId: number | null;
  }>({
    isDragging: false,
    startY: 0,
    startTime: 0,
    currentTranslateY: 0,
    pointerId: null,
  });

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Hanya tangani tombol mouse utama (kiri) atau touch
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    // Jangan tangani jika mengklik tombol atau input interaktif
    if (
      target.closest("button") ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest("select") ||
      target.closest("[role='button']")
    ) {
      return;
    }

    const content = contentRef.current;
    if (!content) return;

    dragRef.current.isDragging = true;
    dragRef.current.startY = e.clientY;
    dragRef.current.startTime = performance.now();
    dragRef.current.currentTranslateY = 0;
    dragRef.current.pointerId = e.pointerId;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // fallback
    }

    content.style.transition = "none";
    content.style.animation = "none";
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.isDragging) return;
    const content = contentRef.current;
    if (!content) return;

    const deltaY = e.clientY - dragRef.current.startY;
    let translateY = 0;

    if (deltaY > 0) {
      // Menarik ke bawah: langsung ikuti kursor / jari 1:1
      translateY = deltaY;
    } else {
      // Menarik ke atas: efek karet (resistance)
      translateY = deltaY * 0.15;
    }

    dragRef.current.currentTranslateY = translateY;
    content.style.transform = `translate3d(0, ${translateY}px, 0)`;
  };

  const onPointerUpOrCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;

    try {
      if (dragRef.current.pointerId !== null) {
        e.currentTarget.releasePointerCapture(dragRef.current.pointerId);
      }
    } catch {
      // fallback
    }
    dragRef.current.pointerId = null;

    const content = contentRef.current;
    if (!content) return;

    const elapsed = Math.max(1, performance.now() - dragRef.current.startTime);
    const deltaY = dragRef.current.currentTranslateY;
    const velocity = deltaY / elapsed; // px per millisecond

    // Jika ditarik lebih dari 90px atau ditarik cepat ke bawah (flick gesture): tutup drawer
    if (deltaY > 90 || (deltaY > 25 && velocity > 0.35)) {
      content.style.transition = "transform 220ms cubic-bezier(0.32, 0, 0.67, 0)";
      content.style.transform = "translate3d(0, 100%, 0)";
      setTimeout(() => {
        onOpenChange?.(false);
      }, 190);
    } else {
      // Kembalikan ke posisi semula dengan transisi pegas halus
      content.style.transition = "transform 260ms cubic-bezier(0.16, 1, 0.3, 1)";
      content.style.transform = "translate3d(0, 0, 0)";
    }
  };

  const dragHandlers = {
    onPointerDown,
    onPointerMove,
    onPointerUp: onPointerUpOrCancel,
    onPointerCancel: onPointerUpOrCancel,
  };

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DialogPrimitive.Content
        ref={contentRef}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          props.onCloseAutoFocus?.(e);
        }}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-2xl border-t border-border/70 bg-card text-card-foreground shadow-2xl outline-none overflow-hidden drawer-content-sheet",
          className,
        )}
        {...props}
      >
        <DrawerDragContext.Provider value={{ dragHandlers }}>
          {/* Handle bar penarik: lebar, visual jelas, interaktif dengan kursor desktop & touch Android */}
          <div
            {...dragHandlers}
            className="group flex w-full cursor-grab active:cursor-grabbing flex-col items-center justify-center pt-3 pb-1 touch-none select-none"
            title="Tarik ke bawah untuk menutup"
            aria-label="Tarik menu untuk menutup"
          >
            <div className="h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/30 transition-all duration-200 group-hover:bg-muted-foreground/50 group-active:scale-x-110 group-active:bg-muted-foreground/70" />
          </div>
          {children}
        </DrawerDragContext.Provider>
      </DialogPrimitive.Content>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  const dragContext = React.useContext(DrawerDragContext);
  return (
    <div
      {...dragContext?.dragHandlers}
      className={cn(
        "flex flex-col gap-1 px-5 pt-1 pb-2 cursor-grab active:cursor-grabbing touch-none select-none",
        className,
      )}
      {...props}
    />
  );
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("font-display text-xl font-medium tracking-tight", className)}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
};
