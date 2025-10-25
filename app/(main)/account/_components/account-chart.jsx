'use client'

import { format } from 'date-fns/format';
import { subDays } from 'date-fns/subDays';
import { endOfDay } from 'date-fns/endOfDay';
import React, { useMemo, useState } from 'react'
import { startOfDay } from 'date-fns/startOfDay';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const DATE_RANGES = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last 1 Month", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  "1Y": { label: "Last 1 Year", days: 365 },
  ALL: { label: "All Time", days: null },
}

/**
 * AccountChart Component
 *
 * This component renders a bar chart displaying transaction data over a selectable date range.
 * It visualizes daily income and expense amounts, providing an overview of financial activity.
 * The chart updates dynamically based on the selected date range.
 *
 * @component
 * @example
 * // Usage within a Next.js page
 * <AccountChart transactions={transactionsData} />
 *
 * @param {Object} props - The component props.
 * @param {Array<Object>} props.transactions - An array of transaction objects.
 * @param {string} props.transactions[].date - The date of the transaction.
 * @param {number} props.transactions[].amount - The amount of the transaction.
 * @param {'INCOME'|'EXPENSE'} props.transactions[].type - The type of the transaction.
 * @returns {JSX.Element} The rendered AccountChart component.
 */

const AccountChart = ({ transactions }) => {

  const [dateRange, setDateRange] = useState("1M");

  const filteredData = useMemo(() => {
    const range = DATE_RANGES[dateRange];
    const now = new Date();

    const startDate = range.days
      ? startOfDay(subDays(now, range.days))
      : startOfDay(new Date(0));


    const filtered = transactions.filter(
      (t) => new Date(t.date) >= startDate && new Date(t.date) <= endOfDay(now)
    );

    const grouped = filtered.reduce((acc, transaction) => {
      const date = format(new Date(transaction.date), "MMM dd");
      
      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0 };
      } 
      
      // Add amount to income or expense based on transaction type
      if (transaction.type === "INCOME") {
        acc[date].income += transaction.amount;
      } else if (transaction.type === "EXPENSE") {
        acc[date].expense += transaction.amount;
      }

      return acc;
    }, {});

    return Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

  }, [transactions, dateRange]);

  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, day) => ({
        income: acc.income + day.income,
          expense: acc.expense + day.expense,
      }),
      { income: 0, expense: 0 }
    );
  },[filteredData]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <CardTitle className="text-base font-normal">
          Transaction Overview
        </CardTitle>

        <Select defaultValue = {dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Select range" /> 
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DATE_RANGES).map(([key, { label }]) => {
               return <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
              
            })}
          </SelectContent>

        </Select>
      </CardHeader>
      <CardContent>

        <div className='flex justify-around mb-6 text-sm'>
          <div className='text-center'>
            <p className='text-muted-foreground'>Total Income</p>
            <p className='text-lg font-bold text-green-500'>
              &#8377;{totals.income.toFixed(2)}
            </p>
          </div>

          <div className='text-center'>
            <p className='text-muted-foreground'>Total Expense</p>
            <p className='text-lg font-bold text-red-500'>
              &#8377;{totals.expense.toFixed(2)}
            </p>
          </div>

          <div className='text-center'>
            <p className='text-muted-foreground'>Net</p>
            <p className={`text-lg font-bold ${totals.income - totals.expense >= 0
              ? 'text-green-500'
              : 'text-red-500'}`
            }>
              &#8377;{(totals.income - totals.expense).toFixed(2)}
            </p>
          </div>
        </div>

        <div className='h-[300px]'>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={filteredData}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 0
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis dataKey="date" />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip
                formatter={(value) => [`₹${value}`, undefined]}
              />
              <Legend />
              <Bar
                dataKey="income"
                fill="#10b981"
                name="Income"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expense"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                name="Expense"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export default AccountChart