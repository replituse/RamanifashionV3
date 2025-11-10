import { useLocation } from "wouter";
import { motion } from "framer-motion";
import CircularCategoryTile from "./CircularCategoryTile";

interface Category {
  name: string;
  image: string;
}

interface HorizontalCategoriesProps {
  categories: Category[];
}

export default function HorizontalCategories({ categories }: HorizontalCategoriesProps) {
  const [, setLocation] = useLocation();

  return (
    <section className="relative py-12 md:py-16 overflow-hidden">
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400"><rect fill="%23f5e6d3" width="1200" height="400"/><path d="M0,200 Q300,150 600,200 T1200,200 L1200,400 L0,400 Z" fill="%23ffe4e1" opacity="0.5"/></svg>')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <div className="relative max-w-7xl mx-auto px-4">
        <motion.div 
          className="text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold font-serif bg-primary text-white border-2 border-white rounded-full px-6 md:px-8 py-2 md:py-3 inline-block" data-testid="text-section-categories">
            Shop by Category
          </h2>
        </motion.div>

        <div className="relative">
          <div className="flex overflow-x-auto gap-3 md:gap-4 lg:gap-5 pb-6 scrollbar-hide">
            {categories.map((category, index) => (
              <CircularCategoryTile
                key={category.name}
                name={category.name}
                image={category.image}
                delay={index * 0.1}
                testIdPrefix="category-horizontal"
                onClick={() => {
                  if (category.name === "Sale") {
                    setLocation("/sale");
                  } else {
                    setLocation(`/products?category=${encodeURIComponent(category.name)}`);
                  }
                }}
              />
            ))}
          </div>
        </div>

        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </section>
  );
}
