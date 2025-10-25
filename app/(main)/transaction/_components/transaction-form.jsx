'use client'

import { toast } from 'sonner'
import { format } from 'date-fns/format'
import React, { useEffect } from 'react'
import useFetch from '@/hooks/use-fetch'

import { useForm } from 'react-hook-form'
import ReciptScanner from './recipt-scanner'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { transactionSchema } from '@/app/lib/schema'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import CreateAccountDrawer from '@/components/createAccountDrawer'
import { createTransaction, updateTransaction } from '@/action/transaction'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'


/**
 * AddTransactionForm component handles creation and editing of financial transactions.
 * It supports both expense and income types, recurring transactions, and account/category selection.
 * It also integrates a receipt scanner for quick data entry when creating a transaction.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Array<Object>} props.accounts - List of user accounts to select from.
 * @param {Array<Object>} props.categories - List of transaction categories.
 * @param {boolean} [props.editMode=false] - If true, the form will be in edit mode.
 * @param {Object|null} [props.initialData=null] - Initial data to prefill the form in edit mode.
 * 
 * @typedef {Object} Account
 * @property {string} id - Unique account ID
 * @property {string} name - Account name
 * @property {number|string} balance - Account balance
 * @property {boolean} isDefault - Whether this is the default account
 * 
 * @typedef {Object} Category
 * @property {string} id - Unique category ID
 * @property {string} name - Category name
 * @property {"EXPENSE"|"INCOME"} type - Category type
 * 
 * @typedef {Object} TransactionData
 * @property {"EXPENSE"|"INCOME"} type - Transaction type
 * @property {string|number} amount - Transaction amount
 * @property {string} description - Transaction description
 * @property {string} accountId - ID of the selected account
 * @property {string} category - Transaction category name
 * @property {Date} date - Transaction date
 * @property {boolean} isRecurring - Whether transaction is recurring
 * @property {string} [recurringInterval] - Recurring interval if applicable
 * 
 * @example
 * <AddTransactionForm
 *   accounts={[{ id: '1', name: 'Cash', balance: 1000, isDefault: true }]}
 *   categories={[{ id: 'cat1', name: 'Food', type: 'EXPENSE' }]}
 *   editMode={false}
 * />
 */


const AddTransactionForm = ({
  accounts,
  categories,
  editMode = false,
  initialData = null,

}) => {

  const router = useRouter();
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit")

  console.log('editId from props:', editId);
  console.log('editMode:', editMode);
  console.log('initialData:', initialData);


  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    watch,
    getValues,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
        ? {
          type: initialData.type,
          amount: initialData.amount.toString(),
          description: initialData.description,
          accountId: initialData.accountId,
          category: initialData.category,
          date: new Date(initialData.date),
          isRecurring: initialData.isRecurring,
          ...(initialData.recurringInterval && {
            recurringInterval: initialData.recurringInterval,
          }),
        }
        : {
          type: 'EXPENSE',
          amount: '',
          description: '',
          accountId: accounts.find((acc) => acc.isDefault)?.id,
          date: new Date(),
          isRecurring: false,
        }
  });

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
  } = useFetch(editMode
    ? updateTransaction
    : createTransaction
  );

  const type = watch('type');
  const isRecurring = watch('isRecurring');
  const date = watch('date');

  const filteredCategories = categories.filter(
    (category) => category.type === type
  )

  /**
 * Handles form submission to create or update a transaction.
 * Converts amount to number and date to ISO string.
 * @param {TransactionData} data - Form data
 * @returns {Promise<void>}
 */

  const onSubmit = async (data) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
      date: data.date.toISOString(),
    };

    if (editMode && editId) {
      transactionFn(editId, formData);
    } else if(!editMode){
      transactionFn(formData);
    }
    else {
      toast.error("Transaction ID is missing")
    }
  }

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success(editMode
        ? "Transaction updated successfully"
        : "Transaction created successfully"
      );
      reset();
      router.push(`/account/${transactionResult.data.accountId}`);

    }
  }, [transactionResult, transactionLoading, editMode])

  /**
 * Handles the scanned receipt data and populates the form fields.
 * @param {Object} scannedData
 * @param {string|number} scannedData.amount
 * @param {string|Date} scannedData.date
 * @param {string} [scannedData.description]
 * @param {string} [scannedData.category]
 */


  const handleScanComplete = (scannedData) => {
    if (scannedData) {
      setValue("amount", scannedData.amount.toString());
      setValue("date", new Date(scannedData.date));
      if (scannedData.description) {
        setValue("description", scannedData.description)
      }

      if (scannedData.category) {
        setValue("category", scannedData.category);
      }
    }
  }

  return (
    <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
      {/* AI Recipt Scanner */}

      {!editMode &&
        <ReciptScanner onScanComplete={handleScanComplete} />
      }

      {/* Form */}

      <div className='space-y-2'>
        <label className='text-sm font-medium'>Type</label>
        <Select
          onValueChange={(value) => setValue('type', value)}
          defaultValue={type}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXPENSE">Expense</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
          </SelectContent>
        </Select>

        {errors.type && (
          <p className='text-sm text-red-500'>
            {errors.type.message}
          </p>
        )}
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Amount</label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("amount")}
          />

          {errors.amount && (
            <p className='text-sm text-red-500'>
              {errors.amount.message}
            </p>
          )}
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium'>Account</label>
          <Select
            onValueChange={(value) => setValue('accountId', value)}
            defaultValue={getValues('accountId')}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}(&#8377;{parseFloat(account.balance).toFixed(2)})
                </SelectItem>
              ))}

              <CreateAccountDrawer>
                <Button
                  variant='ghost'
                  className='cursor-pointer w-full select-none items-center text-sm outline-none'>
                  Create Account
                </Button>
              </CreateAccountDrawer>

            </SelectContent>
          </Select>

          {errors.accountId && (
            <p className='text-sm text-red-500'>
              {errors.accountId.message}
            </p>
          )}
        </div>
      </div>

      <div className='space-y-2'>
        <label className='text-sm font-medium'>Category</label>
        <Select
          onValueChange={(value) => setValue('category', value)}
          defaultValue={getValues('category')}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {
              filteredCategories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>
        {errors.category && (
          <p className='text-sm text-red-500'>
            {errors.category.message}
          </p>
        )}
      </div>

      <div className='space-y-2'>
        <label className='text-sm font-medium'>Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              className='w-full text-left pl-3 font-normal cursor-pointer'
            >
              {date ? format(date, "PPP") : <span>Pick a date</span>}
              <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => setValue('date', date)}
              disabled={(date) => date === new Date() || date < new Date("1900-01-01")}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {errors.date && (
          <p className='text-sm text-red-500'>
            {errors.date.message}
          </p>
        )}
      </div>

      <div className='space-y2'>
        <label className='text-sm font-medium'>Description</label>
        <Input
          placeholder="Enter description" {...register("description")}
        />
        {errors.description && (
          <p className='text-sm text-red-500'>
            {errors.description.message}
          </p>
        )}
      </div>

      <div className='flex items-center justify-between rounded-lg border p-3'>
        <div className='space-y-0.5'>

          <label
            htmlFor='isDefault'
            className='text-sm font-medium cursor-pointer'
          >
            Recurring Transaction
          </label>
          <p className='text-sm text-muted-foreground'>
            Set up a recurring schedule for this transaction.
          </p>
        </div>
        <Switch
          checked={isRecurring}
          onCheckedChange={(checked) => setValue("isRecurring", checked)}
          className="cursor-pointer"
        />
      </div>

      {
        isRecurring && (
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Recurring Interval</label>
            <Select
              onValueChange={(value) => setValue('recurringInterval', value)}
              defaultValue={getValues('recurringInterval')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">Daily</SelectItem>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="YEARLY">Yearly</SelectItem>

              </SelectContent>
            </Select>

            {errors.recurringInterval && (
              <p className='text-sm text-red-500'>
                {errors.recurringInterval.message}
              </p>
            )}
          </div>
        )
      }

      <div>
        <Button
          type="submit"
          disabled={transactionLoading || (editMode && !editId )}
          className='w-full cursor-pointer'
        >
          {
            transactionLoading
              ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  {
                    editMode ? "Updating..." : "Creating..."
                  }
                </>
              ) : editMode
                ? (
                  'Update Transaction'
                )
                : (
                  "Create Transaction"
                )
          }
        </Button>

        <Button
          variant='outline'
          disabled={transactionLoading}
          onClick={() => router.back()}
          className='w-full cursor-pointer mt-2'
        >
          Cancel
        </Button>
      </div>

    </form>
  )
}

export default AddTransactionForm;
