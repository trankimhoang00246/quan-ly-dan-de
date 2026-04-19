export type GoatStatus = 'ALIVE' | 'SOLD' | 'DEAD' | 'SLAUGHTERED';
export type GoatGender = 'MALE' | 'FEMALE';
export type GoatLabel = 'BUON' | 'GIONG';
export type LogAction = 'CREATE' | 'UPDATE_WEIGHT' | 'SELL' | 'DEAD' | 'SLAUGHTER' | 'CHICH_THUOC';
export type GoatTag = 'DEP' | 'XAU';

export interface Goat {
  id: string;
  code: string;
  gender: GoatGender;
  label: GoatLabel;
  currentWeight: number | null;
  capital: number;
  fatherId: string | null;
  fatherCode: string | null;
  motherId: string | null;
  motherCode: string | null;
  status: GoatStatus;
  tag: GoatTag | null;
  note: string | null;
  date: string | null;      // ngày thực tế (nhập/sinh), dùng cho thống kê
  createdAt: string;
  updatedAt: string;
}

export interface GoatLog {
  id: string;
  goatId: string;
  action: LogAction;
  weight: number | null;
  price: number | null;
  medicine: string | null;
  nextDueDate: string | null;
  note: string | null;
  date: string | null;      // ngày thực tế của hành động, dùng cho thống kê
  createdAt: string;
}

export interface VaccineDueItem {
  goatId: string;
  goatCode: string;
  medicine: string;
  nextDueDate: string;
  daysLeft: number;
}

export const GENDER_LABEL: Record<GoatGender, string> = {
  MALE: 'Đực',
  FEMALE: 'Cái',
};

export const LABEL_LABEL: Record<GoatLabel, string> = {
  BUON: 'Buôn',
  GIONG: 'Giống',
};

export const STATUS_LABEL: Record<GoatStatus, string> = {
  ALIVE: 'Đang sống',
  SOLD: 'Đã bán',
  DEAD: 'Đã chết',
  SLAUGHTERED: 'Đã làm thịt',
};

export const STATUS_COLOR: Record<GoatStatus, string> = {
  ALIVE: '#16a34a',
  SOLD: '#2563eb',
  DEAD: '#6b7280',
  SLAUGHTERED: '#ea580c',
};

export const ACTION_LABEL: Record<LogAction, string> = {
  CREATE: 'Tạo mới',
  UPDATE_WEIGHT: 'Cập nhật cân',
  SELL: 'Bán dê',
  DEAD: 'Dê chết',
  SLAUGHTER: 'Làm thịt',
  CHICH_THUOC: 'Chích thuốc',
};

export const TAG_LABEL: Record<GoatTag, string> = {
  DEP: 'Đẹp',
  XAU: 'Xấu',
};

export const TAG_COLOR: Record<GoatTag, string> = {
  DEP: '#16a34a',
  XAU: '#dc2626',
};

export type TransactionType = 'EXPENSE' | 'REVENUE';

export interface FarmTransaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  note: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalGoats: number;
  aliveCount: number;
  soldCount: number;
  deadCount: number;
  slaughteredCount: number;
  maleAlive: number;
  femaleAlive: number;
  buonAlive: number;
  giongAlive: number;
  totalCapital: number;
  totalRevenue: number;
  avgWeightAlive: number;
  otherExpenses: number;
  otherRevenue: number;
}

export const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  EXPENSE: 'Chi phí',
  REVENUE: 'Doanh thu khác',
};

export const TRANSACTION_TYPE_COLOR: Record<TransactionType, string> = {
  EXPENSE: '#dc2626',
  REVENUE: '#16a34a',
};
