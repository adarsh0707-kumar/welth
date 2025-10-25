import { Plus } from 'lucide-react';
import React, { Suspense } from 'react'
import { getCurrentBudgets } from '@/action/budgets';
import AccountCard from './_components/Account-card';

import { Card, CardContent } from '@/components/ui/card';
import BudgetProgress from './_components/budget-progress';
import DashboardOverview from './_components/dashboard-overview';
import CreateAccountDrawer from '@/components/createAccountDrawer';

import { getDashboardData, getUserAccounts } from '@/action/dashboard';

/**
 * DashboardPage component displays the user's dashboard, including budget progress,
 * recent transactions, and account information.
 *
 * @component
 * @example
 * const accounts = await getUserAccounts();
 * const transactions = await getDashboardData();
 * return <DashboardPage accounts={accounts} transactions={transactions} />;
 *
 * @param {Object} props - The component props.
 * @param {Array} props.accounts - List of user accounts.
 * @param {Array} props.transactions - List of user transactions.
 * @returns {JSX.Element} The rendered DashboardPage component.
 */



const DashboardPage = async () => {

  const accounts = await getUserAccounts();

  const defaultAccount = accounts?.find((account) => account.isDefault);
  
  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudgets(defaultAccount.id);
  }

  const transactions = await getDashboardData();

  return (
    <div className='space-y-8'>
      {/* Budget Progress */}

      {
        defaultAccount &&
        <BudgetProgress
          initialBudget={budgetData?.budgets}
          currentExpenses={budgetData?.currentExpenses || 0}
          accountName={defaultAccount?.name}
          
        />
      }
      

      {/* Overview */}

      <Suspense fallback={"Loading Overview..."}>
        <DashboardOverview
          accounts={accounts}
          transactions={transactions || []}
        />

      </Suspense>



      {/* Account Grid */}

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <CreateAccountDrawer>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <CardContent className="flexx flex-col items-center justify-center text-muted-foreground h-full pt-5">
              <Plus
              className='h-10 w-10 mb-2'
              />
              <p className='text-sm font-medium'>Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>

        {accounts.length > 0 && accounts?.map((account) => {
          return <AccountCard key={ account.id} account={account} />
        })}
      </div>

    </div>
  )
}

export default DashboardPage;
