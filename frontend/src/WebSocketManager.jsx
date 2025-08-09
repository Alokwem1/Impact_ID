import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './utils/AuthContext';
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
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['userDashboard'] });
        
        if (data.task_title) {
            toast.success(`New task available: ${data.task_title}`, {
                icon: '📋',
                duration: 4000
            });
        }
    },

    'task_completed': (data) => {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['userDashboard'] });
        queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        
        if (data.user_id === user?.id) {
            toast.success(`Task completed! +${data.xp_earned || 0} XP`, {
                icon: '🎉',
                duration: 5000
            });
        }
    },

    // Submission workflow updates
    'submission_update': (data) => {
        queryClient.invalidateQueries({ queryKey: ['submissions'] });
        queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
        
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
        queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
        queryClient.invalidateQueries({ queryKey: ['weavingLeaderboard'] });
        
        if (data.user_id === user?.id && data.new_rank) {
            toast.success(`You've moved to rank #${data.new_rank}!`, {
                icon: '🏆',
                duration: 5000
            });
        }
    },

    // Badge and achievement system
    'badges_update': (data) => {
        queryClient.invalidateQueries({ queryKey: ['badges'] });
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        queryClient.invalidateQueries({ queryKey: ['recentAchievements'] });
        
        if (data.user_id === user?.id) {
            toast.success(`New badge earned: ${data.badge_title}!`, {
                icon: '🏅',
                duration: 6000
            });
        }
    },

    'achievement_unlocked': (data) => {
        queryClient.invalidateQueries({ queryKey: ['badges'] });
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        queryClient.invalidateQueries({ queryKey: ['recentAchievements'] });
        
        if (data.user_id === user?.id) {
            toast.success(`Achievement unlocked: ${data.achievement_title}!`, {
                icon: '🌟',
                duration: 7000
            });
        }
    },

    // Essence and rewards
    'essence_update': (data) => {
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        queryClient.invalidateQueries({ queryKey: ['userDashboard'] });
        
        if (data.user_id === user?.id && data.amount > 0) {
            toast.success(`+${data.amount} Essence earned!`, {
                icon: '✨',
                duration: 4000
            });
        }
    },

    // Weaving Loom updates
    'weaving_update': (data) => {
        queryClient.invalidateQueries({ queryKey: ['weavingStatus'] });
        queryClient.invalidateQueries({ queryKey: ['availableThreads'] });
        queryClient.invalidateQueries({ queryKey: ['weavingLeaderboard'] });
        
        if (data.user_id === user?.id) {
            if (data.type === 'thread_completed') {
                toast.success(`Thread woven successfully! +${data.impact_score || 0} impact`, {
                    icon: '🧵',
                    duration: 5000
                });
            }
        }
    },

    // Admin notifications
    'admin_notification': (data) => {
        if (user?.role === 'admin') {
            queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            
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
        queryClient.invalidateQueries({ queryKey: ['recentActivities'] });
        queryClient.invalidateQueries({ queryKey: ['userHistory'] });
    },

    // Level up notifications
    'level_up': (data) => {
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        queryClient.invalidateQueries({ queryKey: ['userDashboard'] });
        
        if (data.user_id === user?.id) {
            toast.success(`Level up! You're now level ${data.new_level}!`, {
                icon: '🎖️',
                duration: 8000
            });
        }
    },

    // Streak notifications
    'streak_update': (data) => {
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        queryClient.invalidateQueries({ queryKey: ['userDashboard'] });
        
        if (data.user_id === user?.id) {
            if (data.type === 'streak_milestone') {
                toast.success(`${data.streak_count} day streak! Keep it up!`, {
                    icon: '🔥',
                    duration: 6000
                });
            } else if (data.type === 'streak_lost') {
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

export default function WebSocketManager() {
    const queryClient = useQueryClient();
    const { user, isAuthenticated } = useAuth();
    
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
        
        try {
            const wsURL = WS_CONFIG.getWebSocketURL(user.id);
            console.log('Connecting to WebSocket:', wsURL);
            
            socketRef.current = new WebSocket(wsURL);
            
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
                setReconnectAttempts(0);
                
                // Start heartbeat
                startHeartbeat();
                
                // Send authentication message
                socketRef.current.send(JSON.stringify({
                    type: 'auth',
                    token: localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
                }));
                
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
                
                // Close the connection to trigger reconnection
                if (socketRef.current) {
                    socketRef.current.close();
                }
            };

        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            setConnectionState('error');
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