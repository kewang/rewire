import type { Level } from '../types/game';
import { DEFAULT_APPLIANCES } from './constants';

const [hairDryer, kettle, , underSinkHeater, dryer] = DEFAULT_APPLIANCES;

/** PRD v0.2 關卡定義 */
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
  {
    name: 'L04 低功率陷阱',
    description: '廚下加熱器才 800W，看起來很無害？加上快煮壺撐 8 秒試試。',
    requiredAppliances: [underSinkHeater, kettle],
    budget: 85,
    survivalTime: 8,
  },
  {
    name: 'L05 長時間耐久',
    description: '烘衣機 + 快煮壺，合計 23.6A。2.0mm² 撐得過 15 秒嗎？',
    requiredAppliances: [dryer, kettle],
    budget: 85,
    survivalTime: 15,
  },
] as const;
