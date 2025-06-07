import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

interface TideTableProps {
  data: { d: string; t: number; l: number }[];
}

const TideTable: React.FC<TideTableProps> = ({ data }) => {
  const [sortedData, setSortedData] = useState<{ d: string; t: number; l: number }[]>([]);

  useEffect(() => {
    // 時間順にソート
    const sorted = [...data].sort((a, b) => a.t - b.t);
    setSortedData(sorted);
  }, [data]);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>時間</TableCell>
            <TableCell>潮位 (cm)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map((row) => (
            <TableRow key={`${row.d}-${row.t}`}>
              <TableCell>{row.t.toString().padStart(2, '0')}時</TableCell>
              <TableCell>{row.l}cm</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TideTable;
