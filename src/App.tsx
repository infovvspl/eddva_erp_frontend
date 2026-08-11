// App.jsx

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Navbar from "./components/Navbar";
// import Home from "./pages/Home";

function App() {

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* <Navbar /> */}

        <main className="flex-1">
          <Routes>
            {/* <Route path="/" element={<Home />} /> */}
          </Routes>
        </main>
        {/* <Footer /> */}
      </div>
    </Router>
  );
}

export default App;
