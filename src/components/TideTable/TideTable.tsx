import { useState, useEffect } from 'react';
import { Box, Typography, Paper, styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface TideTableProps {
  data: { d: string; t: number; l: number }[];
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
}));

const TimeCell = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderBottom: `1px solid ${theme.palette.divider}`,
  borderRight: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const LevelCell = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderBottom: `1px solid ${theme.palette.divider}`,
  borderLeft: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const TideTable: React.FC<TideTableProps> = ({ data }) => {
  const theme = useTheme();
  const [sortedData, setSortedData] = useState<{ d: string; t: number; l: number }[]>([]);

  // 現在の時刻を取得
  const currentTime = new Date().getHours();

  // 現在時刻の前後1時間の範囲を取得（24時間の境界を考慮）
  const isWithinOneHour = (time: number) => {
    const prevHour = (currentTime - 1 + 24) % 24;
    const nextHour = (currentTime + 1) % 24;
    
    // 23時のケース：22時、23時、24時を強調
    if (currentTime === 23) {
      return time === 22 || time === 23 || time === 24;
    }
    
    // 0時のケース：0時、1時を強調
    if (currentTime === 0) {
      return time === 0 || time === 1;
    }
    
    return time === prevHour || time === nextHour;
  };

  // 現在の時刻の行を強調表示するためのスタイル
  const isCurrentTime = (time: number) => time === currentTime;

  // 現在の時刻の行のスタイル
  const getCurrentTimeStyle = (time: number) => ({
    bgcolor: isCurrentTime(time) ? '#ffe3e3' : undefined,
    border: isCurrentTime(time) ? `1px solid #ff1493` : undefined,
    borderRadius: isCurrentTime(time) ? '4px' : undefined,
    fontWeight: isCurrentTime(time) ? 'bold' : undefined,
  });

  useEffect(() => {
    // 時間順にソート
    const sorted = [...data].sort((a, b) => a.t - b.t);
    setSortedData(sorted);
  }, [data]);

  return (
    <StyledPaper>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: '#e3f2fd', p: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
          <Typography variant="h6">時間</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
          <Typography variant="h6">潮位</Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {sortedData.map((row, index) => (
          <Box key={`${row.d}-${row.t}`} sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            minHeight: '40px', 
            width: '100%', 
            p: 0,
            bgcolor: row.t === currentTime ? '#ffe3e3' : 
                    isWithinOneHour(row.t) ? '#e3f2fd' : 
                    index % 2 === 0 ? theme.palette.background.paper : theme.palette.action.hover,

            borderRadius: 0
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', flex: 1, width: '50%', p: 1 }}>
              <Typography variant="body1" sx={{ 
                color: row.t === currentTime ? '#ff1493' : 
                       isWithinOneHour(row.t) ? '#0000cd' : undefined,
                fontWeight: row.t === currentTime ? 'bold' : undefined
              }}>
                {row.t.toString().padStart(2, '0')}:00
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', flex: 1, width: '50%', p: 1 }}>
              <Typography variant="body1" sx={{ 
                color: row.t === currentTime ? '#ff1493' : 
                       isWithinOneHour(row.t) ? '#0000cd' : theme.palette.text.primary,
                fontWeight: row.t === currentTime ? 'bold' : undefined
              }}>
                {row.l}cm
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </StyledPaper>
  );
};

export default TideTable;
