// components/ordering/OrderModal.jsx
import React, { useState } from "react";
import { useLang } from "../../utils/language";
import { t } from "../../utils/translation";

export default function OrderModal({
  room,
  onClose,
  onSubmit,
  existingOrders,
}) {
  const { lang } = useLang();
  const [orderType, setOrderType] = useState("HOURBY");
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!timeStart) newErrors.timeStart = t(lang, "Start time is required");
    if (!timeEnd) newErrors.timeEnd = t(lang, "End time is required");

    if (timeStart && timeEnd) {
      const start = new Date(timeStart);
      const end = new Date(timeEnd);

      if (end <= start) {
        newErrors.timeEnd = t(lang, "End time must be after start time");
      }

      // Check for overlapping orders
      const newStart = start.getTime();
      const newEnd = end.getTime();

      const hasOverlap = existingOrders.some((order) => {
        const existingStart = new Date(order.time_start).getTime();
        const existingEnd = new Date(order.time_end).getTime();

        return newStart < existingEnd && newEnd > existingStart;
      });

      if (hasOverlap) {
        newErrors.timeStart = t(lang, "Time slot overlaps with existing order");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit({
        type: orderType,
        time_start: timeStart,
        time_end: timeEnd,
      });
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-white p-6 border-b border-gray-200 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              {t(lang, "Book Room")} #{room.room_number}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Order Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t(lang, "Booking Type")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrderType("HOURBY")}
                className={`p-3 rounded-lg border text-center font-medium transition-all ${
                  orderType === "HOURBY"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400"
                }`}
              >
                {t(lang, "Hourly")}
              </button>
              <button
                type="button"
                onClick={() => setOrderType("VIP")}
                className={`p-3 rounded-lg border text-center font-medium transition-all ${
                  orderType === "VIP"
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400"
                }`}
              >
                {t(lang, "VIP")}
              </button>
            </div>
          </div>

          {/* Start Time */}
          <div>
            <label
              htmlFor="timeStart"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t(lang, "Start Time")}
            </label>
            <input
              type="datetime-local"
              id="timeStart"
              value={timeStart}
              onChange={(e) => setTimeStart(e.target.value)}
              min={getMinDateTime()}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.timeStart ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.timeStart && (
              <p className="text-red-500 text-sm mt-1">{errors.timeStart}</p>
            )}
          </div>

          {/* End Time */}
          <div>
            <label
              htmlFor="timeEnd"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t(lang, "End Time")}
            </label>
            <input
              type="datetime-local"
              id="timeEnd"
              value={timeEnd}
              onChange={(e) => setTimeEnd(e.target.value)}
              min={timeStart || getMinDateTime()}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.timeEnd ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.timeEnd && (
              <p className="text-red-500 text-sm mt-1">{errors.timeEnd}</p>
            )}
          </div>

          {/* Existing Orders Warning */}
          {existingOrders.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-yellow-800 text-sm">
                {t(lang, "You have")} {existingOrders.length}{" "}
                {t(lang, "existing draft orders for this room")}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              {t(lang, "Cancel")}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              {t(lang, "Add to Cart")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
