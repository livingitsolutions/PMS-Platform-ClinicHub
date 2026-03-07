import { CheckCheck, Calendar, DollarSign, FileText, X } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface NotificationsPanelProps {
  onClose: () => void;
}

export function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_created':
        return <Calendar className="size-5 text-blue-600" />;
      case 'payment_received':
        return <DollarSign className="size-5 text-green-600" />;
      case 'visit_completed':
        return <FileText className="size-5 text-purple-600" />;
      default:
        return <FileText className="size-5 text-gray-600" />;
    }
  };

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.metadata?.appointmentId) {
      navigate(`/appointments`);
    } else if (notification.metadata?.visitId) {
      navigate(`/visits/${notification.metadata.visitId}`);
    } else if (notification.metadata?.paymentId) {
      navigate(`/invoices`);
    }

    onClose();
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              className="text-xs"
            >
              <CheckCheck className="size-4 mr-1" />
              Mark all read
            </Button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Close notifications"
          >
            <X className="size-5 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="size-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${
                        !notification.read
                          ? 'font-semibold text-gray-900'
                          : 'text-gray-700'
                      }`}
                    >
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0">
                      <div className="size-2 bg-blue-600 rounded-full"></div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
