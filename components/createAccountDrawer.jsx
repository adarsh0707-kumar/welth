'use client'


import { toast } from 'sonner'
import { Input } from './ui/input'
import { Switch } from './ui/switch'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'

import { useForm } from 'react-hook-form'
import useFeatch from '@/hooks/use-fetch'
import { accountSchema } from '@/app/lib/schema'
import { createAccount } from '@/action/dashboard'
import React, { useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from './ui/drawer'

const CreateAccountDrawer = ({ children }) => {

  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      type: "CURRENT",
      balance: '',
      isDefault: false,
    }
  })

  const {
    data: newAccount,
    error,
    fn: createAccountFn,
    loading: createAccountLoading
  } = useFeatch(createAccount)

  useEffect(() => {

    if (newAccount && !createAccountLoading) {
      toast.success("Account created successfully");
      reset();
      setOpen(false);
    }
  }, [createAccountLoading, newAccount]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to create account")
    }
  }, [error])

  const onSubmit = async (data) => {
    await createAccountFn(data)
  }


  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
    >
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create New Account</DrawerTitle>
        </DrawerHeader>

        <div className='px-4 pb-4'>
          <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
            <div className='space-y-2'>
              <label
                htmlFor='name'
                className='text-sm font-medium'
              >
                Account Name
              </label>
              <Input
                id="name"
                placeholder="e.g., Main Checking"
                {...register("name")}
              />
              {errors.name && (
                <p className='text-sm text-red-500'>{errors.name.message}</p>
              )}
            </div>
            <div className='space-y-2'>
              <label
                htmlFor='type'
                className='text-sm font-medium'
              >
                Account Type
              </label>
              <Select
                onValueChange={(value) => setValue("type", value)}
                defaultValues={watch("type")}

              >
                <SelectTrigger id='type'>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CURRENT">Current</SelectItem>
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className='text-sm text-red-500'>{errors.type.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <label
                htmlFor='balance'
                className='text-sm font-medium'
              >
                Initial Balance
              </label>
              <Input
                id="balance"
                type='number'
                step="0.01"
                placeholder="0.00"
                {...register("balance")}
              />
              {errors.balance && (
                <p className='text-sm text-red-500'>{errors.balance.message}</p>
              )}
            </div>

            <div className='flex items-center justify-between rounded-lg border p-3'>
              <div className='space-y-0.5'>

                <label
                  htmlFor='isDefault'
                  className='text-sm font-medium cursor-pointer'
                >
                  Set as Default
                </label>
                <p className='text-sm text-muted-foreground'>This account will be selected by default for transactions</p>
              </div>
              <Switch
                id="isDefault"
                onCheckedChange={(checked) => setValue("isDefault", checked)}
                checked={watch("isDefault")}
                className="cursor-pointer"
              />

            </div>
            
            <div className='flex gap-4 pt-4'>
              <DrawerClose asChild>
                <Button type="button" variant="outline" className="flex-1 cursor-pointer">
                  Cancel
                </Button>
              </DrawerClose>

              <Button type="submit"
                className="flex-1 cursor-pointer"
                disabled={createAccountLoading}
              >
                {
                  createAccountLoading ?
                    <>
                      <Loader2
                        className='mr-2 h-4 w-4 animate-spin'
                      />
                      Creating...
                    </> :
                    (
                      "Create Account"
                    )
                }
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default CreateAccountDrawer;
