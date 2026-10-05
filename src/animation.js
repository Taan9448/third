// Actual atlas frames: six poses per fighter; four frames per technique.
export const ATTACK_FRAMES=6;
export const SKILL_FRAMES=4;
export function attackFrame(elapsed,duration=1020){return Math.max(0,Math.min(5,Math.floor(elapsed/duration*6)));}
export function skillFrame(progress){return Math.max(0,Math.min(3,Math.floor(progress*4)));}
export const TECHNIQUE_ROWS=['slash','guard','spark','ward','bash','protect','bond','moon','storm','lotus','heal','focus','nova','fortress','flash','frost'];
