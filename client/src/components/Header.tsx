import { ShoppingBag, Heart, User, Search, Menu, LogOut, ChevronDown, ChevronRight, UserCircle, Package, ListOrdered, X } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import instagramIcon from "@assets/instagram_1762445939344.png";
import facebookIcon from "@assets/communication_1762445935759.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef, type MouseEvent } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import logoImage from "@assets/PNG__B_ LOGO_1762442171742.png";
import longDressImg from "@assets/image_1762753411546.png";

// Category configuration with images
const categoryConfig = [
  {
    title: "Jamdani Paithani",
    slug: "Jamdani Paithani",
    image: longDressImg,
  },
  {
    title: "Khun / Irkal (Ilkal)",
    slug: "Khun Irkal",
    image: longDressImg,
  },
  {
    title: "Ajrakh Modal",
    slug: "Ajrakh Modal",
    image: longDressImg,
  },
  {
    title: "Mul Mul Cotton",
    slug: "Mul Mul Cotton",
    image: longDressImg,
  },
  {
    title: "Khadi Cotton",
    slug: "Khadi Cotton",
    image: longDressImg,
  },
  {
    title: "Patch Work",
    slug: "Patch Work",
    image: longDressImg,
  },
  {
    title: "Pure Linen",
    slug: "Pure Linen",
    image: longDressImg,
  },
];

interface HeaderProps {
  cartCount?: number;
  wishlistCount?: number;
  onMenuClick?: () => void;
}

export default function Header({ cartCount = 0, wishlistCount = 0, onMenuClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [storageUpdateTrigger, setStorageUpdateTrigger] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [showCategoryResults, setShowCategoryResults] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState<typeof categoryConfig>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Parse URL to determine active navigation state
  const getActiveNavState = () => {
    try {
      const url = new URL(window.location.href);
      const pathname = url.pathname;
      const searchParams = url.searchParams;
      const hash = url.hash;
      
      const hasCategory = pathname === "/products" && searchParams.has("category");
      const isOnContactSection = pathname === "/" && hash === "#contact";
      
      return {
        isHome: pathname === "/" && hash !== "#contact",
        isNewArrivals: pathname === "/new-arrivals",
        isTrending: pathname === "/trending-collection",
        isCategories: pathname === "/products" && (hasCategory || pathname === "/products"),
        isSale: pathname === "/sale",
        isAbout: pathname === "/about",
        isContact: isOnContactSection
      };
    } catch {
      // Fallback for environments without window
      return {
        isHome: location === "/" && !location.includes("#contact"),
        isNewArrivals: location === "/new-arrivals",
        isTrending: location === "/trending-collection",
        isCategories: location.includes("/products"),
        isSale: location === "/sale",
        isAbout: location === "/about",
        isContact: location.includes("#contact")
      };
    }
  };

  const navState = getActiveNavState();

  const { data: cart } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const { data: wishlist } = useQuery({
    queryKey: ["/api/wishlist"],
    enabled: !!user,
  });

  // Calculate cart count with fallback to local storage for guest users
  const getCartCount = () => {
    if (user && cart) {
      return (cart as any)?.items?.length || 0;
    }
    // Fallback to local storage for guest users
    const guestCart = localStorage.getItem("guest_cart");
    if (guestCart) {
      try {
        const parsedCart = JSON.parse(guestCart);
        return parsedCart.items?.length || 0;
      } catch {
        return 0;
      }
    }
    return cartCount;
  };

  // Calculate wishlist count with fallback to local storage for guest users
  const getWishlistCount = () => {
    if (user && wishlist) {
      return (wishlist as any)?.products?.length || 0;
    }
    // Fallback to local storage for guest users
    const guestWishlist = localStorage.getItem("guest_wishlist");
    if (guestWishlist) {
      try {
        const parsedWishlist = JSON.parse(guestWishlist);
        return parsedWishlist.products?.length || 0;
      } catch {
        return 0;
      }
    }
    return wishlistCount;
  };

  const actualCartCount = getCartCount();
  const actualWishlistCount = getWishlistCount();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Listen for cart/wishlist updates in localStorage
    const handleStorageChange = () => {
      setStorageUpdateTrigger(prev => prev + 1);
    };

    // Listen for custom events (when localStorage is updated programmatically in the same window)
    window.addEventListener('cartUpdated', handleStorageChange);
    window.addEventListener('wishlistUpdated', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('cartUpdated', handleStorageChange);
      window.removeEventListener('wishlistUpdated', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const matches = categoryConfig.filter(category =>
        category.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
      );
      setFilteredCategories(matches);
      setShowCategoryResults(true);
    } else {
      setShowCategoryResults(false);
      setFilteredCategories([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowCategoryResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    // Clear cart and other user-specific query caches
    queryClient.removeQueries({ queryKey: ["/api/cart"] });
    queryClient.removeQueries({ queryKey: ["/api/wishlist"] });
    queryClient.removeQueries({ queryKey: ["/api/addresses"] });
    queryClient.removeQueries({ queryKey: ["/api/orders"] });
    setLocation("/");
  };

  const handleContactClick = (e?: MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    setLocation("/");
    setTimeout(() => {
      const contactSection = document.getElementById("contact");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleHomeClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (location === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setLocation("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="grid grid-cols-3 items-center gap-6">
          <div className="flex items-start gap-3">
            <Button
              size="icon"
              variant="ghost"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              data-testid="button-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="hidden md:flex items-start gap-8">
              <a 
                href="https://www.instagram.com/ramanifashionindia/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity group"
                data-testid="link-instagram"
              >
                <img src={instagramIcon} alt="Instagram" className="h-6 w-6" />
                <span className="text-xs font-medium text-black">@ramanifashionindia</span>
              </a>
              <a 
                href="https://www.facebook.com/186191114586811" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity group"
                data-testid="link-facebook"
              >
                <img src={facebookIcon} alt="Facebook" className="h-6 w-6" />
                <span className="text-xs font-medium text-black">Ramani Fashion</span>
              </a>
              <a 
                href="https://chat.whatsapp.com/GqIsU9ZF2SJ9buuSKxGFWB" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity group"
                data-testid="link-whatsapp"
              >
                <SiWhatsapp className="h-6 w-6 text-green-600" />
                <span className="text-xs font-medium text-black">WhatsApp Group</span>
              </a>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Link href="/" className="flex items-center justify-center">
              <img 
                src={logoImage}
                alt="Ramani Fashion" 
                className="h-16 md:h-18 lg:h-20 w-auto object-contain transition-all duration-300 ease-in-out hover:scale-105 hover:brightness-110"
                data-testid="img-logo"
              />
            </Link>
          </div>

          <div className="flex items-center justify-end gap-6">
            <div className="hidden md:flex items-center relative" ref={searchRef}>
              <Search className="absolute left-4 h-6 w-6 text-gray-400 z-10" />
              <Input
                type="search"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-12 py-3 w-80 text-base bg-gray-50 border-gray-200 rounded-full focus:bg-white transition-colors"
                data-testid="input-search"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setShowCategoryResults(false);
                  }}
                  className="absolute right-4 h-6 w-6 text-gray-400 hover:text-gray-600 z-10"
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5" />
                </button>
              )}

              {showCategoryResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border-2 border-gray-100 z-50 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    {filteredCategories.length > 0 ? (
                      <>
                        <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Categories ({filteredCategories.length})
                        </p>
                        {filteredCategories.map((category) => (
                          <button
                            key={category.slug}
                            onClick={() => {
                              setLocation(`/products?category=${encodeURIComponent(category.slug)}`);
                              setSearchQuery("");
                              setShowCategoryResults(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-3 hover:bg-accent rounded-md transition-colors text-left"
                            data-testid={`search-result-${category.slug.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{category.title}</p>
                              <p className="text-xs text-muted-foreground">View all products</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="px-3 py-6 text-center">
                        <p className="text-sm font-semibold text-muted-foreground mb-1">
                          No matching category found
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Please try again with a different search term
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-12 w-12 hover:bg-gray-100" data-testid="button-account">
                    <User className="h-8 w-8" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-64 rounded-lg shadow-2xl border-2 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
                >
                  <div className="px-4 py-3 border-b bg-muted/50">
                    <p className="text-base font-bold text-foreground">
                      {user.name?.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                    </p>
                  </div>
                  <div className="py-2">
                    <DropdownMenuItem 
                      onClick={() => setLocation("/profile")} 
                      className="cursor-pointer px-4 py-3 text-base font-semibold transition-all duration-200 hover:pl-6 focus:bg-accent/50"
                      data-testid="menu-profile"
                    >
                      <UserCircle className="h-5 w-5 mr-3" />
                      <span>My Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setLocation("/orders")} 
                      className="cursor-pointer px-4 py-3 text-base font-semibold transition-all duration-200 hover:pl-6 focus:bg-accent/50"
                      data-testid="menu-orders"
                    >
                      <Package className="h-5 w-5 mr-3" />
                      <span>My Orders</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setLocation("/wishlist")} 
                      className="cursor-pointer px-4 py-3 text-base font-semibold transition-all duration-200 hover:pl-6 focus:bg-accent/50"
                      data-testid="menu-wishlist"
                    >
                      <Heart className="h-5 w-5 mr-3" />
                      <span>My Wishlist</span>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="py-2">
                    <DropdownMenuItem 
                      onClick={() => setLocation("/login?admin=true")} 
                      className="cursor-pointer px-4 py-3 text-base font-semibold transition-all duration-200 hover:pl-6 focus:bg-accent/50"
                      data-testid="menu-admin-login"
                    >
                      <UserCircle className="h-5 w-5 mr-3" />
                      <span>Login as Admin</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleLogout} 
                      className="cursor-pointer px-4 py-3 text-base font-semibold text-destructive focus:text-destructive transition-all duration-200 hover:pl-6 focus:bg-destructive/10"
                      data-testid="menu-logout"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" className="h-12 w-12 hover:bg-gray-100" onClick={() => setLocation("/login")} data-testid="button-login">
                <User className="h-8 w-8" />
              </Button>
            )}
            
            <Button variant="ghost" size="icon" className="relative h-12 w-12 hover:bg-gray-100" onClick={() => setLocation("/wishlist")} data-testid="button-wishlist">
              <Heart className="h-8 w-8" />
              {actualWishlistCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  data-testid="badge-wishlist-count"
                >
                  {actualWishlistCount}
                </Badge>
              )}
            </Button>
            
            <Button variant="ghost" size="icon" className="relative h-12 w-12 hover:bg-gray-100" onClick={() => setLocation("/cart")} data-testid="button-bag">
              <ShoppingBag className="h-8 w-8" />
              {actualCartCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  data-testid="badge-cart-count"
                >
                  {actualCartCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      <nav className="hidden md:block bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <NavigationMenu className="mx-auto">
            <NavigationMenuList className="flex items-center justify-center gap-8 py-2">
              <NavigationMenuItem>
                <a 
                  href="/" 
                  onClick={handleHomeClick} 
                  className={`nav-link px-4 py-2 tracking-wide text-base font-medium ${navState.isHome ? "active text-primary" : ""}`} 
                  data-testid="link-home"
                >
                  HOME
                </a>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link 
                  href="/new-arrivals" 
                  className={`nav-link px-4 py-2 tracking-wide text-base font-medium ${navState.isNewArrivals ? "active text-primary" : ""}`} 
                  data-testid="link-new-arrivals"
                >
                  NEW ARRIVALS
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link 
                  href="/trending-collection" 
                  className={`nav-link px-4 py-2 tracking-wide text-base font-medium ${navState.isTrending ? "active text-primary" : ""}`} 
                  data-testid="link-trending-collection"
                >
                  TRENDING COLLECTION
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger 
                  className={`px-4 py-2 tracking-wide text-base font-medium bg-transparent hover:bg-transparent data-[state=open]:bg-transparent ${navState.isCategories ? "nav-link active text-primary" : ""}`} 
                  data-testid="link-categories"
                >
                  CATEGORIES
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
                  <div className="w-[800px] p-6">
                    <div className="grid grid-cols-4 gap-4">
                      {categoryConfig.map((category) => (
                        <Link
                          key={category.slug}
                          href={`/products?category=${encodeURIComponent(category.slug)}`}
                          className="group block select-none rounded-md overflow-hidden border border-gray-200 hover-elevate transition-all"
                          data-testid={`category-${category.slug.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <div className="aspect-[3/4] overflow-hidden">
                            <img 
                              src={category.image} 
                              alt={category.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="p-3 bg-white">
                            <p className="text-sm font-medium text-center text-foreground leading-tight">
                              {category.title}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link 
                  href="/sale" 
                  className={`nav-link px-4 py-2 tracking-wide text-base font-medium ${navState.isSale ? "active text-primary" : ""}`} 
                  data-testid="link-sale"
                >
                  SALE
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link 
                  href="/about" 
                  className={`nav-link px-4 py-2 tracking-wide text-base font-medium ${navState.isAbout ? "active text-primary" : ""}`} 
                  data-testid="link-about"
                >
                  ABOUT US
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <button 
                  onClick={handleContactClick} 
                  className={`nav-link px-4 py-2 tracking-wide text-base font-medium bg-transparent border-0 cursor-pointer ${navState.isContact ? "active text-primary" : ""}`}
                  data-testid="link-contact"
                >
                  CONTACT
                </button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle className="text-xl font-bold">Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col h-[calc(100vh-80px)] overflow-y-auto">
            <div className="flex flex-col gap-1 p-3">
              <Link
                href="/"
                className={`text-base font-medium py-3 px-4 rounded-md hover-elevate transition-colors ${navState.isHome ? "bg-primary/10 text-primary" : "text-foreground"}`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-home"
              >
                HOME
              </Link>
              <Link
                href="/new-arrivals"
                className={`text-base font-medium py-3 px-4 rounded-md hover-elevate transition-colors ${navState.isNewArrivals ? "bg-primary/10 text-primary" : "text-foreground"}`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-new-arrivals"
              >
                NEW ARRIVALS
              </Link>
              <Link
                href="/trending-collection"
                className={`text-base font-medium py-3 px-4 rounded-md hover-elevate transition-colors ${navState.isTrending ? "bg-primary/10 text-primary" : "text-foreground"}`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-trending"
              >
                TRENDING COLLECTION
              </Link>
            </div>
            
            <div className="border-t">
              <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-3 px-4 text-base font-medium hover-elevate transition-colors group">
                  <span className="text-foreground">CATEGORIES</span>
                  <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${categoriesOpen ? "rotate-90" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pb-2">
                  <div className="flex flex-col gap-1 pl-4 pr-3">
                    <Link
                      href="/products?category=Jamdani Paithani"
                      className="text-sm py-2.5 px-4 block rounded-md hover-elevate transition-colors text-muted-foreground hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-category-jamdani"
                    >
                      Jamdani Paithani
                    </Link>
                    <Link
                      href="/products?category=Khun Irkal"
                      className="text-sm py-2.5 px-4 block rounded-md hover-elevate transition-colors text-muted-foreground hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-category-khun"
                    >
                      Khun / Irkal (Ilkal)
                    </Link>
                    <Link
                      href="/products?category=Ajrakh Modal"
                      className="text-sm py-2.5 px-4 block rounded-md hover-elevate transition-colors text-muted-foreground hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-category-ajrakh"
                    >
                      Ajrakh Modal
                    </Link>
                    <Link
                      href="/products?category=Mul Mul Cotton"
                      className="text-sm py-2.5 px-4 block rounded-md hover-elevate transition-colors text-muted-foreground hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-category-mul"
                    >
                      Mul Mul Cotton
                    </Link>
                    <Link
                      href="/products?category=Khadi Cotton"
                      className="text-sm py-2.5 px-4 block rounded-md hover-elevate transition-colors text-muted-foreground hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-category-khadi"
                    >
                      Khadi Cotton
                    </Link>
                    <Link
                      href="/products?category=Patch Work"
                      className="text-sm py-2.5 px-4 block rounded-md hover-elevate transition-colors text-muted-foreground hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-category-patch"
                    >
                      Patch Work
                    </Link>
                    <Link
                      href="/products?category=Pure Linen"
                      className="text-sm py-2.5 px-4 block rounded-md hover-elevate transition-colors text-muted-foreground hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-category-linen"
                    >
                      Pure Linen
                    </Link>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            <div className="border-t flex flex-col gap-1 p-3">
              <Link
                href="/sale"
                className={`text-base font-medium py-3 px-4 block rounded-md hover-elevate transition-colors ${navState.isSale ? "bg-primary/10 text-primary" : "text-foreground"}`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-sale"
              >
                SALE
              </Link>
              <Link
                href="/about"
                className={`text-base font-medium py-3 px-4 block rounded-md hover-elevate transition-colors ${navState.isAbout ? "bg-primary/10 text-primary" : "text-foreground"}`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-about"
              >
                ABOUT US
              </Link>
              <button
                onClick={() => {
                  handleContactClick();
                  setMobileMenuOpen(false);
                }}
                className={`text-base font-medium py-3 px-4 block rounded-md hover-elevate text-left w-full transition-colors ${navState.isContact ? "bg-primary/10 text-primary" : "text-foreground"}`}
                data-testid="mobile-link-contact"
              >
                CONTACT
              </button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
