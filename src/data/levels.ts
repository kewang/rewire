import type { Level } from '../types/game';
import { DEFAULT_APPLIANCES } from './constants';

const [hairDryer, kettle] = DEFAULT_APPLIANCES;

/** PRD v0.1 第 5 節關卡定義 */
export const LEVELS: readonly Level[] = [
  {
    name: 'L01 基礎教學',
    description: '接上吹風機並成功送電。理解 P ÷ V = I。',
    requiredAppliances: [hairDryer],
    budget: 50,
    survivalTime: 5,
  },
  {
    name: 'L02 燒線陷阱',
    description: '同時使用吹風機和快煮壺。小心選線！',
    requiredAppliances: [hairDryer, kettle],
    budget: 120,
    survivalTime: 5,
  },
  {
    name: 'L03 成本取捨',
    description: '同樣的電器，但預算收緊。不能無腦選最粗線。',
    requiredAppliances: [hairDryer, kettle],
    budget: 55,
    survivalTime: 5,
  },
] as const;
