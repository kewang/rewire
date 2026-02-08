import type { Level } from '../types/game';
import { DEFAULT_APPLIANCES, DEFAULT_BREAKER } from './constants';

const [hairDryer, kettle, microwave, underSinkHeater, dryer, waterHeater, ihStove, , , fridge] = DEFAULT_APPLIANCES;

/** 關卡定義（L01-L05 單迴路, L06-L09 多迴路） */
export const LEVELS: readonly Level[] = [
  {
    name: 'L01 基礎教學',
    description: '接上吹風機並成功送電。理解 P ÷ V = I。',
    requiredAppliances: [hairDryer],
    budget: 50,
    survivalTime: 5,
    circuitConfigs: [
      { id: 'c1', label: '主迴路', voltage: 110, breaker: DEFAULT_BREAKER, availableAppliances: [hairDryer] },
    ],
  },
  {
    name: 'L02 燒線陷阱',
    description: '同時使用吹風機和快煮壺。小心選線！',
    requiredAppliances: [hairDryer, kettle],
    budget: 120,
    survivalTime: 5,
    circuitConfigs: [
      { id: 'c1', label: '主迴路', voltage: 110, breaker: DEFAULT_BREAKER, availableAppliances: [hairDryer, kettle] },
    ],
  },
  {
    name: 'L03 成本取捨',
    description: '同樣的電器，但預算收緊。不能無腦選最粗線。',
    requiredAppliances: [hairDryer, kettle],
    budget: 55,
    survivalTime: 5,
    circuitConfigs: [
      { id: 'c1', label: '主迴路', voltage: 110, breaker: DEFAULT_BREAKER, availableAppliances: [hairDryer, kettle] },
    ],
  },
  {
    name: 'L04 低功率陷阱',
    description: '廚下加熱器才 800W，看起來很無害？加上快煮壺撐 8 秒試試。',
    requiredAppliances: [underSinkHeater, kettle],
    budget: 85,
    survivalTime: 8,
    circuitConfigs: [
      { id: 'c1', label: '主迴路', voltage: 110, breaker: DEFAULT_BREAKER, availableAppliances: [underSinkHeater, kettle] },
    ],
  },
  {
    name: 'L05 長時間耐久',
    description: '烘衣機 + 快煮壺，合計 23.6A。2.0mm² 撐得過 15 秒嗎？',
    requiredAppliances: [dryer, kettle],
    budget: 85,
    survivalTime: 15,
    circuitConfigs: [
      { id: 'c1', label: '主迴路', voltage: 110, breaker: DEFAULT_BREAKER, availableAppliances: [dryer, kettle] },
    ],
  },
  {
    name: 'L06 雙迴路入門',
    description: '廚房和客廳各有一條迴路。第一次體驗分迴路策略！',
    requiredAppliances: [kettle, microwave, hairDryer],
    budget: 120,
    survivalTime: 8,
    circuitConfigs: [
      { id: 'c1', label: '廚房', voltage: 110, breaker: DEFAULT_BREAKER, availableAppliances: [kettle, microwave] },
      { id: 'c2', label: '客廳', voltage: 110, breaker: DEFAULT_BREAKER, availableAppliances: [hairDryer] },
    ],
  },
  {
    name: 'L07 預算壓力',
    description: '三條迴路但預算吃緊。最安全的線材買不起，你敢冒險嗎？',
    requiredAppliances: [kettle, underSinkHeater, hairDryer, dryer],
    budget: 130,
    survivalTime: 10,
    circuitConfigs: [
      { id: 'c1', label: '廚房', voltage: 110, breaker: DEFAULT_BREAKER, availableAppliances: [kettle, underSinkHeater] },
      { id: 'c2', label: '臥室', voltage: 110, breaker: DEFAULT_BREAKER, availableAppliances: [hairDryer] },
      { id: 'c3', label: '洗衣間', voltage: 110, breaker: DEFAULT_BREAKER, availableAppliances: [dryer] },
    ],
  },
  {
    name: 'L08 負載均衡',
    description: '五台電器、三條迴路。220V 專用迴路登場！合理分配比選粗線更重要。',
    requiredAppliances: [kettle, microwave, underSinkHeater, hairDryer, dryer],
    budget: 180,
    survivalTime: 15,
    circuitConfigs: [
      { id: 'c1', label: '廚房A', voltage: 110, breaker: DEFAULT_BREAKER, availableAppliances: [kettle, microwave, underSinkHeater, hairDryer] },
      { id: 'c2', label: '廚房B', voltage: 110, breaker: DEFAULT_BREAKER, availableAppliances: [kettle, microwave, underSinkHeater, hairDryer] },
      { id: 'c3', label: '洗衣間', voltage: 220, breaker: DEFAULT_BREAKER, availableAppliances: [dryer] },
    ],
  },
  {
    name: 'L09 220V 的陷阱',
    description: '電熱水器 4400W 看起來是 220V 很安全？算算電流再說。',
    requiredAppliances: [kettle, underSinkHeater, waterHeater, dryer],
    budget: 130,
    survivalTime: 10,
    circuitConfigs: [
      { id: 'c1', label: '廚房', voltage: 110, breaker: DEFAULT_BREAKER, availableAppliances: [kettle, underSinkHeater] },
      { id: 'c2', label: '浴室', voltage: 220, breaker: DEFAULT_BREAKER, availableAppliances: [waterHeater] },
      { id: 'c3', label: '洗衣間', voltage: 220, breaker: DEFAULT_BREAKER, availableAppliances: [dryer] },
    ],
  },
  {
    name: 'L10 新電器暖身',
    description: 'IH 爐需要 220V 專用迴路。冰箱和微波爐走廚房 110V。認識新電器！',
    requiredAppliances: [ihStove, fridge, microwave],
    budget: 150,
    survivalTime: 10,
    circuitConfigs: [
      { id: 'c1', label: '廚房', voltage: 110, breaker: DEFAULT_BREAKER, availableAppliances: [fridge, microwave] },
      { id: 'c2', label: 'IH 爐', voltage: 220, breaker: DEFAULT_BREAKER, availableAppliances: [ihStove] },
    ],
  },
] as const;
