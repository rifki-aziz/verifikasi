import React, { useState } from "react";
import { X } from "lucide-react";

interface AdminLoginPopupProps {
  onLoginSuccess: () => void;
  onClose: () => void;
}

export const AdminLoginPopup: React.FC<AdminLoginPopupProps> = ({
  onLoginSuccess,
  onClose,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const api_url = "http://localhost/backend/api/login.php"; // Ganti URL ini sesuai dengan lokasi file PHP Anda

    try {
      const response = await fetch(api_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        onLoginSuccess();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menghubungi server.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
           {" "}
      <div className="bg-white p-8 rounded-lg shadow-xl w-96 relative">
               {" "}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          title="Tutup"
        >
                    <X size={24} />       {" "}
        </button>
               {" "}
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Admin Login
        </h2>
               {" "}
        <form onSubmit={handleLogin}>
                   {" "}
          <div className="mb-4">
                       {" "}
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
                       {" "}
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
                     {" "}
          </div>
                   {" "}
          <div className="mb-6">
                       {" "}
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
                       {" "}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
                     {" "}
          </div>
                   {" "}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow"
          >
                        {loading ? "Loading..." : "Login"}         {" "}
          </button>
                 {" "}
        </form>
             {" "}
      </div>
         {" "}
    </div>
  );
};
