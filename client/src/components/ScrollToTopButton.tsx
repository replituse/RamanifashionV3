import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [location] = useLocation();
  
  const isAdminPage = location.startsWith("/admin");

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (isAdminPage) {
    return null;
  }

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 left-8 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-pink-600 via-pink-500 to-pink-700 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-pink-500/50 hover:from-pink-500 hover:via-pink-400 hover:to-pink-600 active:scale-95 flex items-center justify-center group border-2 border-pink-400/30"
          aria-label="Scroll to top"
          data-testid="button-scroll-to-top"
        >
          <ArrowUp className="h-6 w-6 transition-transform duration-300 group-hover:-translate-y-1" />
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      )}
    </>
  );
}
