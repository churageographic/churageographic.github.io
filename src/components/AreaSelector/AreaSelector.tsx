import { useState, useEffect } from 'react';
import { Select, MenuItem } from '@mui/material';
import { Area } from '@/types/tide';
import { fetchAreas } from '@/services/tideService';

interface AreaSelectorProps {
  value: string;
  onChange: (areaId: string) => void;
}

const AreaSelector: React.FC<AreaSelectorProps> = ({ value, onChange }) => {
  const [areas, setAreas] = useState<Area[]>([]);

  useEffect(() => {
    const areas = [
      {
        id: '4701',
        name: '沖縄',
        port: '我喜屋'
      },
      {
        id: '4704',
        name: '沖縄',
        port: '渡久地'
      },
      {
        id: '4733',
        name: '沖縄',
        port: '東'
      },
      {
        id: '4707',
        name: '沖縄',
        port: '石川'
      },
      {
        id: '4705',
        name: '沖縄',
        port: '那覇'
      },
      {
        id: '4726',
        name: '沖縄',
        port: '仲里'
      },
      {
        id: '4713',
        name: '沖縄',
        port: '平良'
      },
      {
        id: '4714',
        name: '沖縄',
        port: '長山'
      },
      {
        id: '4715',
        name: '沖縄',
        port: '石垣'
      },
      {
        id: '4737',
        name: '沖縄',
        port: '船越'
      },
      {
        id: '4720',
        name: '沖縄',
        port: '白浜'
      },
      {
        id: '4717',
        name: '沖縄',
        port: '比川'
      }
    ];
    setAreas(areas);
  }, []);

  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      displayEmpty
      sx={{
        minWidth: 200,
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(0, 0, 0, 0.23)',
        },
      }}
    >
      <MenuItem value="">
        <em>エリアを選択</em>
      </MenuItem>
      {areas.map((area) => (
        <MenuItem key={area.id} value={area.id}>
          {area.name} ({area.port})
        </MenuItem>
      ))}
    </Select>
  );
};

export default AreaSelector;
