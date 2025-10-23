'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React, { useState } from 'react'

const DashboardOverview = ({ accounts, transactions }) => {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((a) => a.isDefault)?.id || accounts[0]?.id
  );

  // filter transactions for selected account

  const accountTransactions = transactions.filter(
    (t) => t.accountId = selectedAccountId
  )

  const recentTransactions = accountTransactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
  .slice(0,5)
  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-normal">
            Recent Transaction
          </CardTitle>
          <Select
            value={selectedAccountId}
            onValuChange={setSelectedAccountId}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder = "Select Account"/>
            </SelectTrigger>
            <SelectContent>
              {
                accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent></CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle></CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
    </div>
  )
}

export default DashboardOverview