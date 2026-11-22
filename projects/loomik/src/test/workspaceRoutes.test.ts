import { describe,it,expect } from 'vitest';
import { workspaceDestination } from '@/lib/workspaceRoutes';
describe('self-contained workspace routes',()=>{
 it('resolves stakeholder links to the correct deal rather than the legacy default',()=>{expect(workspaceDestination('/deal-gps','?stakeholder=12')).toBe('/deal/3');expect(workspaceDestination('/deal-gps','?deal=2')).toBe('/deal/2')});
 it('keeps resource and action links inside the reference workspace',()=>{expect(workspaceDestination('/calendar','?deal=3')).toBe('/deal/3?view=calendar');expect(workspaceDestination('/assets')).toBe('/?view=assets');expect(workspaceDestination('/action-hub')).toBe('/?panel=moves');expect(workspaceDestination('/portfolio')).toBe('/')});
 it('handles missing or invalid legacy identifiers',()=>{expect(workspaceDestination('/deal-gps','?stakeholder=invalid')).toBe('/');expect(workspaceDestination('/deal-gps','?deal=999')).toBe('/')});
});
