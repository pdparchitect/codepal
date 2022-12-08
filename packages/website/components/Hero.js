import React from 'react'

const Hero = ({ title, subTitle }) => (
  <div className="bg-black py-10 text-white">
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-gray-600">{subTitle}</p>
    </div>
  </div>
)

export default Hero