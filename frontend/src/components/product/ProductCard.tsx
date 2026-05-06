import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBagIcon, StarIcon } from '@heroicons/react/24/solid';
import { ShoppingBagIcon as ShoppingBagOutline } from '@heroicons/react/24/outline';
import type { Product } from '../../services/productService';
import { useCartStore } from '../../store/cartStore';
import { useToast } from '../common/Toast';

interface ProductCardProps {
  product: Product;
}

const fmt = (n: number) =>
  n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCartStore();
  const { showToast } = useToast();

  const image = product.images?.[0] ?? '';
  const isOutOfStock = product.stock === 0;
  const category =
    product.category !== null && typeof product.category === 'object'
      ? product.category.name
      : '';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addItem({
      _id: product._id,
      name: product.name,
      price: product.price,
      image,
      stock: product.stock,
    });
    showToast(`Đã thêm "${product.name}" vào giỏ hàng`, 'success');
  };

  return (
    <Link
      to={`/product/${product._id}`}
      className="group relative bg-white rounded-[16px] border border-[#E5E5E5] overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-product-hover hover:border-[#D4D4D4] flex flex-col"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-[#F5F5F5] aspect-square">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">💡</div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span
              className="bg-white/90 text-[#EF4444] text-[12px] font-[700] px-3 py-1 rounded-full"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Hết hàng
            </span>
          </div>
        )}

        {/* Quick Add button — shows on hover */}
        {!isOutOfStock && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 bg-[#D946EF] hover:bg-[#C026D3] text-white text-[12px] font-[700] rounded-full px-4 py-2 flex items-center gap-1.5 shadow-medium whitespace-nowrap cursor-pointer"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            <ShoppingBagIcon className="w-3.5 h-3.5" />
            Thêm vào giỏ
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category tag */}
        {category && (
          <span
            className="text-[11px] font-[700] text-[#D946EF] uppercase tracking-widest mb-1"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            {category}
          </span>
        )}

        {/* Name */}
        <h3
          className="text-[14px] font-[700] text-[#171717] line-clamp-2 leading-snug mb-2 flex-1"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          {product.name}
        </h3>

        {/* Stars (decorative) */}
        <div className="flex items-center gap-0.5 mb-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <StarIcon key={s} className={`w-3 h-3 ${s <= 4 ? 'text-[#FACC15]' : 'text-[#E5E5E5]'}`} />
          ))}
          <span
            className="text-[11px] text-[#A3A3A3] ml-1"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            (4.0)
          </span>
        </div>

        {/* Price + Add button row */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <span
            className="text-[16px] font-[800] text-[#171717]"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            {fmt(product.price)}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-9 h-9 rounded-full bg-[#D946EF] hover:bg-[#C026D3] text-white flex items-center justify-center transition-all duration-200 shadow-medium hover:shadow-large disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
            title="Thêm vào giỏ"
          >
            <ShoppingBagOutline className="w-4 h-4" />
          </button>
        </div>

        {/* Stock indicator */}
        {!isOutOfStock && product.stock <= 5 && (
          <p
            className="text-[11px] text-[#F59E0B] font-[600] mt-1.5"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            ⚠ Chỉ còn {product.stock} sản phẩm
          </p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
