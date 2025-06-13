import { useState, useEffect } from 'react';
import { Select, MenuItem, Box, FormControl, InputLabel } from '@mui/material';
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
        name: '我喜屋'
      },
      {
        id: '4704',
        name: '渡久地'
      },
      {
        id: '4733',
        name: '東'
      },
      {
        id: '4707',
        name: '石川'
      },
      {
        id: '4705',
        name: '那覇'
      },
      {
        id: '4726',
        name: '仲里'
      },
      {
        id: '4713',
        name: '平良'
      },
      {
        id: '4714',
        name: '長山'
      },
      {
        id: '4715',
        name: '石垣'
      },
      {
        id: '4737',
        name: '船越'
      },
      {
        id: '4720',
        name: '白浜'
      },
      {
        id: '4717',
        name: '比川'
      }
    ];
    setAreas(areas);
  }, []);

  return (
    <Box>
      <FormControl variant="outlined" fullWidth>
        <InputLabel id="area-select-label">エリア選択</InputLabel>
        <Select
          labelId="area-select-label"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          label="エリア選択"
          sx={{
            minWidth: 200,
          }}
        >
          <MenuItem value="">
            <em>エリアを選択</em>
          </MenuItem>
          {areas.map((area) => (
            <MenuItem key={area.id} value={area.id}>
              {area.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default AreaSelector;
