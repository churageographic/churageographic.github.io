import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { ChartData, ChartOptions } from 'chart.js';
import { createTideChartData, createTideChartOptions } from '@/utils/chartUtils';
import { TideData } from '@/types/tide';

Chart.register(...registerables);

interface TideChartProps {
  data: { d: string; t: number; l: number }[];
}

const TideChart: React.FC<TideChartProps> = ({ data }) => {
  const [chartData, setChartData] = useState<ChartData<'line'> | null>(null);
  const [chartOptions, setChartOptions] = useState<ChartOptions<'line'> | null>(null);

  useEffect(() => {
    if (data.length > 0) {
      setChartData(createTideChartData(data));
      setChartOptions(createTideChartOptions());
    }
  }, [data]);

  return (
    <Box sx={{ width: '100%', height: '400px' }}>
      {chartData && chartOptions && (
        <Line data={chartData} options={chartOptions} />
      )}
    </Box>
  );
};

export default TideChart;
