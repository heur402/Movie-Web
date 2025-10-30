import React from 'react'
import Trending from '../components/Trending'
import MoviesGrid from '../components/MoviesGrid'
import Footer from '../components/Footer'


const HomePage = () => {
  return (
    <div>
        <Trending />
        <MoviesGrid />
        <MoviesGrid />
        <MoviesGrid />
        <MoviesGrid />
        <MoviesGrid />
        <Footer />
    </div>
  )
}

export default HomePage;