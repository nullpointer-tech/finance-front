import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { transactionService } from '@/services/transactionService';
import { Product, Category } from '@/types';
import { format } from 'date-fns';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type TabType = 'expense' | 'income';

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('expense');
  
  // Form fields
  const [amount, setAmount] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [productInput, setProductInput] = useState<string>('');
  const [categoryInput, setCategoryInput] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  
  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  
  // Dropdown states
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
      // Always reset to expense tab when opening
      setActiveTab('expense');
    }
  }, [isOpen]);

  useEffect(() => {
    // Filter products based on input
    if (productInput) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(productInput.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [productInput, products]);

  useEffect(() => {
    // Filter categories based on input
    if (categoryInput) {
      const filtered = categories.filter(c => 
        c.name.toLowerCase().includes(categoryInput.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [categoryInput, categories]);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        transactionService.getProducts(),
        transactionService.getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setFilteredProducts(productsData);
      setFilteredCategories(categoriesData);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const resetForm = () => {
    setActiveTab('expense');
    setAmount('');
    setQuantity(1);
    setProductInput('');
    setCategoryInput('');
    setNote('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setShowProductDropdown(false);
    setShowCategoryDropdown(false);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!productInput.trim() || !categoryInput.trim()) {
        setError('Please enter both product and category');
        setIsSubmitting(false);
        return;
      }

      const transactionData = {
        amount: parseFloat(amount) * quantity,
        type: activeTab,
        category_name: categoryInput.trim(),
        product_name: productInput.trim(),
        purchase_date: date, // Send the selected date
        note: note || undefined,
      };

      console.log('Creating transaction:', transactionData);
      await transactionService.createTransaction(transactionData);
      
      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error('Error creating transaction:', err);
      setError(err.response?.data?.detail || 'Failed to create transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectProduct = (productName: string) => {
    setProductInput(productName);
    setShowProductDropdown(false);
  };

  const selectCategory = (categoryName: string) => {
    setCategoryInput(categoryName);
    setShowCategoryDropdown(false);
  };

  const handleProductInputChange = (value: string) => {
    setProductInput(value);
    setShowProductDropdown(true);
  };

  const handleCategoryInputChange = (value: string) => {
    setCategoryInput(value);
    setShowCategoryDropdown(true);
  };

  if (!isOpen) return null;

  const getProductLabel = () => activeTab === 'income' ? 'Income Source' : 'Product';
  const getCategoryLabel = () => activeTab === 'income' ? 'Company' : 'Category';

  const isNewProduct = productInput && !products.some(p => p.name.toLowerCase() === productInput.toLowerCase());
  const isNewCategory = categoryInput && !categories.some(c => c.name.toLowerCase() === categoryInput.toLowerCase());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-800">Add Transaction</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6 bg-white sticky top-[73px] z-10">
          <button
            onClick={() => setActiveTab('expense')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'expense'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Expense
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'income'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Income
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Amount and Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (PLN) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Product/Income Source - ComboBox */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getProductLabel()} *
            </label>
            <input
              type="text"
              value={productInput}
              onChange={(e) => handleProductInputChange(e.target.value)}
              onFocus={() => setShowProductDropdown(true)}
              className="input-field"
              placeholder={`Type to search or add new ${getProductLabel().toLowerCase()}`}
              required
            />
            
            {showProductDropdown && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <button
                      key={product._id}
                      type="button"
                      onClick={() => selectProduct(product.name)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors dropdown-item"
                    >
                      {product.name}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 text-sm">
                    No matching {getProductLabel().toLowerCase()} found
                  </div>
                )}
                
                {isNewProduct && productInput.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors border-t border-gray-200 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add "{productInput}" as new {getProductLabel().toLowerCase()}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Category/Company - ComboBox */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getCategoryLabel()} *
            </label>
            <input
              type="text"
              value={categoryInput}
              onChange={(e) => handleCategoryInputChange(e.target.value)}
              onFocus={() => setShowCategoryDropdown(true)}
              className="input-field"
              placeholder={`Type to search or add new ${getCategoryLabel().toLowerCase()}`}
              required
            />
            
            {showCategoryDropdown && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map(category => (
                    <button
                      key={category._id}
                      type="button"
                      onClick={() => selectCategory(category.name)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors dropdown-item"
                    >
                      {category.name}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 text-sm">
                    No matching {getCategoryLabel().toLowerCase()} found
                  </div>
                )}
                
                {isNewCategory && categoryInput.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors border-t border-gray-200 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add "{categoryInput}" as new {getCategoryLabel().toLowerCase()}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="input-field"
              required
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="input-field resize-none"
              rows={3}
              placeholder="Add a note..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 ${
                activeTab === 'expense' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : `Add ${activeTab === 'expense' ? 'Expense' : 'Income'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};