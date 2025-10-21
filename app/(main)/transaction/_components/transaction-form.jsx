'use client'

import { createTransaction } from '@/action/transaction'
import { transactionSchema } from '@/app/lib/schema'
import CreateAccountDrawer from '@/components/createAccountDrawer'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import useFetch from '@/hooks/use-fetch'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns/format'
import { CalendarIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'

const AddTransactionForm = ({ accounts, categories }) => {

  const router = useRouter();
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
    defaultValues: {
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
  } = useFetch(createTransaction);

  const type = watch('type');
  const isRecurring = watch('isRecurring');
  const date = watch('date');

  const filteredCategories = categories.filter(
    (category) => category.type === type
  )

  const onSubmit = async (data) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
    };

    await transactionFn(formData);
  }

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success("Transaction added successfully");
      reset();
      router.push(`/accounts/${transactionResult.data.accountId}`);
    }
  },[transactionResult, transactionLoading])

  return (
    <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
      {/* AI Recipt Scanner */}

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
                <Button variant='ghost' className='cursor-pointer w-full select-none items-center text-sm outline-none'>Create Account</Button>
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
            <Button variant='outline' className='w-full text-left pl-3 font-normal cursor-pointer'>
              {date ? format(date, "PPP") : <span>Pick a date</span>}
              <CalendarIcon className='ml-auto h-4 w-4 opacity-50'/>
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
          disabled={transactionLoading}
          className='w-full cursor-pointer'
        >
          {transactionLoading ? 'Adding...' : 'Add Transaction'}
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


