export interface ColumnConfig {
  column: Column;
  visible: boolean;
  frozen: boolean;
  displayName: string;
  index: number;
  style: ColumnStyle;
  name?: string;
}

export interface Column {
  type: string;
  default: any;
}

export interface ColumnStyle {
  fontColor: string;
  fontSize: number;
  backgroundColor: string;
  alignment: string;
  textWrap: boolean;
  minColumnWidth: number;
}
