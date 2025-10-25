'use client';

import { toast } from 'sonner';
import useFeatch from '@/hooks/use-fetch';
import { Input } from '@/components/ui/input';
import { Check, Pencil, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { updateBudget } from '@/action/budgets';
import React, { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

/**
 * BudgetProgress component displays the monthly budget for a specific account,
 * including the current expenses, total budget, and a progress bar indicating
 * the percentage of the budget used. Users can edit and update the budget amount.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.initialBudget - Initial budget object containing the amount.
 * @param {number} props.currentExpenses - Current total expenses for the month.
 * @param {string} props.accountName - Name of the account associated with the budget.
 * @returns {JSX.Element} The rendered BudgetProgress component.
 */


const BudgetProgress = ({ initialBudget, currentExpenses, accountName }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ''
  );

  // Calculate percentage of budget used
  const percentUsed = initialBudget
    ? (currentExpenses / initialBudget.amount) * 100
    : 0;

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updatedBudget,
    error,
  } = useFeatch(updateBudget)

  // Handlers for editing budget
  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);

    if (!isNaN(amount) && amount <= 0) {
      toast.error('Please enter a valid budget amount greater than zero.');
      return;
    }

    await updateBudgetFn(amount);

  }

  useEffect(() => {

    if (updatedBudget?.success) {
      setIsEditing(false);
      toast.success('Budget updated successfully!');
    }
  }, [updatedBudget])

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to update budget.');
    }
  }, [error])


  // Handler for canceling edit
  const handleCancel = () => {
    setNewBudget(initialBudget?.amount?.toString() || '');
    setIsEditing(false);
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <div className='flex-1'>
            <CardTitle>
              Monthly Budget
              <span
                className='ml-2 font-semibold text-lg gradient-title'
              >
                {accountName}
              </span>
            </CardTitle>

            <div className='flex items-center gap-2 mt-1'>
              {isEditing ?
                (
                  <div className='flex items-center gap-2'>
                    <Input
                      type="number"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      className="w-32"
                      placeholder="Enter amount"
                      autoFocus
                      disabled={isLoading}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleUpdateBudget}
                      className='ml-3.5 cursor-pointer'
                      disabled={isLoading}
                    >
                      <Check
                        className='h-4 w-4 text-green-500'
                      />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCancel}
                      className='ml-2 cursor-pointer'
                      disabled={isLoading}
                    >
                      <X
                        className='h-4 w-4 text-red-500'
                      />
                    </Button>
                  </div>
                ) : (
                  <>
                    <CardDescription>
                      {
                        initialBudget
                          ? `₹${currentExpenses.toFixed(2)} of ₹${initialBudget.amount.toFixed(2)} spent`
                          : 'No budget set'
                      }
                    </CardDescription>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditing(true)}
                      className="h-6 w-6 cursor-pointer"
                    >
                      <Pencil className='h-4 w-4' />

                    </Button>
                  </>
                )
              }
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Budget progress content goes here */}

          {initialBudget && (
            <div className='space-y-2'>
              <Progress
                value={percentUsed}
                extraStyles={`${percentUsed >= 90
                    ? 'bg-red-500'
                    : percentUsed >= 75
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`
                }
              />

              <p className='text-xs text-muted-foreground text-right'>
                {percentUsed.toFixed(2)} % used
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

export default BudgetProgress
