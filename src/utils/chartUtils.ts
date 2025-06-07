import { ChartData, ChartOptions, ScriptableContext } from 'chart.js';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// 定数定義
const COLOR = {
  WHITE: '#ffffff',
  LIGHTGRAY: '#d3d3d3',
  OCEAN: '#1976d2'
} as const;

// 関数定義
const pointSize = 3;

// フォントサイズを画面サイズに応じて調整
const getFontSizeScale = () => {
  const width = window.innerWidth;
  const baseFontSize = 12;
  const minFontSize = 8;
  const maxFontSize = 16;
  
  // 画面サイズに応じてフォントサイズを調整
  const fontSize = baseFontSize + (width - 320) / 100;
  return Math.max(minFontSize, Math.min(maxFontSize, fontSize));
};

Chart.register(ChartDataLabels);

// データラベルの表示条件を満たすためのヘルパー関数
const shouldDisplayLabel = (context: any): boolean => {
  const index = context.dataIndex;
  return index % 2 === 0;
};

export const createTideChartData = (data: { d: string; t: number; l: number }[]) => {
  const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD形式で取得
  const chartData: ChartData<'line'> = {
    labels: data.map(d => d.t.toString().padStart(2, '0') + ':00'), // 00:00形式に整形
    datasets: [
      {
        label: dateStr.replace(/-/g, '/'),
        data: data.map(d => d.l),
        backgroundColor: COLOR.OCEAN,
        fill: true,
        borderColor: (context: ScriptableContext<'line'>) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return undefined;
          return getGradient(ctx, chartArea);
        },
        tension: 0.35,
        pointStyle: 'circle',
        pointRadius: pointSize * 0.75,
        pointBorderWidth: pointSize,
        pointHoverRadius: pointSize * 0.75,
        pointHoverBorderWidth: pointSize,
        pointHitRadius: pointSize * 3,
      },
    ],
  };
  return chartData;
};

export const createTideChartOptions = (): ChartOptions<'line'> => ({
  animation: false,
  responsive: true,
  maintainAspectRatio: false,
  elements: {
    line: {
      tension: 0.35, 
      borderWidth: pointSize * 0.75,
    },
    point: {
      pointStyle: "circle",
      radius: pointSize * 0.75,
      borderWidth: pointSize,
      hoverRadius: pointSize * 0.75,
      hoverBorderWidth: pointSize,
      hitRadius: pointSize * 3,
    }
  },
  scales: {
    x: {
      ticks: {
        autoSkip: false,
        maxRotation: 0,
        minRotation: 0,
        color: COLOR.WHITE,
        font: { size: 12 },
        stepSize: 3,
        maxTicksLimit: 9, // 0から24までの3時間ごとの9個のラベル
        callback: function(this: any, value: any) {
          // 3時間ごとに表示（0, 3, 6, 9, 12, 15, 18, 21, 24）
          return value % 3 === 0 ? value : null;
        }
      },
      grid: {
        color: function(context) {
          return COLOR.LIGHTGRAY;
        }
      }
    },
    y: {
      ticks: {
        stepSize: 30,
        font: { size: 12 },
        color: COLOR.LIGHTGRAY,
      },
      min: -30,
      max: 240,
      grid: {
        color: function(context) {
          return COLOR.LIGHTGRAY;
        }
      }
    }
  },
  plugins: {
    title: {
      display: false,
      text: "",
      font: {
        size: 14,
      }
    },
    legend: {
      display: false
    },
    tooltip: {
      titleFont: { size: 12 },
      bodyFont: { size: 15 },
      callbacks: {
        title: function(context) {
          return `${context[0].dataset.label} ${context[0].parsed.x}:00`;
        },
        label: function(context) {
          return ` ${context.parsed.y}cm`;
        }
      }                
    },
    datalabels: {
      display: shouldDisplayLabel,
      color: COLOR.OCEAN,
      font: {
        size: getFontSizeScale(),
        family: 'Arial',
        style: 'normal',
        weight: 'normal',
      },
      formatter: (value: number) => `${value}`,
      align: 'top',
      offset: 5, // ラベルを線から少し離す
    }
  }
});

let gradient: CanvasGradient | null = null;

export const getGradient = (ctx: CanvasRenderingContext2D, chartArea: { left: number; right: number; top: number; bottom: number }) => {
  if (!gradient) {
    gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(1, '#ff1493');
    gradient.addColorStop(0.75, '#191970');
    gradient.addColorStop(0.5, '#0000ff');
    gradient.addColorStop(0.25, '#7fffd4');
    gradient.addColorStop(0, '#ffff00');
  }
  return gradient;
};
