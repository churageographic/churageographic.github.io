import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import AreaSelector from '@/components/AreaSelector/AreaSelector';
import DateSelector from '@/components/DateSelector/DateSelector';
import TideChart from '@/components/TideChart/TideChart';
import TideTable from '@/components/TideTable/TideTable';
import { fetchTideData, fetchAreas } from '@/services/tideService';



const IndexPage: React.FC = () => {
  const [area, setArea] = useState<string>('');
  const [date, setDate] = useState<Date | null>(new Date());
  const [tideData, setTideData] = useState<{ d: string; t: number; l: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 地域リストの取得
    fetchAreas()
      .then((areas) => {
        if (areas.length > 0) {
          setArea(areas[0].id);
        }
      })
      .catch((error) => {
        console.error('Error fetching areas:', error);
      });
  }, []);

  // 地域と日付が変更された場合のデータ取得
  useEffect(() => {
    if (date && area) {
      const fetchData = async () => {
        setLoading(true);
        try {
          // 日付をYYYY-MM-DD形式に変換
          const formattedDate = date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }).replace(/\//g, '-');
          const response = await fetchTideData(area, formattedDate);
          setTideData(response.data);
        } catch (error) {
          console.error('Error fetching tide data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [date, area]);

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      p: 3,
      width: '100%'
    }}>
      <Box sx={{
        display: 'flex',
        gap: '20px',
        mb: 3
      }}>
        <AreaSelector
          value={area}
          onChange={(newArea) => setArea(newArea)}
        />
        <DateSelector
          value={date}
          onChange={(newDate) => setDate(newDate)}
          label="日付選択"
        />
      </Box>

      {loading ? (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px'
        }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <TideChart data={tideData} />
          <TideTable data={tideData} />
        </Box>
      )}
    </Box>
  );
};

export default IndexPage;
