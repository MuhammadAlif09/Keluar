import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const DrawerTrigger = DialogPrimitive.Trigger;
const DrawerPortal = DialogPrimitive.Portal;
const DrawerClose = DialogPrimitive.Close;

type DrawerContextType = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
  requestClose?: () => void;
  _registerRequestClose?: (fn: () => void) => void;
};

const DrawerContext = React.createContext<DrawerContextType>({});

type DragContextType = {
  dragHandlers: {
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => void;
  };
  requestClose: () => void;
};

const DrawerDragContext = React.createContext<DragContextType | null>(null);

function Drawer({
  open,
  onOpenChange,
  triggerRef,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root> & {
  triggerRef?: React.RefObject<HTMLElement | null>;
}) {
  const requestCloseRef = React.useRef<(() => void) | null>(null);

  const requestClose = React.useCallback(() => {
    if (requestCloseRef.current) {
      requestCloseRef.current();
    } else {
      onOpenChange?.(false);
    }
  }, [onOpenChange]);

  const registerRequestClose = React.useCallback((fn: () => void) => {
    requestCloseRef.current = fn;
  }, []);

  return (
    <DrawerContext.Provider
      value={{
        open,
        onOpenChange,
        triggerRef,
        requestClose,
        _registerRequestClose: registerRequestClose,
      }}
    >
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
  const { onOpenChange, triggerRef, _registerRequestClose } =
    React.useContext(DrawerContext);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const isClosingRef = React.useRef(false);
  const triggerRectRef = React.useRef<DOMRect | null>(null);

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

  const prefersReducedMotion = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Hitung insets tombol relatif terhadap sheet modal
  const getInsets = React.useCallback(() => {
    const content = contentRef.current;
    const triggerEl = triggerRef?.current;
    if (!content || !triggerEl) return null;

    const s = content.getBoundingClientRect();
    const b = triggerRectRef.current || triggerEl.getBoundingClientRect();

    const topInset = Math.max(0, b.top - s.top);
    const bottomInset = Math.max(0, s.bottom - b.bottom);
    const leftInset = Math.max(0, b.left - s.left);
    const rightInset = Math.max(0, s.right - b.right);

    return { topInset, bottomInset, leftInset, rightInset };
  }, [triggerRef]);

  // Fungsi tutup dengan morph menyusut ke tombol
  const performClose = React.useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    const content = contentRef.current;
    const triggerEl = triggerRef?.current;

    const finalizeClose = () => {
      if (triggerEl) {
        triggerEl.style.visibility = "";
      }
      onOpenChange?.(false);
    };

    if (!content) {
      finalizeClose();
      return;
    }

    if (prefersReducedMotion || !triggerEl) {
      const fadeAnim = content.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        { duration: 180, easing: "ease-in", fill: "forwards" },
      );
      fadeAnim.onfinish = finalizeClose;
      return;
    }

    const insets = getInsets();
    if (!insets) {
      finalizeClose();
      return;
    }

    const { topInset, bottomInset, leftInset, rightInset } = insets;

    // Fade out form children dengan cepat
    if (bodyRef.current) {
      bodyRef.current.animate(
        [
          { opacity: 1, transform: "translate3d(0, 0, 0)" },
          { opacity: 0, transform: "translate3d(0, 10px, 0)" },
        ],
        { duration: 160, easing: "ease-in", fill: "forwards" },
      );
    }

    // Morph menyusut penuh menjadi bentuk tombol
    const closeAnim = content.animate(
      [
        {
          clipPath: "inset(0px 0px 0px 0px round 16px 16px 0px 0px)",
          backgroundColor: "var(--color-card, #faf7f1)",
        },
        {
          clipPath: `inset(${topInset}px ${rightInset}px ${bottomInset}px ${leftInset}px round 12px)`,
          backgroundColor: "var(--color-primary, #1c4539)",
        },
      ],
      {
        duration: 380,
        easing: "cubic-bezier(0.32, 0.72, 0, 1)",
        fill: "forwards",
      },
    );

    closeAnim.onfinish = finalizeClose;
  }, [getInsets, onOpenChange, prefersReducedMotion, triggerRef]);

  // Daftarkan handler tutup ke context
  React.useEffect(() => {
    _registerRequestClose?.(performClose);
  }, [_registerRequestClose, performClose]);

  // Morph pembuka saat menu pertama kali muncul
  React.useEffect(() => {
    const content = contentRef.current;
    const triggerEl = triggerRef?.current;
    if (!content) return;

    if (triggerEl) {
      triggerRectRef.current = triggerEl.getBoundingClientRect();
      triggerEl.style.visibility = "hidden";
    }

    if (prefersReducedMotion || !triggerEl) {
      content.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 200,
        easing: "ease-out",
        fill: "forwards",
      });
      return;
    }

    const insets = getInsets();
    if (!insets) return;

    const { topInset, bottomInset, leftInset, rightInset } = insets;

    // Animasi morph dari posisi & ukuran tombol menuju menu penuh
    const openAnim = content.animate(
      [
        {
          clipPath: `inset(${topInset}px ${rightInset}px ${bottomInset}px ${leftInset}px round 12px)`,
          backgroundColor: "var(--color-primary, #1c4539)",
        },
        {
          clipPath: "inset(0px 0px 0px 0px round 16px 16px 0px 0px)",
          backgroundColor: "var(--color-card, #faf7f1)",
        },
      ],
      {
        duration: 420,
        easing: "cubic-bezier(0.32, 0.72, 0, 1)",
        fill: "forwards",
      },
    );

    // Isi form fade-in + naik sedikit mulai di 40% animasi
    if (bodyRef.current) {
      bodyRef.current.animate(
        [
          { opacity: 0, transform: "translate3d(0, 16px, 0)", offset: 0 },
          { opacity: 0, transform: "translate3d(0, 12px, 0)", offset: 0.4 },
          { opacity: 1, transform: "translate3d(0, 0, 0)", offset: 1 },
        ],
        {
          duration: 420,
          easing: "cubic-bezier(0.32, 0.72, 0, 1)",
          fill: "forwards",
        },
      );
    }

    openAnim.onfinish = () => {
      content.style.removeProperty("clip-path");
      content.style.removeProperty("background-color");
    };

    return () => {
      // Pastikan tombol kembali tampil jika unmounted tak terduga
      if (triggerEl) {
        triggerEl.style.visibility = "";
      }
    };
  }, [getInsets, prefersReducedMotion, triggerRef]);

  // Drag Gesture Handlers
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || isClosingRef.current) return;
    const target = e.target as HTMLElement;
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
    if (!dragRef.current.isDragging || isClosingRef.current) return;
    const content = contentRef.current;
    if (!content) return;

    const deltaY = e.clientY - dragRef.current.startY;
    dragRef.current.currentTranslateY = deltaY;

    if (deltaY > 0) {
      // Menarik ke bawah: clip-path ikut mengecil progresif 1:1 mengikuti jari
      const insets = getInsets();
      if (insets) {
        const { topInset, bottomInset, leftInset, rightInset } = insets;
        const p = Math.min(1, deltaY / Math.max(120, topInset));
        const curTop = topInset * p;
        const curBottom = bottomInset * p;
        const curLeft = leftInset * p;
        const curRight = rightInset * p;
        const curRadius = Math.max(12, 16 - 4 * p);

        content.style.clipPath = `inset(${curTop}px ${curRight}px ${curBottom}px ${curLeft}px round ${curRadius}px)`;
      }

      // Isi form memudar saat ditarik
      if (bodyRef.current) {
        bodyRef.current.style.opacity = String(Math.max(0, 1 - deltaY / 90));
      }
    } else {
      // Tarik ke atas dengan resistensi karet
      const rubber = deltaY * 0.15;
      content.style.transform = `translate3d(0, ${rubber}px, 0)`;
    }
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
    const velocity = deltaY / elapsed;

    const insets = getInsets();
    const topInset = insets?.topInset ?? 200;
    const bottomInset = insets?.bottomInset ?? 20;
    const leftInset = insets?.leftInset ?? 16;
    const rightInset = insets?.rightInset ?? 16;

    // Ambang 90px atau flick cepat: tutup menyusut ke bentuk tombol
    if (deltaY > 90 || (deltaY > 25 && velocity > 0.35)) {
      isClosingRef.current = true;
      const triggerEl = triggerRef?.current;

      const p = Math.min(1, deltaY / Math.max(120, topInset));
      const curTop = topInset * p;
      const curBottom = bottomInset * p;
      const curLeft = leftInset * p;
      const curRight = rightInset * p;
      const curRadius = Math.max(12, 16 - 4 * p);

      const anim = content.animate(
        [
          {
            clipPath: `inset(${curTop}px ${curRight}px ${curBottom}px ${curLeft}px round ${curRadius}px)`,
            backgroundColor: "var(--color-card, #faf7f1)",
          },
          {
            clipPath: `inset(${topInset}px ${rightInset}px ${bottomInset}px ${leftInset}px round 12px)`,
            backgroundColor: "var(--color-primary, #1c4539)",
          },
        ],
        {
          duration: 320,
          easing: "cubic-bezier(0.32, 0.72, 0, 1)",
          fill: "forwards",
        },
      );

      anim.onfinish = () => {
        if (triggerEl) triggerEl.style.visibility = "";
        onOpenChange?.(false);
      };
    } else {
      // Belum melewati ambang: kembali ke bentuk penuh dengan efek pegas
      const p = Math.max(0, Math.min(1, deltaY / Math.max(120, topInset)));
      const curTop = topInset * p;
      const curBottom = bottomInset * p;
      const curLeft = leftInset * p;
      const curRight = rightInset * p;
      const curRadius = Math.max(12, 16 - 4 * p);

      const springAnim = content.animate(
        [
          {
            clipPath: `inset(${curTop}px ${curRight}px ${curBottom}px ${curLeft}px round ${curRadius}px)`,
            transform: content.style.transform || "translate3d(0, 0, 0)",
          },
          {
            clipPath: "inset(0px 0px 0px 0px round 16px 16px 0px 0px)",
            transform: "translate3d(0, 0, 0)",
          },
        ],
        {
          duration: 300,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "forwards",
        },
      );

      if (bodyRef.current) {
        bodyRef.current.animate(
          [
            { opacity: Number(bodyRef.current.style.opacity) || 0.5 },
            { opacity: 1 },
          ],
          { duration: 250, easing: "ease-out", fill: "forwards" },
        );
      }

      // PERBAIKAN BUG: Hapus seluruh style inline setelah snap-back selesai
      springAnim.onfinish = () => {
        content.style.removeProperty("clip-path");
        content.style.removeProperty("transform");
        content.style.removeProperty("transition");
        content.style.removeProperty("animation");
        if (bodyRef.current) {
          bodyRef.current.style.removeProperty("opacity");
          bodyRef.current.style.removeProperty("transform");
        }
      };
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
      <DrawerOverlay onClick={performClose} />
      <DialogPrimitive.Content
        ref={contentRef}
        data-morph={Boolean(triggerRef?.current)}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          performClose();
        }}
        onPointerDownOutside={(e) => {
          e.preventDefault();
          performClose();
        }}
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
        <DrawerDragContext.Provider value={{ dragHandlers, requestClose: performClose }}>
          {/* Handle bar penarik: lebar, visual jelas, interaktif dengan kursor desktop & touch Android */}
          <div
            {...dragHandlers}
            className="group flex w-full cursor-grab active:cursor-grabbing flex-col items-center justify-center pt-3 pb-1 touch-none select-none"
            title="Tarik ke bawah untuk menutup"
            aria-label="Tarik menu untuk menutup"
          >
            <div className="h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/30 transition-all duration-200 group-hover:bg-muted-foreground/50 group-active:scale-x-110 group-active:bg-muted-foreground/70" />
          </div>

          <div ref={bodyRef} className="flex flex-1 flex-col overflow-hidden">
            {children}
          </div>
        </DrawerDragContext.Provider>
      </DialogPrimitive.Content>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, children, ...props }: React.ComponentProps<"div">) {
  const dragContext = React.useContext(DrawerDragContext);
  return (
    <div
      {...dragContext?.dragHandlers}
      className={cn(
        "relative flex flex-col gap-1 px-5 pt-1 pb-2 cursor-grab active:cursor-grabbing touch-none select-none",
        className,
      )}
      {...props}
    >
      {children}
      {dragContext?.requestClose && (
        <button
          type="button"
          onClick={dragContext.requestClose}
          className="absolute right-3.5 top-1.5 flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-90 cursor-pointer"
          aria-label="Tutup menu"
          title="Tutup"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
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
