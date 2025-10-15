'use client'

import React, { useState } from 'react'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer'
import { Button } from './ui/button'

const CreateAccountDrawer = ({ children }) => {
  
  const [open, setOpen] = useState(false)


  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
    >
      <DrawerTrigger>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Are you absolutely sure?</DrawerTitle>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  )
}

export default CreateAccountDrawer