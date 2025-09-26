// components/ordering/CoachGrid.jsx
import React from "react";
import { useLang } from "../../utils/language";
import { t } from "../../utils/translation";

export default function CoachGrid({ rooms, orders, onRoomSelect, place }) {
  const { lang } = useLang();

  // Group rooms by availability and orders
  const getRoomStatus = (room) => {
    const roomOrders = orders.filter((order) => order.room.id === room.id);
    const hasDraftOrders = roomOrders.length > 0;

    if (!room.is_available) {
      return {
        status: "unavailable",
        label: t(lang, "Unavailable"),
        orders: roomOrders,
      };
    }

    if (hasDraftOrders) {
      return {
        status: "selected",
        label: t(lang, "Selected"),
        orders: roomOrders,
      };
    }

    return { status: "available", label: t(lang, "Available"), orders: [] };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 border-green-500 text-green-800";
      case "selected":
        return "bg-blue-100 border-blue-500 text-blue-800";
      case "unavailable":
        return "bg-red-100 border-red-500 text-red-800";
      default:
        return "bg-gray-100 border-gray-500 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {t(lang, "Select Rooms")} - {place?.name}
        </h2>
        <div className="flex flex-col space-x-2 text-sm">
          <span className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
            {t(lang, "Available")}
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
            {t(lang, "Selected")}
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span>
            {t(lang, "Unavailable")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {rooms.map((room) => {
          const statusInfo = getRoomStatus(room);

          return (
            <button
              key={room.id}
              onClick={() =>
                statusInfo.status !== "unavailable" && onRoomSelect(room)
              }
              disabled={statusInfo.status === "unavailable"}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200 transform hover:scale-105
                ${getStatusColor(statusInfo.status)}
                ${
                  statusInfo.status !== "unavailable"
                    ? "cursor-pointer hover:shadow-lg"
                    : "cursor-not-allowed opacity-60"
                }
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              `}
            >
              {/* Room Number */}
              <div className="text-2xl font-bold mb-2">{room.room_number}</div>

              {/* Status Badge */}
              <div className="text-xs font-medium px-2 py-1 rounded-full bg-white bg-opacity-50">
                {statusInfo.label}
              </div>

              {/* Order Count Badge */}
              {statusInfo.orders.length > 0 && (
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                  {statusInfo.orders.length}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {t(lang, "No rooms available for this place")}
        </div>
      )}
    </div>
  );
}
