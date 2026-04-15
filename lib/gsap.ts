/**
 * lib/gsap.ts
 *
 * Central GSAP registration point.
 * Import from here (not from 'gsap' directly) so plugins
 * only get registered once.
 */

import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Observer } from 'gsap/all';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(SplitText, ScrollTrigger, Observer);
}

export { gsap, SplitText, ScrollTrigger, Observer };
export default gsap;
