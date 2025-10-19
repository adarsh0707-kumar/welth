import React from 'react'
import {BarChart, ResponsiveContainer } from "recharts";

const AccountChart = () => {
  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        {/* Chart component goes here */}
        <BarChart></BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default AccountChart