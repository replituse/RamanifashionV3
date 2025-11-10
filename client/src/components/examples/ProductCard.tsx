import ProductCard from '../ProductCard';
import productImage from '@assets/generated_images/Cotton_saree_product_3295c949.png';
import secondaryImage from '@assets/generated_images/Party_wear_saree_86e79eab.png';

export default function ProductCardExample() {
  return (
    <div className="p-8 max-w-xs">
      <ProductCard
        id="1"
        name="Beautiful Floral Cotton Saree with Elegant Border Work"
        image={productImage}
        secondaryImage={secondaryImage}
        price={2499}
        originalPrice={4999}
        discount={50}
        rating={4.5}
        reviewCount={128}
        isNewArrival={true}
        onAddToCart={() => console.log('Added to cart')}
        onAddToWishlist={() => console.log('Added to wishlist')}
        onClick={() => console.log('Product clicked')}
      />
    </div>
  );
}
