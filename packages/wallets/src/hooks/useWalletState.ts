import { useGetSyncStatusQuery } from '@lotus/api-react';
import { SyncingStatus } from '@lotus/api';
import getWalletSyncingStatus from '../utils/getWalletSyncingStatus';

export default function useWalletState(): {
  isLoading: boolean;
  state?: SyncingStatus;
} {
  const { data: walletState, isLoading } = useGetSyncStatusQuery({}, {
    pollingInterval: 10000,
  });

  return {
    isLoading,
    state: walletState && getWalletSyncingStatus(walletState),
  };
}
