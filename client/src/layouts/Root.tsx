import Footer from './Footer'
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'

const Root = () => {
  return (
    <div>
        <Navbar/>
        <Outlet/>
        <Footer/>
    </div>
  )
}

export default Root