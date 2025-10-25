import React from 'react'
import { getUserAccounts } from '@/action/dashboard'
import { defaultCategories } from '@/data/categories'

import { getTransaction } from '@/action/transaction'
import AddTransactionForm from '../_components/transaction-form'


/**
 * AddTransactionPage component for adding or editing a transaction.
 * Fetches user accounts and, if in edit mode, retrieves the transaction data.
 *
 * @async
 * @param {Object} props - Component props
 * @param {Object} props.searchParams - Query parameters from the URL
 * @param {string} [props.searchParams.edit] - Transaction ID for editing (optional)
 *
 * @returns {JSX.Element} The transaction form page
 *
 * @example
 * <AddTransactionPage searchParams={{ edit: '1234' }} />
 */

const AddTransactionPage = async ({ searchParams }) => {
  
  const accounts = await getUserAccounts()
  
  // Await searchParams if it's a Promise
  const params = await searchParams;
  const editId = params?.edit;

  let initialData = null;

  if (editId) {
    const transaction = await getTransaction(editId);
    initialData = transaction;
  }


  return (
    <div className='max-w-3xl mx-auto px-5'>
    <h1 className='text-5xl gradient-title mb-8'>{editId ? "Edit ": "Add"} Transaction</h1>

      <AddTransactionForm
        accounts={accounts}
        categories={defaultCategories}
        editMode={!!editId}
        initialData={initialData}
        editId={editId}
      />
    </div>
  )
}

export default AddTransactionPage;
