export type GoatStatus = 'ALIVE' | 'SOLD' | 'DEAD' | 'SLAUGHTERED';
export type GoatGender = 'MALE' | 'FEMALE';
export type GoatLabel = 'BUON' | 'GIONG';
export type LogAction = 'CREATE' | 'UPDATE_WEIGHT' | 'SELL' | 'DEAD' | 'SLAUGHTER';

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
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GoatLog {
  id: string;
  goatId: string;
  action: LogAction;
  weight: number | null;
  price: number | null;
  note: string | null;
  createdAt: string;
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
};
