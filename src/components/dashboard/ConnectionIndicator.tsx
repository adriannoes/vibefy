import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Clock,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RealtimeStatus } from '@/hooks/useRealtimeDashboard';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConnectionIndicatorProps {
  status: RealtimeStatus;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({
  status,
  onRefresh,
  isRefreshing = false,
  className
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getConnectionInfo = () => {
    if (!status.isConnected) {
      return {
        icon: WifiOff,
        label: 'Offline',
        variant: 'destructive' as const,
        color: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-950/20',
        description: 'Sem conexão com o servidor',
      };
    }

    switch (status.connectionQuality) {
      case 'excellent':
        return {
          icon: Wifi,
          label: 'Online',
          variant: 'default' as const,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-950/20',
          description: 'Conexão excelente',
        };
      case 'good':
        return {
          icon: Wifi,
          label: 'Online',
          variant: 'secondary' as const,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          description: 'Conexão boa',
        };
      case 'poor':
        return {
          icon: AlertCircle,
          label: 'Conexão Instável',
          variant: 'outline' as const,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 dark:bg-orange-950/20',
          description: 'Conexão instável - dados podem estar desatualizados',
        };
      default:
        return {
          icon: WifiOff,
          label: 'Offline',
          variant: 'destructive' as const,
          color: 'text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          description: 'Sem conexão com o servidor',
        };
    }
  };

  const connectionInfo = getConnectionInfo();
  const Icon = connectionInfo.icon;

  const getLastUpdateText = () => {
    if (!status.lastUpdate) return 'Nunca atualizado';

    const distance = formatDistanceToNow(status.lastUpdate, {
      addSuffix: true,
      locale: ptBR
    });

    return `Última atualização ${distance}`;
  };

  const getSubscriptionsText = () => {
    if (status.activeSubscriptions.length === 0) return 'Nenhuma inscrição ativa';

    return `${status.activeSubscriptions.length} inscrição${status.activeSubscriptions.length > 1 ? 'ões' : ''} ativa${status.activeSubscriptions.length > 1 ? 's' : ''}: ${status.activeSubscriptions.join(', ')}`;
  };

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-2", className)}>
        <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full cursor-help transition-all",
                connectionInfo.bgColor
              )}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <div className="flex items-center gap-1.5">
                {isRefreshing ? (
                  <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
                ) : (
                  <Icon className={cn("h-3 w-3", connectionInfo.color)} />
                )}

                {status.connectionQuality === 'excellent' && (
                  <div className="flex">
                    <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                    <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse ml-0.5" style={{ animationDelay: '0.2s' }} />
                    <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse ml-0.5" style={{ animationDelay: '0.4s' }} />
                  </div>
                )}
              </div>

              <span className={cn("text-xs font-medium", connectionInfo.color)}>
                {connectionInfo.label}
              </span>

              {status.connectionQuality === 'poor' && (
                <AlertCircle className="h-3 w-3 text-orange-500" />
              )}
            </div>
          </TooltipTrigger>

          <TooltipContent side="bottom" className="max-w-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4", connectionInfo.color)} />
                <span className="font-medium">{connectionInfo.label}</span>
                <Badge variant={connectionInfo.variant} className="text-xs">
                  {status.connectionQuality}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                {connectionInfo.description}
              </p>

              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {getLastUpdateText()}
                </div>

                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {getSubscriptionsText()}
                </div>
              </div>

              {status.connectionQuality === 'poor' && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-orange-600">
                    💡 Dica: Clique em "Atualizar" para forçar uma sincronização dos dados
                  </p>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        {onRefresh && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Atualizar dados"
          >
            <RefreshCw className={cn(
              "h-4 w-4",
              isRefreshing && "animate-spin"
            )} />
          </Button>
        )}
      </div>
    </TooltipProvider>
  );
};
