import { ChartData, ChartOptions } from 'chart.js';
import { TideData } from '@/types/tide';

export const createTideChartData = (data: { d: string; t: number; l: number }[]) => {
  const chartData: ChartData<'line'> = {
    labels: data.map(d => d.t.toString().padStart(2, '0')), // 2桁に整形
    datasets: [
      {
        label: '潮位 (cm)',
        data: data.map(d => d.l),
        borderColor: '#1976d2',
        tension: 0.35,
        fill: true,
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        borderWidth: 1.5,
        pointRadius: 1.5,
        pointStyle: 'circle',
        pointBorderWidth: 1.5,
        hitRadius: 4.5,
      },
    ],
  };
  return chartData;
};

export const createTideChartOptions = (): ChartOptions<'line'> => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: false,
      title: {
        display: true,
        text: '潮位 (cm)'
      },
      ticks: {
        stepSize: 100,
        callback: function(this: any, value: any) {
          if (typeof value === 'number') {
            return `${value}cm`;
          }
          return value;
        }
      }
    },
    x: {
      title: {
        display: true,
        text: '時間'
      }
    }
  },
  plugins: {
    legend: {
      position: 'top' as const
    },
    title: {
      display: true,
      text: '潮位グラフ'
    }
  }
});
