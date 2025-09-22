import { useEffect, useRef, useState, useCallback } from 'react';
import { useWebSocketStatusPublisher } from './WebSocketStatusContext';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './utils/AuthContext';
import { queryKeys } from './api/queryKeys';
import { authEvents, AUTH_EVENT } from './utils/authEvents';
import toast from 'react-hot-toast';

// ================================
// 🔧 WEBSOCKET CONFIGURATION
// ================================

const WS_CONFIG = {
    // Determine WebSocket URL based on environment
    getWebSocketURL: (userId) => {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const host = import.meta.env.DEV 
            ? 'localhost:8000' 
            : window.location.host;
        return `${protocol}://${host}/ws/${userId}`;
    },
    
    // Reconnection settings
    reconnectDelays: [1000, 2000, 5000, 10000, 30000], // Progressive delays
    maxReconnectAttempts: 5,
    heartbeatInterval: 30000, // 30 seconds
    connectionTimeout: 10000, // 10 seconds
};

// ================================
// 🎯 MESSAGE TYPE HANDLERS
// ================================

const createMessageHandlers = (queryClient, user) => ({
    // Task-related updates
    'tasks_update': (data) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks.root() });
    queryClient.invalidateQueries({ queryKey: queryKeys.user.dashboard() });
        
        if (data.task_title) {
            toast.success(`New task available: ${data.task_title}`, {
                icon: '📋',
                duration: 4000
            });
        }
    },

    'task_completed': (data) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks.root() });
    queryClient.invalidateQueries({ queryKey: queryKeys.user.dashboard() });
    queryClient.invalidateQueries({ queryKey: queryKeys.leaderboard.root() });
    queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
        
        if (data.user_id === user?.id) {
            toast.success(`Task completed! +${data.xp_earned || 0} XP`, {
                icon: '🎉',
                duration: 5000
            });
        }
    },

    // Submission workflow updates
    'submission_update': (data) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.submissions.root() });
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard() });
        
        if (data.user_id === user?.id) {
            const statusMessages = {
                'approved': `Submission approved! +${data.xp_earned || 0} XP`,
                'rejected': 'Submission rejected. Please try again.',
                'pending_review': 'Submission received and pending review'
            };
            
            const statusIcon = {
                'approved': '✅',
                'rejected': '❌',
                'pending_review': '⏳'
            }[data.status] || '📝';
            
            toast(statusMessages[data.status] || 'Submission status updated', {
                icon: statusIcon,
                duration: data.status === 'approved' ? 6000 : 4000
            });
        }
    },

    // Leaderboard and ranking updates
    'leaderboard_update': (data) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.leaderboard.root() });
    queryClient.invalidateQueries({ queryKey: queryKeys.weaving.leaderboard() });
        
        if (data.user_id === user?.id && data.new_rank) {
            toast.success(`You've moved to rank #${data.new_rank}!`, {
                icon: '🏆',
                duration: 5000
            });
        }
    },

    // Badge and achievement system
    'badges_update': (data) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.badges.root() });
    queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    queryClient.invalidateQueries({ queryKey: queryKeys.achievements.recent() });
        
        if (data.user_id === user?.id) {
            toast.success(`New badge earned: ${data.badge_title}!`, {
                icon: '🏅',
                duration: 6000
            });
        }
    },

    'achievement_unlocked': (data) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.badges.root() });
    queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    queryClient.invalidateQueries({ queryKey: queryKeys.achievements.recent() });
        
        if (data.user_id === user?.id) {
            toast.success(`Achievement unlocked: ${data.achievement_title}!`, {
                icon: '🌟',
                duration: 7000
            });
        }
    },

    // Essence and rewards
    'essence_update': (data) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    queryClient.invalidateQueries({ queryKey: queryKeys.user.dashboard() });
        
        if (data.user_id === user?.id && data.amount > 0) {
            toast.success(`+${data.amount} Essence earned!`, {
                icon: '✨',
                duration: 4000
            });
        }
    },

    // Weaving Loom updates
    'weaving_update': (data) => {
    // Invalidate weaving related caches regardless of who initiated (others may view leaderboard/threads)
    queryClient.invalidateQueries({ queryKey: queryKeys.weaving.status() });
    queryClient.invalidateQueries({ queryKey: queryKeys.weaving.availableThreads() });
    queryClient.invalidateQueries({ queryKey: queryKeys.weaving.leaderboard() });

        // Support multiple possible subtype field names for backwards compatibility
        const subtype = data.update_type || data.weaving_type || data.sub_type || data.subType || data.type_detail || data.event_type || data.weavingEvent || data.weaving_event_type || data.subtype || data.thread_event || data.thread_type || data.threadEvent || data.inner_type || data.kind || (data.type !== 'weaving_update' ? data.type : undefined);
        if (data.user_id === user?.id && subtype === 'thread_completed') {
            toast.success(`Thread woven successfully! +${data.impact_score || 0} impact`, {
                icon: '🧵',
                duration: 5000
            });
        }
    },

    // Admin notifications
    'admin_notification': (data) => {
        if (user?.role === 'admin') {
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard() });
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.usersRoot() });
            
            toast(data.message, {
                icon: '🔔',
                duration: 6000,
                style: {
                    background: '#1f2937',
                    color: '#f3f4f6',
                    border: '1px solid #374151'
                }
            });
        }
    },

    // System alerts
    'system_alert': (data) => {
        const alertTypes = {
            'maintenance': { icon: '🔧', color: '#f59e0b' },
            'update': { icon: '🔄', color: '#3b82f6' },
            'warning': { icon: '⚠️', color: '#ef4444' },
            'info': { icon: 'ℹ️', color: '#6b7280' }
        };
        
        const alert = alertTypes[data.alert_type] || alertTypes.info;
        
        toast(data.message, {
            icon: alert.icon,
            duration: 8000,
            style: {
                background: alert.color,
                color: 'white'
            }
        });
    },

    // User activity updates
    'user_activity': (data) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.activities.recent() });
    // user history could be parameterized; broad dashboard invalidation
    queryClient.invalidateQueries({ queryKey: queryKeys.user.history(user?.id || 'current') });
    },

    // Activity feed real-time additions (backend may emit as new_activity)
    'new_activity': (data) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.activities.recent() });
    if (data?.username && data?.action) {
        toast.success(`${data.username} ${data.action.replace(/_/g,' ')}!`, {
            icon: '📰',
            duration: 3000
        });
    }
    },

    // Reaction updates on activities
    'reaction_update': (data) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.activities.recent() });
    if (data?.activity_id) {
        // Could target a specific activity detail key if one existed
    }
    },

    // Level up notifications
    'level_up': (data) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    queryClient.invalidateQueries({ queryKey: queryKeys.user.dashboard() });
        
        if (data.user_id === user?.id) {
            toast.success(`Level up! You're now level ${data.new_level}!`, {
                icon: '🎖️',
                duration: 8000
            });
        }
    },

    // Streak notifications
    'streak_update': (data) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    queryClient.invalidateQueries({ queryKey: queryKeys.user.dashboard() });

        // Similar subtype extraction approach as weaving_update
        const subtype = data.streak_type || data.update_type || data.sub_type || data.subType || data.type_detail || data.event_type || data.subtype || (data.type !== 'streak_update' ? data.type : undefined);
        if (data.user_id === user?.id) {
            if (subtype === 'streak_milestone') {
                toast.success(`${data.streak_count} day streak! Keep it up!`, {
                    icon: '🔥',
                    duration: 6000
                });
            } else if (subtype === 'streak_lost') {
                toast.error('Streak lost! Start a new one today.', {
                    icon: '💔',
                    duration: 4000
                });
            }
        }
    }
});

// ================================
// 🔌 ENHANCED WEBSOCKET MANAGER
// ================================

// Allow tests to inject a custom WebSocket implementation
let WebSocketFactory = (url) => new WebSocket(url);
export function setWebSocketFactory(factory) {
    WebSocketFactory = factory;
}

// Keep a reference to the most recent socket instance (test visibility only; not for app logic)
export let __lastSocket = null; // test-only reference

// Extracted helper for sending auth refresh – exported for deterministic testing
export function sendAuthRefresh(socketInstance, token) {
    if (!socketInstance || socketInstance.readyState !== WebSocket.OPEN || !token) return false;
    try {
        socketInstance.send(JSON.stringify({ type: 'auth_refresh', token }));
        return true;
    } catch (e) {
        // Swallow errors (socket might be closing) – return false to indicate failure
        return false;
    }
}

export default function WebSocketManager() {
    const queryClient = useQueryClient();
    const { user, isAuthenticated } = useAuth();
    const publishStatus = useWebSocketStatusPublisher?.();
    
    // WebSocket state management
    const socketRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const heartbeatIntervalRef = useRef(null);
    const [connectionState, setConnectionState] = useState('disconnected');
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    
    // Message handlers
    const messageHandlers = useCallback(() => 
        createMessageHandlers(queryClient, user), [queryClient, user]
    );

    // ================================
    // 🔄 CONNECTION MANAGEMENT
    // ================================

    const cleanup = useCallback(() => {
        // Clear timers
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
        }
        
        // Close socket
        if (socketRef.current) {
            socketRef.current.onopen = null;
            socketRef.current.onmessage = null;
            socketRef.current.onclose = null;
            socketRef.current.onerror = null;
            socketRef.current.close();
            socketRef.current = null;
        }
        
    setConnectionState('disconnected');
    publishStatus && publishStatus('disconnected');
    }, []);

    const startHeartbeat = useCallback(() => {
        heartbeatIntervalRef.current = setInterval(() => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({ type: 'ping' }));
            }
        }, WS_CONFIG.heartbeatInterval);
    }, []);

    const connect = useCallback(() => {
        // Don't connect if user is not authenticated
        if (!user?.id || !isAuthenticated) {
            return;
        }

        // Close existing connection
        cleanup();
        
    setConnectionState('connecting');
    publishStatus && publishStatus('connecting');
        
        try {
            const wsURL = WS_CONFIG.getWebSocketURL(user.id);
            console.log('Connecting to WebSocket:', wsURL);
            
            socketRef.current = WebSocketFactory(wsURL);
            __lastSocket = socketRef.current; // update test handle
            
            // Connection timeout
            const connectionTimeout = setTimeout(() => {
                if (socketRef.current?.readyState === WebSocket.CONNECTING) {
                    console.error('WebSocket connection timeout');
                    socketRef.current.close();
                }
            }, WS_CONFIG.connectionTimeout);

            socketRef.current.onopen = () => {
                clearTimeout(connectionTimeout);
                console.log('WebSocket connected successfully');
                setConnectionState('connected');
                publishStatus && publishStatus('connected');
                setReconnectAttempts(0);
                
                // Start heartbeat
                startHeartbeat();
                
                // Send authentication message (idempotent)
                const currentToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
                if (currentToken) {
                    socketRef.current.send(JSON.stringify({
                        type: 'auth',
                        token: currentToken
                    }));
                }
                
                toast.success('Real-time connection established!', { 
                    icon: '🔗',
                    duration: 2000 
                });
            };

            socketRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('WebSocket message received:', data);

                    // Handle pong responses
                    if (data.type === 'pong') {
                        return;
                    }

                    // Route message to appropriate handler
                    const handlers = messageHandlers();
                    const handler = handlers[data.type];
                    
                    if (handler) {
                        handler(data);
                    } else {
                        console.warn('Unhandled WebSocket message type:', data.type);
                    }

                } catch (err) {
                    console.error('Failed to parse WebSocket message:', err);
                }
            };

            socketRef.current.onclose = (event) => {
                clearTimeout(connectionTimeout);
                setConnectionState('disconnected');
                publishStatus && publishStatus('disconnected');
                
                // Clear heartbeat
                if (heartbeatIntervalRef.current) {
                    clearInterval(heartbeatIntervalRef.current);
                    heartbeatIntervalRef.current = null;
                }
                
                console.warn('WebSocket disconnected:', event.code, event.reason);
                
                // Attempt reconnection if not intentionally closed
                if (event.code !== 1000 && reconnectAttempts < WS_CONFIG.maxReconnectAttempts) {
                    const delay = WS_CONFIG.reconnectDelays[Math.min(reconnectAttempts, WS_CONFIG.reconnectDelays.length - 1)];
                    
                    console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${WS_CONFIG.maxReconnectAttempts})`);
                    
                    setReconnectAttempts(prev => prev + 1);
                    setConnectionState('reconnecting');
                    publishStatus && publishStatus('reconnecting');
                    
                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();
                    }, delay);
                } else if (reconnectAttempts >= WS_CONFIG.maxReconnectAttempts) {
                    toast.error('Real-time connection lost. Please refresh the page.', {
                        icon: '🔌',
                        duration: 6000
                    });
                }
            };

            socketRef.current.onerror = (error) => {
                clearTimeout(connectionTimeout);
                console.error('WebSocket error:', error);
                setConnectionState('error');
                publishStatus && publishStatus('error');
                
                // Close the connection to trigger reconnection
                if (socketRef.current) {
                    socketRef.current.close();
                }
            };

        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            setConnectionState('error');
            publishStatus && publishStatus('error');
        }
    }, [user, isAuthenticated, cleanup, startHeartbeat, messageHandlers, reconnectAttempts]);

    // ================================
    // 🎛️ LIFECYCLE MANAGEMENT
    // ================================

    useEffect(() => {
        if (user?.id && isAuthenticated) {
            connect();
        } else {
            cleanup();
        }

        return cleanup;
    }, [user?.id, isAuthenticated, connect, cleanup]);

    // Auth event integration
    useEffect(() => {
        // Re-authenticate with fresh token without full reconnect
        const onTokenRefresh = ({ token }) => {
            // Delegate to testable helper
            sendAuthRefresh(socketRef.current, token);
        };

        // Close socket on session expiry
        const onSessionExpired = () => {
            if (socketRef.current) {
                try {
                    socketRef.current.close(4001, 'session_expired');
                } catch (err) {
                    // Silently ignore errors during close; socket may already be closing/closed
                }
            }
        };

        // Graceful logout handling
        const onLogout = () => {
            cleanup();
        };

        const unsubRefresh = authEvents.on(AUTH_EVENT.TOKEN_REFRESH, onTokenRefresh);
        const unsubExpired = authEvents.on(AUTH_EVENT.SESSION_EXPIRED, onSessionExpired);
        const unsubLogout = authEvents.on(AUTH_EVENT.LOGOUT, onLogout);

        return () => {
            unsubRefresh();
            unsubExpired();
            unsubLogout();
        };
    }, [cleanup]);

    // Cleanup on unmount
    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    // ================================
    // 🔍 CONNECTION STATUS INDICATOR
    // ================================

    useEffect(() => {
        // Add connection status to development console
        if (import.meta.env.DEV) {
            console.log('WebSocket status:', connectionState, 'Attempts:', reconnectAttempts);
        }
    }, [connectionState, reconnectAttempts]);

    // This component does not render anything visible
    return null;
}

// ================================
// 🛠️ UTILITY FUNCTIONS
// ================================

// Export connection state hook for components that need to show connection status
export const useWebSocketStatus = () => {
    const [status, setStatus] = useState('disconnected');
    
    useEffect(() => {
        // This would need to be connected to the WebSocketManager state
        // For now, return a basic implementation
        return () => {};
    }, []);
    
    return status;
};

// Manual WebSocket message sender (for components that need to send messages)
export const useWebSocketSender = () => {
    const { user } = useAuth();
    
    return useCallback((message) => {
        // Access the WebSocket instance and send message
        // This would need to be implemented with a context or ref sharing
        console.log('Sending WebSocket message:', message);
    }, [user]);
};