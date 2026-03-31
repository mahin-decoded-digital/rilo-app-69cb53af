import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { badgeVariants } from '@/components/ui/badge';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useAuthStore } from '@/store/useAuthStore';
import DashboardCharts from '@/components/DashboardCharts';
import TransactionForm from '@/components/TransactionForm';

export default function Dashboard() {
  const [formOpen, setFormOpen] = useState(false);
  const { getTotalIncome, getTotalExpenses, getBalance, fetchTransactions, isLoading } = useFinanceStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const balance = getBalance();

  const stats = [
    {
      title: 'Total Balance',
      value: `$${balance.toFixed(2)}`,
      variant: balance >= 0 ? 'default' : 'destructive' as const,
    },
    {
      title: 'Total Income',
      value: `$${totalIncome.toFixed(2)}`,
      variant: 'default' as const,
    },
    {
      title: 'Total Expenses',
      value: `$${totalExpenses.toFixed(2)}`,
      variant: 'secondary' as const,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || 'User'}
          </p>
        </div>
        
        <Button onClick={() => setFormOpen(true)} className="gap-2" disabled={isLoading}>
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <span className={badgeVariants({ variant: stat.variant })}>
                  {stat.value}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <DashboardCharts />

      <TransactionForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}