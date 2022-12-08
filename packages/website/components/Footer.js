import React from 'react'

const Footer = ({ year }) => (
  <footer className="bg-gray-200 flex items-center justify-center h-12">
    <div className="text-center text-gray-600">Copyright {year}</div>
  </footer>
)

Footer.defaultProps = {
  year: new Date().getFullYear(),
}

export default Footer
