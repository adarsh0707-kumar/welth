import React from 'react'
import { Plus } from 'lucide-react';
import AccountCard from './_components/Account-card';

import { getUserAccounts } from '@/action/dashboard';
import { Card, CardContent } from '@/components/ui/card';
import CreateAccountDrawer from '@/components/createAccountDrawer';

const DashboardPage = async () => {

  const accounts = await getUserAccounts()

  return (
    <div className='px-5'>
      {/* Budget Progress */}
      page

      {/* Overview */}

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