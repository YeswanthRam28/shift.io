import React from 'react';
import { Board } from '../types';
import { cn } from '../lib/utils';

export const MiniBoard = ({ board }: { board?: Board }) => {
  const getMiniTileColor = (val: number) => {
    switch (val) {
      case 0: return 'bg-[#CCC0B3] border-transparent';
      case 2: return 'bg-[#EEE4DA] border-transparent';
      case 4: return 'bg-[#EDE0C8] border-transparent';
      case 8: return 'bg-[#F2B179] border-transparent';
      case 16: return 'bg-[#F59563] border-transparent';
      case 32: return 'bg-[#F67C5F] border-transparent';
      case 64: return 'bg-[#F65E3B] border-transparent';
      case 128:
      case 256: return 'bg-[#EDCF72] border-transparent';
      case 512:
      case 1024:
      case 2048: return 'bg-[#EDC22E] border-transparent shadow-[0_0_5px_rgba(237,194,46,0.5)]';
      default: return 'bg-[#3C3A32] border-transparent';
    }
  };

  return (
    <div className="mt-3 grid grid-cols-4 gap-1 p-2 bg-[#BBADA0] rounded-xl border border-white/5">
      {(board || Array(4).fill(Array(4).fill(0))).map((row, r) => 
        row.map((cell: number, c: number) => (
          <div 
            key={`${r}-${c}`} 
            className={cn(
              "aspect-square rounded-[3px] border transition-colors",
              getMiniTileColor(cell)
            )}
          />
        ))
      )}
    </div>
  );
};
