import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useClinicBackups, useBackupStats, useCreateBackup, useDeleteBackup } from '../hooks/useBackups';
import { BackupStatusCard } from '../components/BackupStatusCard';
import { useClinicStore } from '@/store/clinic-store';
import { Database, Download, RefreshCw, CircleCheck as CheckCircle, Circle as XCircle, Clock, CircleAlert as AlertCircle, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { DashboardLayout, PageHeader } from '@/components/layout/DashboardLayout';

export function SystemBackupsPage() {
  const { clinicId, clinics } = useClinicStore();
  const { data: backups = [], isLoading, refetch } = useClinicBackups(clinicId);
  const { data: stats } = useBackupStats();
  const createBackupMutation = useCreateBackup();
  const deleteBackupMutation = useDeleteBackup(clinicId);
  const currentClinic = clinics.find((c) => c.id === clinicId);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const hasInProgress = backups.some(
    (b) => b.backup_status === 'pending' || b.backup_status === 'in_progress'
  );

  useEffect(() => {
    if (hasInProgress) {
      pollingRef.current = setInterval(() => {
        refetch();
      }, 3000);
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [hasInProgress, refetch]);

  const handleDeleteBackup = async (backupId: string) => {
    try {
      await deleteBackupMutation.mutateAsync(backupId);
      setConfirmDeleteId(null);
    } catch (error) {
      console.error('Failed to delete backup:', error);
    }
  };

  const handleCreateBackup = async () => {
    if (!clinicId) return;
    try {
      await createBackupMutation.mutateAsync({
        clinic_id: clinicId,
        backup_type: 'full',
      });
      refetch();
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="size-4 text-green-600" />;
      case 'failed':
        return <XCircle className="size-4 text-red-600" />;
      case 'in_progress':
        return <Clock className="size-4 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="size-4 text-yellow-600" />;
      default:
        return <AlertCircle className="size-4 text-gray-600" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (!clinicId) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-muted-foreground">Please select a clinic first.</p>
        </div>
      </DashboardLayout>
    );
  }

  const latestBackup = backups.length > 0 ? backups[0] : null;

  return (
    <DashboardLayout>
      <PageHeader
        title="System Backups"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`size-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={handleCreateBackup}
              disabled={createBackupMutation.isPending}
            >
              <Database className="size-4 mr-2" />
              {createBackupMutation.isPending ? 'Creating...' : 'Create Backup'}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Backups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">
              {stats?.totalBackups || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">
              {stats?.completedBackups || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-600">
              {stats?.failedBackups || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">
              {formatBytes(stats?.totalSize || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {latestBackup && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Latest Backup</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <BackupStatusCard
              backup={latestBackup}
              clinicName={currentClinic?.name || 'Unknown Clinic'}
            />
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Backups</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading backups...</div>
          ) : backups.length === 0 ? (
            <div className="text-center py-8">
              <Database className="size-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No backups found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Backup Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell>
                        {formatDistanceToNow(new Date(backup.backup_time), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="capitalize">{backup.backup_type}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(backup.backup_status)}
                          <span className="capitalize">{backup.backup_status}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatBytes(backup.backup_size)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {backup.backup_status === 'completed' && backup.storage_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(backup.storage_url!, '_blank')}
                            >
                              <Download className="size-4" />
                            </Button>
                          )}
                          {confirmDeleteId === backup.id ? (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteBackup(backup.id)}
                                disabled={deleteBackupMutation.isPending}
                              >
                                {deleteBackupMutation.isPending ? 'Deleting...' : 'Confirm'}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setConfirmDeleteId(null)}
                                disabled={deleteBackupMutation.isPending}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmDeleteId(backup.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
