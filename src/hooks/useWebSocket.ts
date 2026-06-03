"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface WebSocketMessage {
  type: string;
  showtimeId: string;
  data: any;
  timestamp: number;
}

interface SeatUpdate {
  seatId: string;
  seatLabel: string;
  status: "available" | "locked" | "booked";
  userId?: string;
}

interface UseWebSocketOptions {
  showtimeId: string;
  onSeatUpdate?: (update: SeatUpdate) => void;
  onSeatsLocked?: (seatIds: string[], seatLabels: string[], userId: string) => void;
  onSeatsUnlocked?: (seatIds: string[], seatLabels: string[]) => void;
  onBookingCreated?: (bookingId: string, seatIds: string[]) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export function useWebSocket({
  showtimeId,
  onSeatUpdate,
  onSeatsLocked,
  onSeatsUnlocked,
  onBookingCreated,
  onConnect,
  onDisconnect,
  onError,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    if (!showtimeId) {
      console.warn("No showtimeId provided for WebSocket");
      return;
    }

    setIsConnecting(true);

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001"}/api/ws?showtimeId=${showtimeId}`;
    
    try {
      const socket = new WebSocket(wsUrl);
      ws.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connected for showtime:", showtimeId);
        setIsConnected(true);
        setIsConnecting(false);
        reconnectAttempts.current = 0;
        onConnect?.();

        // Gửi message đăng ký nhận updates
        socket.send(
          JSON.stringify({
            type: "GET_SEATS_STATUS",
            showtimeId,
          })
        );
      };

      socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log("WebSocket message received:", message);

          switch (message.type) {
            case "SEAT_UPDATE":
              onSeatUpdate?.(message.data as SeatUpdate);
              break;

            case "SEATS_LOCKED":
              const lockedData = message.data as {
                seatIds: string[];
                seatLabels: string[];
                userId: string;
              };
              onSeatsLocked?.(lockedData.seatIds, lockedData.seatLabels, lockedData.userId);
              break;

            case "SEATS_UNLOCKED":
              const unlockedData = message.data as {
                seatIds: string[];
                seatLabels: string[];
              };
              onSeatsUnlocked?.(unlockedData.seatIds, unlockedData.seatLabels);
              break;

            case "BOOKING_CREATED":
              const bookingData = message.data as {
                bookingId: string;
                seatIds: string[];
              };
              onBookingCreated?.(bookingData.bookingId, bookingData.seatIds);
              break;

            case "PONG":
              // Heartbeat response
              break;

            default:
              console.log("Unknown message type:", message.type);
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      socket.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        setIsConnecting(false);
        ws.current = null;
        onDisconnect?.();

        // Tự động reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        onError?.(error);
      };
    } catch (err) {
      console.error("Error creating WebSocket:", err);
      setIsConnecting(false);
    }
  }, [showtimeId, onSeatUpdate, onSeatsLocked, onSeatsUnlocked, onBookingCreated, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);

  const sendMessage = useCallback((message: object) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected");
    }
  }, []);

  // Heartbeat để giữ connection alive
  useEffect(() => {
    if (!isConnected) return;

    const heartbeatInterval = setInterval(() => {
      sendMessage({ type: "PING", showtimeId });
    }, 30000); // 30 giây

    return () => clearInterval(heartbeatInterval);
  }, [isConnected, showtimeId, sendMessage]);

  // Connect khi component mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    sendMessage,
  };
}