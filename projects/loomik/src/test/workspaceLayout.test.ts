import { describe,it,expect } from 'vitest';
import { validColumns,loadColumns,saveColumns,COLUMN_STORAGE_KEY,DEFAULT_COLUMNS } from '@/lib/workspaceLayout';
describe('workspace width persistence',()=>{
 it('saves every resize synchronously and survives reload reads',()=>{saveColumns([33,40,27]);expect(loadColumns()).toEqual([33,40,27])});
 it('accepts collapsed priority moves',()=>{saveColumns([33,63,4]);expect(loadColumns()).toEqual([33,63,4])});
 it('rejects malformed and out-of-bounds saved widths',()=>{localStorage.setItem(COLUMN_STORAGE_KEY,'[5,2,93]');expect(loadColumns()).toEqual(DEFAULT_COLUMNS);expect(validColumns([29,44,NaN])).toBe(false)});
});
