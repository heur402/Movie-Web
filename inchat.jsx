import React from 'react';
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from './pages/HomePage';

const App = () => {
  return (
    <div className='bg-cover bg-center min-h-screen bg-violent-500'>
      <Routes>
        <Route path='/' element={<HomePage/> }/>
        <Route path='' element={``}/>
        <Route path='' element={``}/>
      </Routes>
    </div>
  )
}

export default App