import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="p-6 overflow-auto flex-1">{children}</main>
      </div>
    </div>
  );
}
