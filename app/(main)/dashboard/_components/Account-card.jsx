import React from 'react'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

const AccountCard = ({ account }) => {

  const { name, type, balance, id, isDefault } = account


  return (
    <Link href={`/account/${id}`}>
      <Card className="hover:shadow-md transition-shadow group relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className='text-sm font-medium capitalize'>{name}</CardTitle>
          <Switch checked={isDefault } className="cursor-pointer" />
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
