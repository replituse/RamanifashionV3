import { useLocation } from "wouter";
import { motion } from "framer-motion";
import CircularCategoryTile from "./CircularCategoryTile";

interface Category {
  name: string;
  image: string;
}

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const [, setLocation] = useLocation();

  // Only show first 8 categories for 4+4 grid
  const displayCategories = categories.slice(0, 8);

  return (
    <section className="relative py-12 md:py-16 overflow-hidden" style={{ backgroundColor: 'rgba(250, 220, 235, 0.7)' }}>
      <div className="relative max-w-7xl mx-auto px-4">
        <motion.div 
          className="text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold font-serif bg-primary text-white border-2 border-white rounded-full px-6 md:px-8 py-2 md:py-3 inline-block" data-testid="text-section-category-grid">
            Shop by Category
          </h2>
        </motion.div>

        {/* 4+4 Grid Layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 max-w-5xl mx-auto">
          {displayCategories.map((category, index) => (
            <div key={category.name} className="flex justify-center">
              <CircularCategoryTile
                name={category.name}
                image={category.image}
                delay={index * 0.1}
                onClick={() => {
                  if (category.name === "Sale") {
                    setLocation("/sale");
                  } else {
                    setLocation(`/products?category=${encodeURIComponent(category.name)}`);
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
