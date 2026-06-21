import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../Components/Navbar";
import "./Shop.css";

const SHOP_ITEMS = [
  {
    id: "freeze",
    name: "Streak Freeze",
    desc: "Protect your streak for 1 day if you miss practice.",
    price: 50,
    icon: "❄️"
  },
  {
    id: "doublexp",
    name: "Double XP",
    desc: "Earn 2x XP for 2 hours.",
    price: 150,
    icon: "💎",
    locked: true
  },
  {
    id: "hint",
    name: "Hint Token",
    desc: "Get hints in challenges.",
    price: 30,
    icon: "💡"
  },
  {
    id: "skip",
    name: "Skip Challenge",
    desc: "Skip one difficult challenge.",
    price: 80,
    icon: "⏭️"
  }
];

export default function Shop() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await api.get("/api/auth/profile");
      setUser(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (item) => {
    if (item.locked) return;

    if (user.coins < item.price) {
      setMessage("Not enough coins!");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const res = await api.post("/api/shop/buy", { itemId: item.id });
      setMessage(res.data.message || "Purchased!");
      fetchUserData();
    } catch (err) {
      setMessage(err.response?.data?.message || "Purchase failed");
    }

    setTimeout(() => setMessage(""), 3000);
  };

  const handleActivate = async (itemId) => {
    try {
      const endpoints = {
        doublexp: "/api/shop/activate-doublexp",
        hint: "/api/shop/use-hint",
        skip: "/api/shop/use-skip"
      };

      const res = await api.post(endpoints[itemId]);
      setMessage(res.data.message || "Activated!");
      fetchUserData();
    } catch (err) {
      setMessage(err.response?.data?.message || "Activation failed");
    }

    setTimeout(() => setMessage(""), 3000);
  };

  if (loading) {
    return (
      <div className="shop-loading">
        <div className="spinner"></div>
        <p>Opening the Market...</p>
      </div>
    );
  }

  return (
    <div className="shop-container">
      <Navbar />

      <main className="shop-main">
        <div className="shop-header">
          <h1>Nexara Market 🛒</h1>
          <p>Use your coins to unlock boosts and power-ups.</p>
        </div>

        {/* COINS */}
        <div className="coins-display">
          🪙 {user?.coins || 0} Coins
        </div>

        {message && <div className="shop-alert">{message}</div>}

        <div className="shop-grid">
          {SHOP_ITEMS.map((item) => {
            const isOwned =
              item.id === "freeze" && user?.streakFreezeActive;
            const inventoryCount = user?.inventory?.[item.id] || 0;
            const isDoubleXpActive = user?.doubleXpExpires && new Date() < new Date(user.doubleXpExpires);

            return (
              <div
                key={item.id}
                className={`shop-card ${
                  isOwned ? "owned" : ""
                } ${item.locked ? "locked" : ""}`}
              >
                <div className="shop-icon">{item.icon}</div>

                <h3>{item.name}</h3>
                <p>{item.desc}</p>

                {/* SHOW INVENTORY COUNT */}
                {inventoryCount > 0 && item.id !== "freeze" && (
                  <div className="inventory-count">
                    In Inventory: <strong>{inventoryCount}</strong>
                  </div>
                )}

                {/* SHOW DOUBLE XP TIMER */}
                {isDoubleXpActive && item.id === "doublexp" && (
                  <div className="active-timer">
                    ✨ Active! Expires soon
                  </div>
                )}

                <div className="shop-footer">
                  <span>{item.price} Coins</span>

                  {/* BUY BUTTON (for new purchases) */}
                  {inventoryCount === 0 && item.id !== "freeze" && (
                    <button
                      className="buy-btn"
                      disabled={
                        item.locked ||
                        user.coins < item.price
                      }
                      onClick={() => handleBuy(item)}
                    >
                      {item.locked
                        ? "Locked"
                        : user.coins < item.price
                        ? "Not Enough"
                        : "Buy"}
                    </button>
                  )}

                  {/* FREEZE - SPECIAL CASE */}
                  {item.id === "freeze" && (
                    <button
                      className="buy-btn"
                      disabled={
                        isOwned ||
                        user.coins < item.price
                      }
                      onClick={() => handleBuy(item)}
                    >
                      {isOwned ? "Active" : user.coins < item.price ? "Not Enough" : "Buy"}
                    </button>
                  )}

                  {/* ACTIVATE BUTTON (for owned items) */}
                  {inventoryCount > 0 && item.id !== "freeze" && (
                    <button
                      className="activate-btn"
                      onClick={() => handleActivate(item.id)}
                    >
                      Use
                    </button>
                  )}
                </div>

                {isOwned && <div className="badge">Equipped</div>}
                {inventoryCount > 0 && item.id !== "freeze" && (
                  <div className="badge owned-badge">Owned</div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}