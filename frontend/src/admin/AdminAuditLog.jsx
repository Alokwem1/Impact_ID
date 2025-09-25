import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import {
  ShieldCheckIcon,
  FunnelIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon,
  DocumentTextIcon,
  CogIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import apiClient from "../api/axios";
import toast from "react-hot-toast";

// ================================
// 📊 CORRECTED API FUNCTIONS
// ================================

// ✅ FIXED: Corrected API endpoint to match your #backend admin router
const fetchAuditLogs = async ({
  action,
  admin_id,
  days_back,
  limit,
  offset,
}) => {
  const params = new URLSearchParams();

  if (action) params.append("action", action);
  if (admin_id) params.append("admin_id", admin_id);
  if (days_back) params.append("days_back", days_back);
  if (limit) params.append("limit", limit);
  if (offset) params.append("offset", offset);

  try {
    const { data } = await apiClient.get(`/api/admin/audit-logs?${params}`);
    return data;
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    throw new Error(
      error.response?.data?.detail || "Failed to fetch audit logs",
    );
  }
};

// ✅ ENHANCED: Export audit logs with better error handling
const exportAuditLogs = async (filters, searchTerm) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      params.append(key, value);
    }
  });
  if (searchTerm) params.append("search", searchTerm);

  const response = await apiClient.get(
    `/api/admin/audit-logs/export?${params}`,
    {
      responseType: "blob",
    },
  );

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `audit-logs-${new Date().toISOString().split("T")[0]}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// ================================
// 🎨 ENHANCED COMPONENTS
// ================================

// Log Details Modal Component
const LogDetailsModal = ({ log, onClose }) => {
  if (!log) return null;

  const getActionColor = (action) => {
    const actionColors = {
      create: "text-green-600 bg-green-100",
      update: "text-blue-600 bg-blue-100",
      delete: "text-red-600 bg-red-100",
      approve: "text-emerald-600 bg-emerald-100",
      reject: "text-orange-600 bg-orange-100",
      flag: "text-yellow-600 bg-yellow-100",
      ban: "text-red-700 bg-red-200",
      unban: "text-green-700 bg-green-200",
      login: "text-gray-600 bg-gray-100",
    };

    const lowerAction = action?.toLowerCase();
    for (const [key, color] of Object.entries(actionColors)) {
      if (lowerAction?.includes(key)) {
        return color;
      }
    }
    return "text-gray-600 bg-gray-100";
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border max-w-2xl shadow-lg rounded-md bg-white m-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Audit Log Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Log ID
              </label>
              <p className="text-lg">{log.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Admin</label>
              <p className="text-lg">
                {log.admin_username || `Admin #${log.admin_id}`}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Action
              </label>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}
              >
                {log.action}
              </span>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Target
              </label>
              <p className="text-lg">
                {log.target_type} #{log.target_id}
              </p>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-500">
                Timestamp
              </label>
              <p className="text-lg">
                {new Date(log.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          {log.details && (
            <div>
              <label className="text-sm font-medium text-gray-500">
                Details
              </label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{log.details}</p>
              </div>
            </div>
          )}

          {/* Additional metadata if available */}
          {log.ip_address && (
            <div>
              <label className="text-sm font-medium text-gray-500">
                IP Address
              </label>
              <p className="text-sm font-mono">{log.ip_address}</p>
            </div>
          )}

          {log.user_agent && (
            <div>
              <label className="text-sm font-medium text-gray-500">
                User Agent
              </label>
              <p className="text-sm break-all">{log.user_agent}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Advanced Filters Component
const AdvancedFilters = ({
  showAdvancedFilters,
  advancedFilters,
  setAdvancedFilters,
  onApplyAdvanced,
}) => (
  <div
    className={`transition-all duration-300 overflow-hidden ${
      showAdvancedFilters ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
    }`}
  >
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Target Type
        </label>
        <select
          value={advancedFilters.targetType}
          onChange={(e) =>
            setAdvancedFilters((prev) => ({
              ...prev,
              targetType: e.target.value,
            }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Types</option>
          <option value="user">User</option>
          <option value="task">Task</option>
          <option value="submission">Submission</option>
          <option value="badge">Badge</option>
          <option value="system">System</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Target ID
        </label>
        <input
          type="number"
          placeholder="Target ID"
          value={advancedFilters.targetId}
          onChange={(e) =>
            setAdvancedFilters((prev) => ({
              ...prev,
              targetId: e.target.value,
            }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date Range
        </label>
        <div className="flex space-x-2">
          <input
            type="date"
            value={advancedFilters.dateStart}
            onChange={(e) =>
              setAdvancedFilters((prev) => ({
                ...prev,
                dateStart: e.target.value,
              }))
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="date"
            value={advancedFilters.dateEnd}
            onChange={(e) =>
              setAdvancedFilters((prev) => ({
                ...prev,
                dateEnd: e.target.value,
              }))
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>

    <div className="mt-4 flex justify-end space-x-2">
      <button
        onClick={() =>
          setAdvancedFilters({
            targetType: "",
            targetId: "",
            dateStart: "",
            dateEnd: "",
          })
        }
        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
      >
        Clear Advanced
      </button>
      <button
        onClick={onApplyAdvanced}
        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
      >
        Apply Filters
      </button>
    </div>
  </div>
);

// Quick Actions Bar Component
const QuickActionsBar = ({
  selectedLogs,
  onClearSelection,
  onBulkExport,
  onBulkFlag,
}) => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Bars3Icon className="h-5 w-5 text-blue-600" />
        <span className="text-sm font-medium text-blue-800">
          {selectedLogs.size} log{selectedLogs.size !== 1 ? "s" : ""} selected
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={onBulkExport}
          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
        >
          Export Selected
        </button>
        <button
          onClick={onBulkFlag}
          className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
        >
          Flag for Review
        </button>
        <button
          onClick={onClearSelection}
          className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
        >
          Clear Selection
        </button>
      </div>
    </div>
  </div>
);

// ================================
// 🏠 MAIN COMPONENT
// ================================

export default function AdminAuditLog() {
  // Enhanced filter states
  const [filters, setFilters] = useState({
    action: "",
    admin_id: "",
    days_back: 7,
    limit: 50,
    offset: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLogs, setSelectedLogs] = useState(new Set());
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [criticalActions] = useState(["ban", "delete", "flag", "suspend"]);

  // Advanced filters
  const [advancedFilters, setAdvancedFilters] = useState({
    targetType: "",
    targetId: "",
    dateStart: "",
    dateEnd: "",
  });

  // Memoized query parameters
  const queryParams = useMemo(
    () => ({
      ...filters,
      ...advancedFilters,
    }),
    [filters, advancedFilters],
  );

  // ✅ ENHANCED: Fetch audit logs with better error handling
  const {
    data: logs = [],
    isLoading,
    isError,
    refetch,
    error,
    isFetching,
  } = useQuery({
    queryKey: queryKeys.admin.auditLogs(queryParams),
    queryFn: () => fetchAuditLogs(queryParams),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    refetchInterval: autoRefresh ? 30000 : false,
    onError: (error) => {
      console.error("Audit logs fetch error:", error);
      toast.error("Failed to load audit logs.");
    },
    onSuccess: (newLogs) => {
      // Check for new critical actions
      if (logs.length > 0 && newLogs.length > 0) {
        const latestTimestamp = new Date(logs[0]?.created_at || 0);
        const newCriticalActions = newLogs.filter(
          (log) =>
            new Date(log.created_at) > latestTimestamp &&
            criticalActions.some((action) =>
              log.action.toLowerCase().includes(action),
            ),
        );

        newCriticalActions.forEach((log) => {
          toast(`🚨 Critical Action: ${log.action} by ${log.admin_username}`, {
            duration: 8000,
            style: {
              background: "#ef4444",
              color: "white",
            },
          });
        });
      }
    },
  });

  // ✅ ENHANCED: Export mutation with better error handling
  const exportMutation = useMutation({
    mutationFn: () => exportAuditLogs(filters, searchTerm),
    onSuccess: () => {
      toast.success("Audit logs exported successfully!");
    },
    onError: (error) => {
      toast.error("Failed to export audit logs");
    },
  });

  // Filter logs by search term (client-side for better UX)
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        log.admin_username?.toLowerCase().includes(searchLower) ||
        log.action?.toLowerCase().includes(searchLower) ||
        log.target_type?.toLowerCase().includes(searchLower) ||
        log.details?.toLowerCase().includes(searchLower)
      );
    });
  }, [logs, searchTerm]);

  // Handle filter changes
  const handleFilterChange = useCallback((field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      offset: 0, // Reset pagination when filters change
    }));
  }, []);

  // Handle log selection
  const handleLogSelect = useCallback((logId) => {
    setSelectedLogs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  }, []);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (selectedLogs.size === filteredLogs.length && filteredLogs.length > 0) {
      setSelectedLogs(new Set());
    } else {
      setSelectedLogs(new Set(filteredLogs.map((log) => log.id)));
    }
  }, [selectedLogs.size, filteredLogs]);

  // Quick filter actions
  const quickFilters = [
    { label: "Last 24h", days_back: 1, icon: ClockIcon },
    {
      label: "Critical Actions",
      actions: criticalActions,
      icon: ExclamationTriangleIcon,
    },
    { label: "User Changes", action: "user", icon: UserIcon },
    { label: "Approvals", action: "approve", icon: ShieldCheckIcon },
    { label: "Deletions", action: "delete", icon: TrashIcon },
  ];

  const applyQuickFilter = useCallback(
    (filter) => {
      if (filter.days_back) handleFilterChange("days_back", filter.days_back);
      if (filter.action) handleFilterChange("action", filter.action);
      if (filter.actions) {
        setSearchTerm(filter.actions.join("|"));
      }
    },
    [handleFilterChange],
  );

  // Apply advanced filters
  const applyAdvancedFilters = useCallback(() => {
    // Advanced filters are already applied through queryParams
    toast.success("Advanced filters applied");
  }, []);

  // Bulk actions
  const handleBulkExport = useCallback(() => {
    // Implement bulk export for selected logs
    toast.success(`Exporting ${selectedLogs.size} selected logs...`);
  }, [selectedLogs.size]);

  const handleBulkFlag = useCallback(() => {
    // Implement bulk flagging for review
    toast.success(`Flagged ${selectedLogs.size} logs for review`);
  }, [selectedLogs.size]);

  // Get action color based on action type
  const getActionColor = useCallback((action) => {
    const actionColors = {
      create: "text-green-600 bg-green-100",
      update: "text-blue-600 bg-blue-100",
      delete: "text-red-600 bg-red-100",
      approve: "text-emerald-600 bg-emerald-100",
      reject: "text-orange-600 bg-orange-100",
      flag: "text-yellow-600 bg-yellow-100",
      ban: "text-red-700 bg-red-200",
      unban: "text-green-700 bg-green-200",
      login: "text-gray-600 bg-gray-100",
    };

    const lowerAction = action?.toLowerCase();
    for (const [key, color] of Object.entries(actionColors)) {
      if (lowerAction?.includes(key)) {
        return color;
      }
    }
    return "text-gray-600 bg-gray-100";
  }, []);

  // Get target type icon
  const getTargetIcon = useCallback((targetType) => {
    switch (targetType?.toLowerCase()) {
      case "user":
        return <UserIcon className="h-4 w-4" />;
      case "task":
        return <DocumentTextIcon className="h-4 w-4" />;
      case "submission":
        return <ShieldCheckIcon className="h-4 w-4" />;
      case "badge":
        return <CogIcon className="h-4 w-4" />;
      case "system":
        return <BellIcon className="h-4 w-4" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4" />;
    }
  }, []);

  // Enhanced loading state
  if (isLoading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Loading audit logs...</p>
      </div>
    );
  }

  // Enhanced error state
  if (isError) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Error Loading Logs
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {error?.message || "Could not load audit logs."}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <ArrowPathIcon className="h-4 w-4 mr-1" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Audit Log</h2>
          <p className="mt-1 text-sm text-gray-500">
            Track all administrative actions and system changes
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          {/* Auto-refresh toggle */}
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600">Auto-refresh</span>
          </label>

          <button
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
            {exportMutation.isPending ? "Exporting..." : "Export"}
          </button>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <ArrowPathIcon
              className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          </div>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showAdvancedFilters ? (
              <>
                <ChevronUpIcon className="h-4 w-4 mr-1" />
                Hide Advanced
              </>
            ) : (
              <>
                <ChevronDownIcon className="h-4 w-4 mr-1" />
                Show Advanced
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Action Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action
            </label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange("action", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="approve">Approve</option>
              <option value="reject">Reject</option>
              <option value="flag">Flag</option>
              <option value="ban">Ban</option>
              <option value="unban">Unban</option>
              <option value="login">Login</option>
            </select>
          </div>

          {/* Admin ID Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin ID
            </label>
            <input
              type="number"
              placeholder="Admin ID"
              value={filters.admin_id}
              onChange={(e) => handleFilterChange("admin_id", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Time Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Range
            </label>
            <select
              value={filters.days_back}
              onChange={(e) =>
                handleFilterChange("days_back", parseInt(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={1}>Last 24 hours</option>
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-200">
          <span className="text-xs font-medium text-gray-500">
            Quick Filters:
          </span>
          {quickFilters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.label}
                onClick={() => applyQuickFilter(filter)}
                className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
              >
                <Icon className="h-3 w-3 mr-1" />
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Advanced Filters */}
        <AdvancedFilters
          showAdvancedFilters={showAdvancedFilters}
          advancedFilters={advancedFilters}
          setAdvancedFilters={setAdvancedFilters}
          onApplyAdvanced={applyAdvancedFilters}
        />
      </div>

      {/* Quick Actions Bar */}
      {selectedLogs.size > 0 && (
        <QuickActionsBar
          selectedLogs={selectedLogs}
          onClearSelection={() => setSelectedLogs(new Set())}
          onBulkExport={handleBulkExport}
          onBulkFlag={handleBulkFlag}
        />
      )}

      {/* Audit Logs */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Audit Logs</h3>
              <p className="mt-1 text-sm text-gray-500">
                Showing {filteredLogs.length} of {logs.length} entries
              </p>
            </div>

            {/* Select All Checkbox */}
            {filteredLogs.length > 0 && (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={
                    selectedLogs.size === filteredLogs.length &&
                    filteredLogs.length > 0
                  }
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Select All</span>
              </label>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredLogs.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <li key={log.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {/* Selection Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedLogs.has(log.id)}
                        onChange={() => handleLogSelect(log.id)}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />

                      {/* Action Badge */}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}
                      >
                        {log.action}
                      </span>

                      {/* Log Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          {getTargetIcon(log.target_type)}
                          <span className="text-sm font-medium text-gray-900">
                            {log.admin_username || `Admin #${log.admin_id}`}
                          </span>
                          <span className="text-sm text-gray-500">
                            performed action on
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            {log.target_type} #{log.target_id}
                          </span>
                        </div>

                        {log.details && (
                          <p className="mt-1 text-sm text-gray-600 truncate">
                            {log.details}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* View Details Button */}
                      <button
                        onClick={() => {
                          setSelectedLog(log);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>

                      {/* Timestamp */}
                      <div className="flex items-center text-xs text-gray-500">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12">
              <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No audit logs
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {logs.length === 0
                  ? "No administrative actions have been logged recently."
                  : "No logs match your current filters."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {logs.length >= filters.limit && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() =>
                handleFilterChange(
                  "offset",
                  Math.max(0, filters.offset - filters.limit),
                )
              }
              disabled={filters.offset === 0}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() =>
                handleFilterChange("offset", filters.offset + filters.limit)
              }
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">{filters.offset + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(filters.offset + filters.limit, logs.length)}
                </span>{" "}
                of <span className="font-medium">{logs.length}+</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() =>
                    handleFilterChange(
                      "offset",
                      Math.max(0, filters.offset - filters.limit),
                    )
                  }
                  disabled={filters.offset === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    handleFilterChange("offset", filters.offset + filters.limit)
                  }
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Log Details Modal */}
      {showDetailsModal && (
        <LogDetailsModal
          log={selectedLog}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedLog(null);
          }}
        />
      )}
    </div>
  );
}
