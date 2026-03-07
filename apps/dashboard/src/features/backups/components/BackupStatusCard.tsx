import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleCheck as CheckCircle, Circle as XCircle, Clock, CircleAlert as AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Backup } from '../api/backupsApi';

interface BackupStatusCardProps {
  backup: Backup | null;
  clinicName?: string;
}

export function BackupStatusCard({ backup, clinicName }: BackupStatusCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="size-5 text-green-600" />;
      case 'failed':
        return <XCircle className="size-5 text-red-600" />;
      case 'in_progress':
        return <Clock className="size-5 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="size-5 text-yellow-600" />;
      default:
        return <AlertCircle className="size-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-50';
      case 'failed':
        return 'text-red-700 bg-red-50';
      case 'in_progress':
        return 'text-blue-700 bg-blue-50';
      case 'pending':
        return 'text-yellow-700 bg-yellow-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-600">
          {clinicName ? `${clinicName} - Last Backup` : 'Last Backup'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {backup ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(backup.backup_status)}
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(backup.backup_status)}`}>
                {backup.backup_status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Time:</span>{' '}
                {formatDistanceToNow(new Date(backup.backup_time), { addSuffix: true })}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Type:</span>{' '}
                {backup.backup_type.charAt(0).toUpperCase() + backup.backup_type.slice(1)}
              </p>
              {backup.backup_size > 0 && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Size:</span> {formatBytes(backup.backup_size)}
                </p>
              )}
              {backup.backup_status === 'failed' && backup.error_message && (
                <p className="text-sm text-red-600 mt-2">
                  <span className="font-medium">Error:</span> {backup.error_message}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <AlertCircle className="size-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-500">No backups found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
