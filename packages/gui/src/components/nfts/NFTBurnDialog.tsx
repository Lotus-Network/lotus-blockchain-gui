import React, { useEffect } from 'react';
import { Trans } from '@lingui/macro';
import { type NFTInfo } from '@lotus/api';
import { useTransferNFTMutation } from '@lotus/api-react';
import { useForm } from 'react-hook-form';
import useBurnAddress from '../../hooks/useBurnAddress';
import {
  Button,
  ButtonLoading,
  Fee,
  Form,
  Flex,
  TextField,
  lotusToMojo,
  useOpenDialog,
  useShowError,
} from '@lotus/core';
import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import NFTSummary from './NFTSummary';
import NFTTransferConfirmationDialog from './NFTTransferConfirmationDialog';

type NFTPreviewDialogProps = {
  nft: NFTInfo;
  open?: boolean;
  onClose?: () => void;
};

type FormData = {
  fee: string;
  destination: string;
};

export default function NFTBurnDialog(props: NFTPreviewDialogProps) {
  const { nft, onClose = () => ({}), open = false, ...rest } = props;
  const burnAddress = useBurnAddress();
  const openDialog = useOpenDialog();
  const showError = useShowError();
  const [transferNFT] = useTransferNFTMutation();

  const methods = useForm<FormData>({
    defaultValues: {
      fee: '',
      destination: '',
    },
  });

  const { isSubmitting } = methods.formState;

  useEffect(() => {
    if (burnAddress) {
      methods.setValue('destination', burnAddress);
    }
  }, [burnAddress, methods]);

  function handleClose() {
    onClose();
  }

  async function handleSubmit(values: FormData) {
    const { fee, destination } = values;
    if (!destination) {
      return;
    }

    const confirmation = await openDialog(
      <NFTTransferConfirmationDialog
        destination={destination}
        fee={fee}
        confirmColor="danger"
        title={<Trans>Burn NFT confirmation</Trans>}
        description={
          <Alert severity="warning" icon={false}>
            <Trans>
              If you burn this NFT, nobody (including you) will ever be able to
              access it again. Are you sure you want to continue?
            </Trans>
          </Alert>
        }
        confirmTitle={<Trans>Burn</Trans>}
      />,
    );

    if (!confirmation) {
      return;
    }

    try {
      const feeInMojos = lotusToMojo(fee || 0);

      await transferNFT({
        walletId: nft.walletId,
        nftCoinId: nft.nftCoinId,
        launcherId: nft.launcherId,
        targetAddress: destination,
        fee: feeInMojos,
      }).unwrap();

      onClose();
    } catch (error) {
      showError(error);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth {...rest}>
      <DialogTitle id="nft-transfer-dialog-title">
        <Flex flexDirection="row" gap={1}>
          <Typography variant="h6">
            <Trans>Do you want to burn this NFT?</Trans>
          </Typography>
        </Flex>
      </DialogTitle>
      <DialogContent>
        <Form methods={methods} onSubmit={handleSubmit}>
          <Flex flexDirection="column" gap={3}>
            <DialogContentText id="nft-transfer-dialog-description">
              <Trans>
                Burning a non-fungible token means removing it from circulation
                by sending it to a verifiably un-spendable address. However,
                transactions leading up to the burn will remain on the
                blockchain ledger.
              </Trans>
            </DialogContentText>

            <Flex flexDirection="column" gap={3}>
              <Flex flexDirection="column" gap={1}>
                <NFTSummary launcherId={nft.launcherId} />
              </Flex>
              <TextField
                name="destination"
                variant="filled"
                color="secondary"
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
                label={<Trans>Send to Address</Trans>}
              />
              <Fee
                id="filled-secondary"
                variant="filled"
                name="fee"
                color="secondary"
                label={<Trans>Fee</Trans>}
                disabled={isSubmitting}
              />
              <DialogActions>
                <Flex flexDirection="row" gap={2}>
                  <Button
                    onClick={handleClose}
                    color="secondary"
                    variant="outlined"
                    autoFocus
                  >
                    <Trans>Cancel</Trans>
                  </Button>
                  <ButtonLoading
                    type="submit"
                    autoFocus
                    color="danger"
                    variant="contained"
                    loading={isSubmitting}
                    disableElevation
                  >
                    <Trans>Burn</Trans>
                  </ButtonLoading>
                </Flex>
              </DialogActions>
            </Flex>
          </Flex>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
