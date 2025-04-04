
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page
    navigate("/");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-nutmeg-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-nutmeg-700">NutMeg Time Pulse</h1>
        <p className="text-xl text-gray-600">Redirecting to login...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-nutmeg-600 mx-auto mt-4"></div>
      </div>
    </div>
  );
};

export default Index;
