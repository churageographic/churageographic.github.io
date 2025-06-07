import React from 'react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { startOfYear, endOfYear } from 'date-fns';

interface DateSelectorProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  defaultValue?: Date;
  label?: string;
  slotProps?: {
    textField?: {
      sx?: {
        '& .MuiOutlinedInput-root'?: {
          minWidth?: number;
        };
      };
    };
  };
}

const DateSelector: React.FC<DateSelectorProps> = ({ 
  value, 
  onChange, 
  minDate = startOfYear(new Date()),
  maxDate = endOfYear(new Date()),
  defaultValue = new Date(),
  label = '日付選択',
  slotProps = {
    textField: {
      sx: {
        '& .MuiOutlinedInput-root': {
          minWidth: 200,
        },
      },
    },
  },
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        value={value}
        onChange={onChange}
        label={label}
        slotProps={slotProps}
        minDate={minDate}
        maxDate={maxDate}
        defaultValue={defaultValue}
        format="yyyy/MM/dd"
      />
    </LocalizationProvider>
  );
};

export default DateSelector;
