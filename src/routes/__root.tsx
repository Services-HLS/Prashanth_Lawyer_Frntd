import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useNavigate,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DisclaimerModal } from "../components/DisclaimerModal";
import { WriteReviewModal } from "../components/WriteReviewModal";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Prasanth Raju | Advocate & Counsel" },
      { name: "description", content: "Prasanth Raju — Advocate & Counsel practising at the Bombay High Court and Supreme Court of India." },
      { name: "author", content: "Prasanth Raju" },
      { property: "og:title", content: "Prasanth Raju | Advocate & Counsel" },
      { property: "og:description", content: "Prasanth Raju — Advocate & Counsel practising at the Bombay High Court and Supreme Court of India." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@PrasanthRaju" },
      { name: "twitter:title", content: "Prasanth Raju | Advocate & Counsel" },
      { name: "twitter:description", content: "Prasanth Raju — Advocate & Counsel practising at the Bombay High Court and Supreme Court of India." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c5951895-5e47-4bbb-9e29-dfe8a06a6ae9/id-preview-32188553--bc8269f1-9a9e-472a-b38d-f8bbef8610f6.lovable.app-1778232687494.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c5951895-5e47-4bbb-9e29-dfe8a06a6ae9/id-preview-32188553--bc8269f1-9a9e-472a-b38d-f8bbef8610f6.lovable.app-1778232687494.png" },
    ],
    links: [
      {
        rel: "icon",
        href: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚖️</text></svg>",
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isAccepted = sessionStorage.getItem("prasanth_raju_disclaimer_accepted") === "true";
    const lastActivity = sessionStorage.getItem("prasanth_raju_last_activity");

    if (isAccepted) {
      if (lastActivity) {
        const inactiveTime = Date.now() - Number(lastActivity);
        const tenMinutes = 10 * 60 * 1000; // 10 minutes inactivity window
        if (inactiveTime > tenMinutes) {
          // User has been inactive for too long, force showing disclaimer again
          sessionStorage.removeItem("prasanth_raju_disclaimer_accepted");
          sessionStorage.removeItem("prasanth_raju_last_activity");
          setAccepted(false);
        } else {
          setAccepted(true);
        }
      } else {
        // Accepted but no activity timestamp found, force showing disclaimer
        sessionStorage.removeItem("prasanth_raju_disclaimer_accepted");
        setAccepted(false);
      }
    } else {
      setAccepted(isAccepted);
    }
  }, []);

  // Track activity to update session activity timestamp
  useEffect(() => {
    if (accepted !== true) return;

    let isAttached = false;
    let lastWrite = 0;

    const updateActivityTimestamp = () => {
      const now = Date.now();
      // Throttle sessionStorage writes to at most once every 5 seconds for efficiency
      if (now - lastWrite > 5000) {
        sessionStorage.setItem("prasanth_raju_last_activity", now.toString());
        lastWrite = now;
      }
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "USER_ACTION") {
        updateActivityTimestamp();
      }
    };

    const attachIframeListeners = () => {
      const iframe = document.querySelector("iframe");
      if (iframe && iframe.contentWindow) {
        try {
          const doc = iframe.contentWindow.document;
          doc.addEventListener("click", updateActivityTimestamp, { passive: true });
          doc.addEventListener("keydown", updateActivityTimestamp, { passive: true });
          doc.addEventListener("scroll", updateActivityTimestamp, { passive: true });
          doc.addEventListener("touchstart", updateActivityTimestamp, { passive: true });
        } catch (e) {
          // Ignore cross-origin access issues
        }
      }
    };

    const cleanup = () => {
      if (!isAttached) return;
      isAttached = false;
      window.removeEventListener("click", updateActivityTimestamp);
      window.removeEventListener("keydown", updateActivityTimestamp);
      window.removeEventListener("scroll", updateActivityTimestamp);
      window.removeEventListener("touchstart", updateActivityTimestamp);
      window.removeEventListener("message", handleMessage);

      const iframe = document.querySelector("iframe");
      if (iframe) {
        iframe.removeEventListener("load", attachIframeListeners);
        if (iframe.contentWindow) {
          try {
            const doc = iframe.contentWindow.document;
            doc.removeEventListener("click", updateActivityTimestamp);
            doc.removeEventListener("keydown", updateActivityTimestamp);
            doc.removeEventListener("scroll", updateActivityTimestamp);
            doc.removeEventListener("touchstart", updateActivityTimestamp);
          } catch (e) {
            // Ignore cross-origin access issues
          }
        }
      }
    };

    const attachListeners = () => {
      isAttached = true;
      
      // Update once initially on activation
      updateActivityTimestamp();

      // Listen to parent wrapper interactions
      window.addEventListener("click", updateActivityTimestamp, { passive: true });
      window.addEventListener("keydown", updateActivityTimestamp, { passive: true });
      window.addEventListener("scroll", updateActivityTimestamp, { passive: true });
      window.addEventListener("touchstart", updateActivityTimestamp, { passive: true });
      window.addEventListener("message", handleMessage);

      // Listen directly to child iframe document
      const iframe = document.querySelector("iframe");
      if (iframe) {
        iframe.addEventListener("load", attachIframeListeners);
        attachIframeListeners();
      }
    };

    // 1 second delay after accepting disclaimer before tracking interactions
    // to prevent registering the click/movement to accept the disclaimer itself.
    const timer = setTimeout(attachListeners, 1000);

    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, [accepted]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;
      if (event.data.type === "OPEN_WRITE_REVIEW") {
        setWriteReviewOpen(true);
      } else if (event.data.type === "OPEN_VIEW_REVIEWS") {
        void navigate({ to: "/reviews" });
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

  const handleReviewSuccess = () => {
    // Notify the iframe to reload reviews track
    const iframe = document.querySelector("iframe");
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: "RELOAD_REVIEWS" }, "*");
    }
  };

  if (accepted === null) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      {!accepted && (
        <DisclaimerModal
          onAccept={() => {
            sessionStorage.setItem("prasanth_raju_disclaimer_accepted", "true");
            sessionStorage.setItem("prasanth_raju_last_activity", Date.now().toString());
            setAccepted(true);
          }}
        />
      )}

      {/* Review Modals */}
      <WriteReviewModal 
        isOpen={writeReviewOpen} 
        onClose={() => setWriteReviewOpen(false)} 
        onSuccess={handleReviewSuccess}
      />

      {/* Global Toaster for notifications */}
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
