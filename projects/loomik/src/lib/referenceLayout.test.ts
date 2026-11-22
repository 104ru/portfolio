import { describe, it, expect, beforeEach } from 'vitest';
import { defaultWidths,fitWidths,readWidths } from './referenceLayout';
describe('reference workspace resizing',()=>{
 beforeEach(()=>localStorage.clear());
 it('keeps the reference proportions when there is room',()=>{expect(fitWidths(defaultWidths(false),1224)).toEqual({left:320,right:360});expect(fitWidths(defaultWidths(true),1168)).toEqual({left:320,right:300})});
 it('reserves chat space when panels are dragged beyond the viewport',()=>{for(const available of [845,1000,1224]){const widths=fitWidths({left:900,right:900},available);expect(widths.left+widths.right).toBeLessThanOrEqual(available-280);expect(widths.left).toBeGreaterThanOrEqual(240);expect(widths.right).toBeGreaterThanOrEqual(150)}});
 it('loads account and deal preferences independently and recovers corrupted values',()=>{localStorage.setItem('loomik-reference-widths-account',JSON.stringify({left:390,right:330}));expect(readWidths(false)).toEqual({left:390,right:330});expect(readWidths(true)).toEqual(defaultWidths(true));localStorage.setItem('loomik-reference-widths-account','invalid');expect(readWidths(false)).toEqual(defaultWidths(false));localStorage.setItem('loomik-reference-widths-account','{"left":"500","right":null}');expect(readWidths(false)).toEqual(defaultWidths(false))});
});
