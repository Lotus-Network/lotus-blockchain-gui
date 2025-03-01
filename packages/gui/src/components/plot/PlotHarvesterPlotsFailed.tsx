import React, { useState, useMemo } from 'react';
import { Trans } from '@lingui/macro';
import { TableControlled } from '@lotus/core';
import { type Plot } from '@lotus/api';
import { useGetHarvesterPlotsInvalidQuery, useGetHarvesterQuery } from '@lotus/api-react';
import { Typography } from '@mui/material';
import PlotAction from './PlotAction';

const cols = [
  {
    field: 'filename',
    tooltip: 'filename',
    title: <Trans>Filename</Trans>,
  },
  {
    width: '150px',
    field: (plot: Plot) => <PlotAction plot={plot} />,
    title: <Trans>Action</Trans>,
  },
];

export type PlotHarvesterPlotsFailedProps = {
  nodeId: string;
};

export default function PlotHarvesterPlotsFailed(props: PlotHarvesterPlotsFailedProps) {
  const { nodeId } = props;
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const { failedToOpenFilenames, initialized, isLoading: isLoadingHarvester } = useGetHarvesterQuery({
    nodeId,
  });
  const { isLoading: isLoadingHarvesterPlots, data = [] } = useGetHarvesterPlotsInvalidQuery({
    nodeId,
    page,
    pageSize,
  });

  const rows = useMemo(() => {
    return data?.map((filename) => ({ filename }));
  }, [data]);

  const isLoading = isLoadingHarvester || isLoadingHarvesterPlots;
  const count = failedToOpenFilenames ?? 0;

  function handlePageChange(rowsPerPage: number, page: number) {
    setPageSize(rowsPerPage);
    setPage(page);
  }

  return (
    <TableControlled
      cols={cols}
      rows={rows}
      rowsPerPageOptions={[5, 10, 25, 50, 100]}
      page={page}
      rowsPerPage={pageSize}
      count={count}
      onPageChange={handlePageChange}
      isLoading={isLoading || !initialized}
      expandedCellShift={1}
      uniqueField="filename"
      caption={!failedToOpenFilenames && (
        <Typography variant="body2" align="center">
          <Trans>Hooray, no files here!</Trans>
        </Typography>
      )}
      pages={!!failedToOpenFilenames}
    />
  );
}
