import { apiService } from './api';
import { 
  Transaction, 
  TransactionCreate, 
  TransactionResponse,
  Summary, 
  Category, 
  Product,
  Wallet,
  TransactionWithNames 
} from '@/types';

export const transactionService = {
  // Fetch transactions with date range
  async getTransactions(
    startDate: Date,
    endDate: Date,
    skip: number = 0,
    limit?: number
  ): Promise<Transaction[]> {
    const params: any = {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      skip: skip,
    };

    const transactions = await apiService.get<Transaction[]>('/transactions/', params);
    const filtered = transactions.filter(t => !t.is_deleted);
    
    console.log(`Fetched ${filtered.length} transactions (skip: ${skip}, limit: ${limit})`);
    
    // If limit is specified, return only that many
    return limit ? filtered.slice(0, limit) : filtered;
  },

  // Fetch single transaction by ID
  async getTransactionById(id: string): Promise<Transaction> {
    return apiService.get<Transaction>(`/transactions/id/${id}`);
  },

  // Create new transaction
  async createTransaction(transaction: TransactionCreate): Promise<TransactionResponse> {
    return apiService.post<TransactionResponse>('/transactions/', transaction);
  },

  // Delete transaction
  async deleteTransaction(id: string): Promise<TransactionResponse> {
    return apiService.delete<TransactionResponse>(`/transactions/id/${id}`);
  },

  // Fetch all categories
  async getCategories(): Promise<Category[]> {
    const categories = await apiService.get<Category[]>('/categories/');
    return categories.filter(c => !c.is_deleted);
  },

  // Get category by ID
  async getCategoryById(id: string): Promise<Category> {
    return apiService.get<Category>(`/categories/id/${id}`);
  },

  // Create category
  async createCategory(name: string): Promise<any> {
    return apiService.post<any>(`/categories?name=${encodeURIComponent(name)}`, {});
  },

  // Update category
  async updateCategory(id: string, name: string): Promise<any> {
    return apiService.put<any>(`/categories/${id}?name=${encodeURIComponent(name)}`, {});
  },

  // Delete category
  async deleteCategory(id: string): Promise<any> {
    return apiService.delete<any>(`/categories/id/${id}`);
  },

  // Fetch all products
  async getProducts(): Promise<Product[]> {
    const products = await apiService.get<Product[]>('/products/');
    return products.filter(p => !p.is_deleted);
  },

  // Get product by ID
  async getProductById(id: string): Promise<Product> {
    return apiService.get<Product>(`/products/id/${id}`);
  },

  // Create product
  async createProduct(name: string, categoryId?: string): Promise<any> {
    const params = categoryId 
      ? `?name=${encodeURIComponent(name)}&category_id=${categoryId}`
      : `?name=${encodeURIComponent(name)}`;
    return apiService.post<any>(`/products/${params}`, {});
  },

  // Update product
  async updateProduct(id: string, name: string): Promise<any> {
    return apiService.put<any>(`/products/id/${id}`, { name });
  },

  // Delete product
  async deleteProduct(id: string): Promise<any> {
    return apiService.delete<any>(`/products/${id}`);
  },

  // Fetch wallet
  async getWallet(): Promise<Wallet> {
    return apiService.get<Wallet>('/wallets/');
  },

  // Enrich transactions with category and product names
  async getTransactionsWithNames(
    startDate: Date,
    endDate: Date,
    skip: number = 0,
    limit: number = 10
  ): Promise<TransactionWithNames[]> {
    const [transactions, categories, products] = await Promise.all([
      this.getTransactions(startDate, endDate, skip, limit),
      this.getCategories(),
      this.getProducts(),
    ]);

    const categoryMap = new Map(categories.map(c => [c._id, c.name]));
    const productMap = new Map(products.map(p => [p._id, p.name]));

    return transactions.map(t => ({
      ...t,
      category_name: categoryMap.get(t.category_id) || 'Unknown',
      product_name: productMap.get(t.product_id) || 'Unknown',
    }));
  },

  // Calculate summary from transactions
  async getSummary(startDate: Date, endDate: Date): Promise<Summary> {
    const [transactions, categories, wallet] = await Promise.all([
      this.getTransactions(startDate, endDate, 0), // Get ALL transactions for summary
      this.getCategories(),
      // this.getProducts(),
      this.getWallet(),
    ]);

    console.log('Calculating summary from transactions:', transactions.length);

    let total_income = 0;
    let total_expenses = 0;
    const categoryTotals: { [key: string]: number } = {};

    transactions.forEach(transaction => {
      console.log('Processing transaction:', transaction.type, transaction.amount);
      
      if (transaction.type === 'income') {
        total_income += transaction.amount;
      } else if (transaction.type === 'expense') {
        total_expenses += transaction.amount;
        
        const categoryId = transaction.category_id;
        categoryTotals[categoryId] = (categoryTotals[categoryId] || 0) + transaction.amount;
      }
    });

    console.log('Summary calculated:', { total_income, total_expenses });

    const net_balance = total_income - total_expenses;

    // Create category map for names
    const categoryMap = new Map(categories.map(c => [c._id, c.name]));

    // Calculate expense by category with percentages
    const expense_by_category = Object.entries(categoryTotals).map(([category_id, total]) => ({
      category_id,
      category_name: categoryMap.get(category_id) || 'Unknown',
      total,
      percentage: total_expenses > 0 ? (total / total_expenses) * 100 : 0,
    }));

    // Sort by total descending
    expense_by_category.sort((a, b) => b.total - a.total);

    return {
      total_income,
      total_expenses,
      net_balance,
      wallet_balance: wallet.amount,
      expense_by_category,
    };
  },

  // Get expense by product for pie chart
  async getExpenseByProduct(startDate: Date, endDate: Date) {
    const [transactions, products] = await Promise.all([
      this.getTransactions(startDate, endDate, 0), // Get ALL transactions for chart
      this.getProducts(),
    ]);

    console.log('Calculating expense by product from transactions:', transactions.length);

    const productTotals: { [key: string]: number } = {};
    let total_expenses = 0;

    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        total_expenses += transaction.amount;
        const productId = transaction.product_id;
        productTotals[productId] = (productTotals[productId] || 0) + transaction.amount;
      }
    });

    const productMap = new Map(products.map(p => [p._id, p.name]));

    const expenseByProduct = Object.entries(productTotals).map(([product_id, total]) => ({
      product_id,
      product_name: productMap.get(product_id) || 'Unknown',
      total,
      percentage: total_expenses > 0 ? (total / total_expenses) * 100 : 0,
    }));

    // Sort by total descending
    expenseByProduct.sort((a, b) => b.total - a.total);

    console.log('Expense by product calculated:', expenseByProduct);

    return expenseByProduct;
  },
};