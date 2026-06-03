"use client";
import Navbar from "./Navbar";
import { ToastContainer } from "./Toast";

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <ToastContainer />
      <main className="min-h-screen pt-16">{children}</main>
    </>
  );
}
