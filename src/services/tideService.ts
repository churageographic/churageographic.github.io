import { Area } from '@/types/tide';

interface TideResponse {
  data: { d: string; t: number; l: number }[];
  area: Area;
}

// 潮位データの型定義
interface TideItem {
  d: string;
  t: number;
  l: number;
}

const getTideData = async (jsonUrl: string): Promise<TideItem[]> => {
  try {
    const response = await fetch(jsonUrl);
    if (!response.ok) {
      throw new Error('データの取得に失敗しました');
    }
    return await response.json();
  } catch (error) {
    console.error('データ取得エラー:', error);
    throw error;
  }
};

const filterTideData = (data: TideItem[], date: string): TideItem[] => {
  const todayData = data.filter((item: TideItem) => item.d === date);
  const lastItem = todayData[todayData.length - 1];
  if (lastItem && lastItem.t === 23) {
    todayData.push({
      d: lastItem.d,
      t: 24,
      l: data.length > data.indexOf(lastItem) + 1 ? data[data.indexOf(lastItem) + 1].l : 0
    });
  }
  return todayData;
};

const getArea = (areaId: string): Area => {
  return {
    id: areaId,
    name: areaId === 'okinawa' ? '沖縄' : areaId === 'kumejima' ? '久米島' : '伊良部島',
    port: areaId === 'okinawa' ? '那覇' : areaId === 'kumejima' ? '久米島' : '伊良部'
  };
};

const cacheTideData = (cacheKey: string, data: TideItem[], area: Area) => {
  const cacheResult = {
    data,
    area
  };
  localStorage.setItem(cacheKey, JSON.stringify(cacheResult));
  const cacheExpireDate = new Date();
  cacheExpireDate.setDate(cacheExpireDate.getDate() + 7);
  localStorage.setItem(`${cacheKey}-expire`, cacheExpireDate.toISOString());
};

const getCachedTideData = (cacheKey: string, date: string): TideResponse | null => {
  const expireDateStr = localStorage.getItem(`${cacheKey}-expire`);
  if (expireDateStr) {
    const expireDate = new Date(expireDateStr as string);
    const now = new Date();
    if (now <= expireDate) {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const cachedResult = JSON.parse(cachedData);
        const todayData = filterTideData(cachedResult.data, date);
        return {
          data: todayData,
          area: cachedResult.area
        };
      }
    }
  }
  return null;
};

export const fetchTideData = async (areaId: string, date: string): Promise<TideResponse> => {
  const year = date.split('-')[0];
  const cacheKey = `tide-data-${year}${areaId}`;
  const cachedData = getCachedTideData(cacheKey, date);
  if (cachedData) {
    return cachedData;
  }

  const areaCode = areaId.toUpperCase();
  const areaPref = areaCode.substr(0, 2);
  const areaPoi = areaCode.substr(2);
  const host = 'churageographic.github.io';
  const jsonUrl = `https://${host}/data/${areaPref}/${areaPoi}/${year}.json`;
  console.log(`Fetching tide data from: ${jsonUrl}`);

  try {
    const data = await getTideData(jsonUrl);
    console.log(`Successfully fetched tide data for ${areaId} (${date})`);
    const todayData = filterTideData(data, date);
    const area = getArea(areaId);
    cacheTideData(cacheKey, data, area);

    return {
      data: todayData,
      area
    };
  } catch (error) {
    console.error(`Failed to fetch tide data for ${areaId} (${date}):`, error);
    throw error;
  }
}

export const fetchAreas = async (): Promise<Area[]> => {
  return [
    { id: '4701', name: '沖縄', port: '我喜屋' },
    { id: '4704', name: '沖縄', port: '渡久地' },
    { id: '4733', name: '沖縄', port: '東' },
    { id: '4707', name: '沖縄', port: '石川' },
    { id: '4705', name: '沖縄', port: '那覇' },
    { id: '4726', name: '沖縄', port: '仲里' },
    { id: '4713', name: '沖縄', port: '平良' },
    { id: '4714', name: '沖縄', port: '長山' },
    { id: '4715', name: '沖縄', port: '石垣' },
    { id: '4737', name: '沖縄', port: '船越' },
    { id: '4720', name: '沖縄', port: '白浜' },
    { id: '4717', name: '沖縄', port: '比川' }
  ];
};
