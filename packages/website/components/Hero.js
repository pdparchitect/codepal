import React from 'react'

const Hero = ({ title, subTitle }) => (
  <div className="bg-gray-200 py-50">
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-gray-600">{subTitle}</p>
    </div>
  </div>
)

export default Hero