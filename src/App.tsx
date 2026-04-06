/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Schedule from './pages/Schedule';
import Cart from './pages/Cart';
import LineCallback from './pages/LineCallback';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Routes>
          {/* LINE Callback 不需要 Navbar/Footer */}
          <Route path="/auth/line/callback" element={<LineCallback />} />

          <Route path="/*" element={
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/cart" element={<Cart />} />
              </Routes>
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}
