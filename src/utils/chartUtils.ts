import { ChartData, ChartOptions, ScriptableContext } from 'chart.js';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// 定数定義
const COLOR = {
  WHITE: '#ffffff',
  GRAY: "#9e9e9e",
  DARKGRAY: "#1B2631",
  LIGHTGRAY: "#AEB6BF",  
  OCEAN: 'rgba(0, 0, 255, 0.2)',
  REEF: 'rgba(21, 67, 96, 0.3)'
} as const;

// 関数定義
const pointSize = 3;

// 画面幅に応じてラベル・データラベルの間引き幅を返す
export function getTickDivision(): number {
  if (window.matchMedia('(min-width: 1200px)').matches) {
    return 1;
  } else if (window.matchMedia('(min-width: 960px)').matches) {
    return 2;
  } else if (window.matchMedia('(min-width: 720px)').matches) {
    return 2;
  } else if (window.matchMedia('(min-width: 480px)').matches) {
    return 3;
  } else {
    return 3;
  }
}

// 画面幅に応じてx軸ラベルの最大数を返す
export function getMaxTickLimit(): number {
  if (window.matchMedia('(min-width: 1200px)').matches) {
    return 25;
  } else if (window.matchMedia('(min-width: 960px)').matches) {
    return 13;
  } else if (window.matchMedia('(min-width: 720px)').matches) {
    return 13;
  } else if (window.matchMedia('(min-width: 480px)').matches) {
    return 9;
  } else {
    return 9;
  }
}

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
  return index % getTickDivision() === 0;
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
  backgroundColor: 'lightslategrey',
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
        font: { size: getFontSizeScale() },
        stepSize: 3,
        maxTicksLimit: getMaxTickLimit(), // 0から24までの3時間ごとの9個のラベル
        callback: function(this: any, value: any, index: number) {
          // 画面幅に応じてラベル間引き
          return index % getTickDivision() === 0 ? value : null;
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
        font: { size: getFontSizeScale() },
        color: COLOR.LIGHTGRAY,
      },
      min: -30,
      max: 240,
      grid: {
        color: function(context) {
          return context.tick.value === 0 ? COLOR.WHITE : COLOR.LIGHTGRAY;
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
      color: COLOR.WHITE,
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

// 現在時刻の縦線を描画するChart.jsプラグイン
export const verticalLinePlugin = {
  id: 'verticalLine',
  afterDatasetDraw: (chart: any) => {
    const dataset = chart.data.datasets[0];
    if (!dataset || !chart.getDatasetMeta(0).data.length) return;

    const ctx = chart.ctx;
    ctx.save();

    // 現在時刻
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // x軸のデータ点
    const meta = chart.getDatasetMeta(0);
    const elements = meta.data;
    if (hour >= elements.length - 1) {
      ctx.restore();
      return;
    }

    // 現在時刻のx座標を補間で算出
    const orgX = elements[hour].x;
    const nextX = elements[hour + 1].x;
    const currX = orgX + ((nextX - orgX) / 60) * minute;

    ctx.strokeStyle = '#FF1493'; // COLOR.DEEPPINK 相当
    ctx.lineWidth = (elements[hour].options?.borderWidth || 2) / 1.5;
    ctx.beginPath();
    ctx.moveTo(currX, chart.chartArea.top);
    ctx.lineTo(currX, chart.chartArea.bottom);
    ctx.stroke();
    ctx.restore();
  }
};

// 0~-30cmの範囲を塗りつぶすChart.jsプラグイン
export const drawBackgroundPlugin = {
  id: 'drawBackground',
  beforeDraw: (chart: any) => {
    const ctx = chart.ctx;
    const xscale = chart.scales["x"];
    const yscale = chart.scales["y"];
    if (!xscale || !yscale) return;
    const left = xscale.left;
    const right = xscale.right;
    const top = yscale.getPixelForValue(0);
    const bottom = yscale.getPixelForValue(-30);
    ctx.save();
    ctx.fillStyle = COLOR.REEF; // 0〜-30cmはREEF色
    ctx.fillRect(left, top, right - left, bottom - top);
    ctx.restore();
  }
};

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
