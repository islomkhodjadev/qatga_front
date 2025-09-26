// components/ordering/OrderSummary.jsx
import React, { useState } from "react";
import { useLang } from "../../utils/language";
import { t } from "../../utils/translation";

export default function OrderSummary({
  orders,
  onRemoveOrder,
  onUpdateOrder,
  onBatchSubmit,
  onBatchDelete,
  loading,
  isCreatingNewOrder = false, // New prop to distinguish between modes
}) {
  const { lang } = useLang();
  const [selectedOrders, setSelectedOrders] = useState([]);

  const toggleOrderSelection = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAllOrders = () => {
    setSelectedOrders(
      orders.length === selectedOrders.length
        ? []
        : orders.map((order) => order.id)
    );
  };

  const formatDateTime = (dateTimeStr) => {
    return new Date(dateTimeStr).toLocaleString();
  };

  const calculateDuration = (start, end) => {
    const diff = new Date(end) - new Date(start);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getTotalAmount = () => {
    return orders.reduce((total, order) => {
      const hours =
        (new Date(order.time_end) - new Date(order.time_start)) /
        (1000 * 60 * 60);
      const rate = order.type === "VIP" ? 50000 : 25000; // Example rates
      return total + hours * rate;
    }, 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          {t(lang, "Order Summary")} ({orders.length})
        </h2>

        <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
          {selectedOrders.length > 0 && (
            <button
              onClick={() => onBatchDelete(selectedOrders)}
              disabled={loading}
              className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
            >
              {t(lang, "Delete Selected")} ({selectedOrders.length})
            </button>
          )}

          {/* Only show Confirm button when creating new orders */}
          {isCreatingNewOrder && (
            <button
              onClick={onBatchSubmit}
              disabled={loading || orders.length === 0}
              className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              {loading
                ? t(lang, "Processing...")
                : t(lang, "Confirm All Orders")}
            </button>
          )}
        </div>
      </div>

      {/* Selection Controls */}
      {orders.length > 0 && (
        <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="selectAll"
            checked={
              selectedOrders.length === orders.length && orders.length > 0
            }
            onChange={selectAllOrders}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <label htmlFor="selectAll" className="ml-2 text-sm text-gray-700">
            {t(lang, "Select all orders")} ({orders.length})
          </label>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex items-start sm:items-center p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={selectedOrders.includes(order.id)}
              onChange={() => toggleOrderSelection(order.id)}
              className="h-4 w-4 text-blue-600 rounded mr-3 mt-1 sm:mt-0"
            />

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg truncate">
                    {t(lang, "Room")} #{order.room.room_number}
                    <span
                      className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        order.type === "VIP"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {order.type}
                    </span>
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {formatDateTime(order.time_start)} -{" "}
                    {formatDateTime(order.time_end)}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {t(lang, "Duration")}:{" "}
                    {calculateDuration(order.time_start, order.time_end)}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                  <div className="text-right">
                    <div className="font-bold text-base sm:text-lg">
                      {getTotalAmount().toLocaleString()} {t(lang, "UZS")}
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveOrder(order.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium whitespace-nowrap"
                  >
                    {t(lang, "Remove")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {orders.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">
            {isCreatingNewOrder
              ? t(lang, "No orders added yet")
              : t(lang, "No orders found")}
          </p>
          <p className="text-sm">
            {isCreatingNewOrder
              ? t(lang, "Select rooms to start booking")
              : t(lang, "There are no orders to display")}
          </p>
        </div>
      )}

      {/* Total Summary */}
      {orders.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-base sm:text-lg font-semibold">
            <span>{t(lang, "Total Amount")}:</span>
            <span>
              {getTotalAmount().toLocaleString()} {t(lang, "UZS")}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {t(lang, "Includes")} {orders.length} {t(lang, "rooms")}
          </p>
        </div>
      )}
    </div>
  );
}
