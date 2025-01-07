
import React from "react";
import Navbar from "./Navbar";


export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100">
      <Navbar />
      <main className="pt-20 px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

