import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function TestConnection() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/health")
      .then(res => setMessage(res.data.message))
      .catch(() => setMessage("Connection failed"));
  }, []);

  return (
    <div className="p-10 text-xl font-bold">
      {message}
    </div>
  );
}
