import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useFinanceStore } from '@/store/useFinanceStore';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];

export default function DashboardCharts() {
  const { getCategoryBreakdown, transactions } = useFinanceStore();

  const incomeData = getCategoryBreakdown('income');
  const expenseData = getCategoryBreakdown('expense');

  const formatPieData = (data: Record<string, number>) => {
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  };

  const formatBarData = () => {
    // Group transactions by month
    const monthlyData: Record<string, { income: number; expense: number }> = {};
    
    transactions.forEach((t) => {
      const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        monthlyData[month].income += t.amount;
      } else {
        monthlyData[month].expense += t.amount;
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data,
    }));
  };

  const hasIncomeData = Object.keys(incomeData).length > 0;
  const hasExpenseData = Object.keys(expenseData).length > 0;
  const hasMonthlyData = transactions.length > 0;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Income Breakdown */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Income by Category</h3>
        {hasIncomeData ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={formatPieData(incomeData)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {formatPieData(incomeData).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No income data yet
          </div>
        )}
      </div>

      {/* Expense Breakdown */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Expenses by Category</h3>
        {hasExpenseData ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={formatPieData(expenseData)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {formatPieData(expenseData).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No expense data yet
          </div>
        )}
      </div>

      {/* Monthly Overview */}
      <div className="rounded-lg border bg-card p-4 shadow-sm md:col-span-2">
        <h3 className="mb-4 text-lg font-semibold">Monthly Overview</h3>
        {hasMonthlyData ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formatBarData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Income" />
              <Bar dataKey="expense" fill="#ef4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No transaction data yet
          </div>
        )}
      </div>
    </div>
  );
}