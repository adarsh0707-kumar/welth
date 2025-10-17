"use client"
import Link from 'next/link'
import { toast } from 'sonner'
import React, { useEffect } from 'react'
import useFeatch from '@/hooks/use-featch'

import { Switch } from '@/components/ui/switch'
import { updateDefaultAccount } from '@/action/accounts'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

const AccountCard = ({ account }) => {

  const { name, type, balance, id, isDefault } = account

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFeatch(updateDefaultAccount)

  const handleDefaultChange = async (event) => {
    event.preventDefault();

    if (isDefault) {
      toast.warning("You need atleast 1 default account");
      return;
    }

    await updateDefaultFn(id);
  }

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully");
    }
  },[updatedAccount, updateDefaultLoading])
    
  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update default account");
    }
  }, [error]);



  return (
    <Link href={`/account/${id}`}>
      <Card className="hover:shadow-md transition-shadow group relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className='text-sm font-medium capitalize'>{name}</CardTitle>
          <Switch
            checked={isDefault}
            className="cursor-pointer"
            onClick={handleDefaultChange}
            disavled={updateDefaultLoading}
          />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            &#8377;{parseFloat(balance).toFixed(2)}
          </div>
          <p className='text-xs text-muted-foreground'>
            {type.charAt(0) + type.slice(1).toLowerCase()} Account
          </p>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div className='flex items-center'>
            <ArrowUpRight className='mr-1 h-4 w-4 text-green-500' />
            Income
          </div>
          <div className='flex items-center'>
            <ArrowDownRight className='mr-1 h-4 w-4 text-red-500' />
            Expense
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

export default AccountCard;
