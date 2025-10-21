'use client'
import { scanRecipt } from '@/action/transaction';
import { Button } from '@/components/ui/button';
import useFetch from '@/hooks/use-fetch';
import { Camera, Loader2 } from 'lucide-react';
import React, { useEffect, useRef } from 'react'
import { toast } from 'sonner';

const ReciptScanner = ({ onScanComplete }) => {

  const fileInputRef = useRef();

  const {
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
    data: scannedData,
  } = useFetch(scanRecipt)

  const handleReceiptScan = async (file) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size should be less than 10 MB")
      return
    }

    await scanReceiptFn(file)
  }

  useEffect(() => {
    if (scannedData && !scanReceiptLoading) {
      onScanComplete(scannedData);
      toast.success("Receipt scanned successfully")
    }
  },[scanReceiptLoading, scannedData])


  return (
    <div>
      <input
        type='file'
        ref={fileInputRef}
        className='hidden'
        accept='image/*'
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleReceiptScan(file)
        }}
      />
      <Button
        type="button"
        variant="outline"
        className="cursor-pointer w-full h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 animate-gradient hover:opacity-90 transition-opacity text-white hover:text-white"
        onClick={() => fileInputRef.current?.click()}
        disabled = {scanReceiptLoading}
      >
        {
          scanReceiptLoading ? (
            <>
              <Loader2 className='mr-2 animate-spin' />
              <span>Scanning Receipt...</span>

            </>
          ) : (
            <>
              <Camera className='mr-2' />
              <span>Scan Receipt with AI</span>
            </>
          )
        }

      </Button>


    </div>
  )
}

export default ReciptScanner