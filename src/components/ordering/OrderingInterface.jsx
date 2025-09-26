// components/ordering/OrderingInterface.jsx
import React, { useEffect, useState } from "react";
import { apiCall } from "../../api/api";
import { useLang } from "../../utils/language";
import { t } from "../../utils/translation";
import CoachGrid from "./CoachGrid";
import OrderModal from "./OrderModal";
import OrderSummary from "./OrderSummary";

export default function OrderingInterface({ place }) {
  const { lang } = useLang();
  const [rooms, setRooms] = useState([]);
  const [orders, setOrders] = useState([]); // Existing orders from API
  const [draftOrders, setDraftOrders] = useState([]); // Local draft orders
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch available rooms and existing orders for this place
  useEffect(() => {
    fetchRooms();
    fetchOrders();
  }, [place?.id]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await apiCall(
        `order/order/rooms/?place=${place.id}&is_available=true`
      );

      if (response.success) {
        setRooms(response.data || []);
      } else {
        setError(response.error || t(lang, "Failed to load rooms"));
      }
    } catch (err) {
      setError(t(lang, "Failed to load rooms"));
    }
  };

  const fetchOrders = async () => {
    try {
      // This will automatically return orders for the current user's bot_client
      // filtered by the place ID through your Django viewset
      const response = await apiCall(`order/order/ordering/?place=${place.id}`);

      if (response.success) {
        setOrders(response.data || []);
      } else {
        console.error("Failed to fetch orders:", response.error);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleAddOrder = (orderData) => {
    const newOrder = {
      id: Date.now(), // temporary ID for local management
      room: selectedRoom,
      ...orderData,
      status: "draft",
    };

    setDraftOrders((prev) => [...prev, newOrder]);
    setSelectedRoom(null);
    setIsModalOpen(false);
  };

  const handleRemoveOrder = (orderId) => {
    // Check if it's a draft order or existing order
    if (orderId.toString().includes("draft")) {
      setDraftOrders((prev) => prev.filter((order) => order.id !== orderId));
    } else {
      // For existing orders, you might want to delete from server
      handleDeleteOrder(orderId);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const response = await apiCall(
        `order/order/ordering/${orderId}/`,
        "DELETE"
      );

      if (response.success) {
        // Remove from local state
        setOrders((prev) => prev.filter((order) => order.id !== orderId));
        alert(t(lang, "Order deleted successfully!"));
      } else {
        throw new Error(response.error || t(lang, "Failed to delete order"));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateOrder = (orderId, updates) => {
    // For draft orders
    if (orderId.toString().includes("draft")) {
      setDraftOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, ...updates } : order
        )
      );
    } else {
      // For existing orders - you might want to update on server
      handleUpdateOrderOnServer(orderId, updates);
    }
  };

  const handleUpdateOrderOnServer = async (orderId, updates) => {
    try {
      const response = await apiCall(
        `order/order/ordering/${orderId}/`,
        "PATCH",
        updates
      );

      if (response.success) {
        // Update local state
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, ...updates } : order
          )
        );
        alert(t(lang, "Order updated successfully!"));
      } else {
        throw new Error(response.error || t(lang, "Failed to update order"));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBatchSubmit = async () => {
    if (draftOrders.length === 0) return;

    try {
      setLoading(true);

      // Prepare data for batch create
      const batchData = draftOrders.map((order) => ({
        room: order.room.id,
        type: order.type,
        time_start: order.time_start,
        time_end: order.time_end,
      }));

      const response = await apiCall(
        "order/order/ordering/batch_create/",
        "POST",
        batchData
      );

      if (response.success) {
        // Clear draft orders on success and refresh existing orders
        setDraftOrders([]);
        fetchOrders(); // Refresh to get the newly created orders
        alert(t(lang, "Orders created successfully!"));
        // Refresh rooms to update availability
        fetchRooms();
      } else {
        throw new Error(response.error || t(lang, "Failed to create orders"));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchDelete = async (orderIds) => {
    try {
      setLoading(true);

      // Separate draft orders from existing orders
      const draftOrderIds = orderIds.filter((id) =>
        id.toString().includes("draft")
      );
      const existingOrderIds = orderIds.filter(
        (id) => !id.toString().includes("draft")
      );

      // Delete draft orders from local state
      if (draftOrderIds.length > 0) {
        setDraftOrders((prev) =>
          prev.filter((order) => !draftOrderIds.includes(order.id))
        );
      }

      // Delete existing orders from server
      if (existingOrderIds.length > 0) {
        const response = await apiCall(
          "order/order/ordering/batch_delete/",
          "POST",
          {
            ids: existingOrderIds,
          }
        );

        if (response.success) {
          // Remove deleted orders from local state
          setOrders((prev) =>
            prev.filter((order) => !existingOrderIds.includes(order.id))
          );
          fetchRooms(); // Refresh room availability
        } else {
          throw new Error(response.error || t(lang, "Failed to delete orders"));
        }
      }

      alert(t(lang, "Orders deleted successfully!"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Combine existing orders and draft orders for display
  const allOrders = [...orders, ...draftOrders];

  if (loading && rooms.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p>{error}</p>
        <button
          onClick={() => {
            setError(null);
            fetchRooms();
            fetchOrders();
          }}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          {t(lang, "Retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Coach-style Room Grid */}
      <CoachGrid
        rooms={rooms}
        orders={allOrders} // Pass both existing and draft orders
        onRoomSelect={handleRoomSelect}
        place={place}
      />
      {/* Order Summary */}
      {allOrders.length > 0 && (
        <OrderSummary
          orders={allOrders}
          onRemoveOrder={handleRemoveOrder}
          onUpdateOrder={handleUpdateOrder}
          onBatchSubmit={handleBatchSubmit}
          onBatchDelete={handleBatchDelete}
          loading={loading}
          isCreatingNewOrder={draftOrders.length > 0} // This controls the Confirm button visibility
        />
      )}
      {/* Order Modal */}
      {isModalOpen && selectedRoom && (
        <OrderModal
          room={selectedRoom}
          onClose={() => {
            setSelectedRoom(null);
            setIsModalOpen(false);
          }}
          onSubmit={handleAddOrder}
          existingOrders={allOrders.filter(
            (order) => order.room.id === selectedRoom.id
          )}
        />
      )}
      {/* Refresh button to manually reload data */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            fetchRooms();
            fetchOrders();
          }}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          {t(lang, "Refresh Data")}
        </button>
      </div>
    </div>
  );
}
