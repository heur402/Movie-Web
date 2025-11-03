import React from 'react'
import Trending from '../components/Trending'
import MoviesGrid from '../components/MoviesGrid'
import Footer from '../components/Footer'
import MovieCategories from '../components/MovieCategories'


const HomePage = () => {
  return (
    <div
      className="text-white bg-cover bg-center bg-no-repeat min-h-screen flex flex-col"
      style={{
        backgroundImage:
          "url('https://image.tmdb.org/t/p/original/8bcoRX3hQRHufLPSDREdvr3YMXx.jpg')",
      }}
    >
      <div className="bg-black/90">
        <Trending />
        <MovieCategories />
      </div>

      <Footer />
    </div>
  )
}

export default HomePage;