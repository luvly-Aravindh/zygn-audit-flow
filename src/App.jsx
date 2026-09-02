import { Suspense, lazy } from "react";
import "./App.css";
import FlowPage from "./Components/FlowPage.jsx"


function App() {
  return (
    <>
      {/* HERO — LOAD IMMEDIATELY */}
      <FlowPage />
    </>
  );
}

export default App;