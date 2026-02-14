import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet as WalletIcon, RefreshCw, Plus } from 'lucide-react';
import { transactionService } from '@/services/transactionService';
import { DateRangePicker } from '@/components/DateRangePicker';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { ExpensePieChart } from '@/components/ExpensePieChart';
import { Summary, TransactionWithNames } from '@/types';

export const Dashboard = () => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());

  const [summary, setSummary] = useState<Summary | null>(null);
  const [displayedTransactions, setDisplayedTransactions] = useState<TransactionWithNames[]>([]);
  const [expenseByProduct, setExpenseByProduct] = useState<any[]>([]);
  const [currentSkip, setCurrentSkip] = useState(0);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    setCurrentSkip(0);

    try {
      console.log('Fetching dashboard data for range:', {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      });
      
      // Fetch all data in parallel
      const [summaryData, expenseData, initialTransactions] = await Promise.all([
        transactionService.getSummary(startDate, endDate),
        transactionService.getExpenseByProduct(startDate, endDate),
        transactionService.getTransactionsWithNames(startDate, endDate, 0, ITEMS_PER_PAGE),
      ]);

      console.log('Summary received:', summaryData);
      console.log('Expense by product:', expenseData);
      console.log('Initial transactions:', initialTransactions.length);

      setSummary(summaryData);
      setExpenseByProduct(expenseData);
      setDisplayedTransactions(initialTransactions);
      
      // Check if there are more transactions
      setHasMoreTransactions(initialTransactions.length === ITEMS_PER_PAGE);
      
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      const nextSkip = currentSkip + ITEMS_PER_PAGE;
      
      console.log('Loading more transactions, skip:', nextSkip);
      
      const moreTransactions = await transactionService.getTransactionsWithNames(
        startDate,
        endDate,
        nextSkip,
        ITEMS_PER_PAGE
      );

      console.log('Loaded more transactions:', moreTransactions.length);

      setDisplayedTransactions(prev => [...prev, ...moreTransactions]);
      setCurrentSkip(nextSkip);
      setHasMoreTransactions(moreTransactions.length === ITEMS_PER_PAGE);
      
    } catch (err: any) {
      console.error('Error loading more transactions:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-EN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Action Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Transaction</span>
              </button>
              <button
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isLoading}
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* Summary Cards - Only 3 cards now */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Income</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(summary?.total_income || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(summary?.total_expenses || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Wallet Balance</p>
                    <p className={`text-2xl font-bold ${
                      (summary?.wallet_balance || 0) >= 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(summary?.wallet_balance || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <WalletIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="card mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Expense Distribution by Product
              </h2>
              <ExpensePieChart data={expenseByProduct} />
            </div>

            {/* Transactions Table */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
                <span className="text-sm text-gray-600">
                  Showing {displayedTransactions.length} transactions
                </span>
              </div>

              {displayedTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No transactions found in this period
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {displayedTransactions.map((transaction) => (
                          <tr key={transaction._id} className="hover:bg-gray-50">
                            <td className={`px-4 py-3 whitespace-nowrap text-sm font-semibold ${
                              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'}
                              {formatCurrency(transaction.amount)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{transaction.product_name}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(transaction.purchase_date!)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{transaction.category_name}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{transaction.note || '-'}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                transaction.type === 'income' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {transaction.type}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {hasMoreTransactions && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="btn-primary disabled:opacity-50"
                      >
                        {isLoadingMore ? 'Loading...' : 'Load More'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </main>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};