import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {SortSettingsModel, FilterSettingsModel, TreeGridComponent} from '@syncfusion/ej2-angular-treegrid';
import {ContextMenuComponent, MenuEventArgs, MenuItemModel, BeforeOpenCloseMenuEventArgs} from '@syncfusion/ej2-angular-navigations';
import {DialogComponent} from '@syncfusion/ej2-angular-popups';
import {createCheckBox} from '@syncfusion/ej2-buttons';
import {closest, createElement} from '@syncfusion/ej2-base';
import {ActionEventArgs} from '@syncfusion/ej2-grids';
import {HttpService} from './http.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  format = 'yyyy-MM-dd';
  public date: any = new Date();
  columnsConfig: any = {};
  allowMultiSorting = false;
  allowMultiSelectRow = false;
  allowSelection = true;
  sortSettings: SortSettingsModel = {
    columns: []
  };
  public headerMenuItems: MenuItemModel[];
  public rowMenuItems: MenuItemModel[];
  @ViewChild('grid') public grid: TreeGridComponent;
  @ViewChild('headerContextmenu')
  public headerContextmenu: ContextMenuComponent;
  @ViewChild('rowContextmenu')
  public rowContextmenu: ContextMenuComponent;
  public data: any[] = [];
  filterSettings: any;
  @ViewChild('ejDialog') addEditColDialog: DialogComponent;
  @ViewChild('chooseColDialog') chooseColDialog: DialogComponent;
  @ViewChild('colDeleteConfirmation') colDeleteConfirmation: DialogComponent;
  @ViewChild('rowDeleteConfirmation') rowDeleteConfirmation: DialogComponent;
  @ViewChild('editRowDialog') editRowDialog: DialogComponent;
  // Create element reference for dialog target element.
  @ViewChild('container', {read: ElementRef, static: true}) container: ElementRef;
  // The Dialog shows within the target element.
  public targetElement: HTMLElement;
  addEditColButtons: any;
  editRowDialogButtons: any;
  dataTypeSource: string[] = ['Text', 'Num', 'Date', 'Boolean', 'DropDownList'];
  alignmentSource: string[] = ['left', 'right'];
  headerDialogAddEditName = 'Create New Column';
  selectedColumnId;
  selectedRowIndex;
  selectedRowData;
  selectedRowDataToCopyOrCut;
  treeData: any = [];
  tableColumns: string[] = [];
  selectionSetting = {type: 'Single'};
  rowDrop: any;
  copyActive = false;
  cutActive = false;
  parentId = null;
  colDeleteConfirmationButtons;
  rowDeleteConfirmationButtons;
  addOrEditColStatus;
  columnConfigObj = {
    name: '',
    type: 'Text',
    options: [],
    default: '',
    style: {
      fontSize: 0,
      fontColor: '#222',
      backgroundColor: '#fff',
      alignment: 'left',
      minColumnWidth: 0,
      width: 100,
      textWrap: true
    },
    displayName: '',
  };
  editRowBody: any = {};

  constructor(private httpService: HttpService) {

  }

  ngOnInit(): void {
    this.getColumnConfigs();
    this.getTableData();
    this.headerMenuItems = [
      {text: 'Edit Column'},
      {text: 'New Column'},
      {text: 'Delete Column'},
      {text: 'Choose Column'},
      {text: 'Freeze Column'},
      {text: 'Filter Column'},
      {text: 'Multi Sort'}
    ];
    this.rowMenuItems = [
      {text: 'Add Next'},
      {text: 'Add Child'},
      {text: 'Delete Row'},
      {text: 'Edit Row'},
      {text: 'Copy Rows'},
      {text: 'Cut Rows'},
      {text: 'Paste Next'},
      {text: 'Paste Child'},
      {text: 'Multi Select Rows'}
    ];
    this.filterSettings = {type: 'FilterBar', hierarchyMode: 'Parent', mode: 'Immediate'};
    this.addEditColButtons = [
      {
        click: this.onSaveColumnData.bind(this),
        buttonModel: {
          content: 'Save',
          isPrimary: true
        }
      },
      {
        click: this.hideDialog.bind(this),
        buttonModel: {
          content: 'Cancel'
        }
      }
    ];
    this.editRowDialogButtons = [
      {
        click: this.onSaveRowData.bind(this),
        buttonModel: {
          content: 'Save',
          isPrimary: true
        }
      },
      {
        click: this.hideDialog.bind(this),
        buttonModel: {
          content: 'Cancel'
        }
      }
    ];
    this.colDeleteConfirmationButtons = [
      {
        click: this.deleteColumn.bind(this),
        buttonModel: {
          content: 'Delete',
          isPrimary: true
        }
      },
      {
        click: this.hideColDeleteConfirmationDialog.bind(this),
        buttonModel: {
          content: 'Cancel'
        }
      }
    ];
    this.rowDeleteConfirmationButtons = [
      {
        click: this.deleteRow.bind(this),
        buttonModel: {
          content: 'Delete',
          isPrimary: true
        }
      },
      {
        click: this.hideRowDeleteConfirmationDialog.bind(this),
        buttonModel: {
          content: 'Cancel'
        }
      }
    ];
  }

  setDataType(event): void {
    this.columnConfigObj.type = event.itemData.value;
  }

  setAlignment(event): void {
    this.columnConfigObj.style[0].alignment = event.itemData.value;
  }

  setTextWrap(event): void {
    this.columnConfigObj.style[0].textWrap = event.checked;
  }

  getColumnConfigs(): void {
    this.httpService.get('schema').subscribe(res => {
      if (res.success) {
        this.columnsConfig = res.data;
        this.setTableColumns();
        this.grid.refreshColumns(true);
        this.grid.refresh();
      }
    });
  }

  setTableColumns(): void {
    const tempTableColumns = [];
    const tempSortSettingsCols = [];
    for (const col in this.columnsConfig) {
      tempTableColumns.push(col);
      tempSortSettingsCols.push({field: col, direction: 'Ascending'});
    }
    this.sortSettings.columns = [...tempSortSettingsCols];
    this.tableColumns = [...tempTableColumns];
  }

  getTableData(): void {
    this.httpService.get('').subscribe(res => {
      if (res.success) {
        this.data = res.data;
        this.createTree(this.data);
      }
    });
  }

  createTree(array: any): void {
    const tempTree = [];
    for (const item of array) {
      if (!item.parent) {
        tempTree.push(item);
      } else {
        this.addChildToTree(item, tempTree);
      }
    }
    this.treeData = [...tempTree];
    this.grid.dataSource = tempTree;
    this.grid.refresh();
    this.grid.refreshColumns(true);
  }

  addChildToTree(item, tree): void {
    for (const node of tree) {
      if (item.parent === node.rowId) {
        node.children.push(item);
        return;
      } else if (node.children) {
        this.addChildToTree(item, node.children);
      }
    }
  }

  prepareColDataForEdit(): void {
    this.columnConfigObj = {
      name: this.columnsConfig[this.selectedColumnId].displayName,
      type: this.columnsConfig[this.selectedColumnId].column.type,
      options: this.columnsConfig[this.selectedColumnId].column.options,
      default: this.columnsConfig[this.selectedColumnId].column.default,
      style: {
        fontSize: this.columnsConfig[this.selectedColumnId].style.fontSize,
        fontColor: this.columnsConfig[this.selectedColumnId].style.fontColor,
        backgroundColor: this.columnsConfig[this.selectedColumnId].style.backgroundColor,
        alignment: this.columnsConfig[this.selectedColumnId].style.alignment,
        minColumnWidth: this.columnsConfig[this.selectedColumnId].style.minColumnWidth,
        width: this.columnsConfig[this.selectedColumnId].style.width,
        textWrap: this.columnsConfig[this.selectedColumnId].style.textWrap
      },
      displayName: this.columnsConfig[this.selectedColumnId].displayName
    };
  }

  createNewEmptyRow(): any {
    const emptyRow = {};
    for (const col in this.columnsConfig) {
      emptyRow[col] = this.setDefaultValuePerType(this.columnsConfig[col].column.type, col);
    }
    return emptyRow;
  }

  setDefaultValuePerType(type, col): any {
    switch (type) {
      case 'Text':
        return '';
      case 'Num':
        return 0;
      case 'Date':
        return col ? this.columnsConfig[col].column.default : new Date().toISOString();
      case  'Boolean':
        return true;
      case 'DropDownList':
        return col ? this.columnsConfig[col].column.default : '';
    }
  }


  hideDialog(): void {
    this.addEditColDialog.hide();
  }

  onOpenAddEditDialog(): void {
    this.addEditColDialog.show();
  }


  beforeOpenHeaderMenu(): void {

  }

  selectHeaderMenuItem(event): void {
    switch (event.item.properties.text) {
      case 'Edit Column':
        this.headerDialogAddEditName = 'Edit Column';
        this.addOrEditColStatus = 'edit';
        this.prepareColDataForEdit();
        this.onOpenAddEditDialog();
        break;
      case 'New Column' :
        this.addOrEditColStatus = 'add';
        this.headerDialogAddEditName = 'Add New Column';
        this.onOpenAddEditDialog();
        break;
      case 'Delete Column':
        this.openDeleteConfirmationDialog();
        break;
      case 'Choose Column' :
        this.chooseColumn();
        break;
      case 'Freeze Column' :
        this.freezeColumn(event);
        break;
      case 'Filter Column' :
        this.filterColumn();
        break;
      case  'Multi Sort':
        this.multiSortColumn();
        break;
    }
  }

  openDeleteConfirmationDialog(): void {
    this.colDeleteConfirmation.show();
  }

  hideColDeleteConfirmationDialog(): void {
    this.colDeleteConfirmation.hide();
  }


  deleteColumn(): void {
    this.hideColDeleteConfirmationDialog();
    this.httpService.delete(`columns/${this.selectedColumnId}`).subscribe(res => {
      if (res.success) {
        this.getTableData();
        this.getColumnConfigs();
      }
    });
  }

  onSaveColumnData(): void {
    this.hideDialog();
    if (this.addOrEditColStatus === 'add') {
      this.columnConfigObj.default = this.setDefaultValuePerType(this.columnConfigObj.type, null);
      this.columnConfigObj.name = this.columnConfigObj.displayName.toLowerCase().replace(' ', '_');
      this.httpService.post('columns', this.columnConfigObj).subscribe(res => {
        this.getTableData();
        this.columnsConfig = res.data;
        this.grid.columns = res.data;
        this.setTableColumns();
      });
    }
    if (this.addOrEditColStatus === 'edit') {
      delete this.columnConfigObj.name;
      if (this.columnConfigObj.type === this.columnsConfig[this.selectedColumnId].column.type) {
        delete this.columnConfigObj.type;
      }
      this.httpService.put(`columns/${this.selectedColumnId}`, this.columnConfigObj).subscribe(res => {
        this.getTableData();
        this.getColumnConfigs();
      });
    }
  }

  chooseColumn(): void {
    this.chooseColDialog.show();
  }

  changeColVisibility(event, col): void {
    this.columnsConfig[col].visible = event.checked;
    this.httpService.get(`columns/${col}/toggle-visibility`).subscribe(res => {
      this.grid.refreshColumns(true);
    });
  }

  freezeColumn(event): void {
    this.columnsConfig[this.selectedColumnId].frozen = event.checked;
    this.httpService.get(`columns/${this.selectedColumnId}/toggle-frozen`).subscribe(res => {
      this.grid.refreshColumns(true);
    });
  }

  filterColumn(): void {

  }

  multiSortColumn(): void {
    this.allowMultiSorting = true;
  }

  selectRowMenuItem(event): void {
    switch (event.item.properties.text) {
      case 'Add Next':
        this.addNext();
        break;
      case 'Add Child' :
        this.addChild();
        break;
      case 'Delete Row':
        this.rowDeleteConfirmation.show();
        break;
      case 'Edit Row' :
        this.editRow();
        break;
      case 'Copy Rows' :
        this.copyRows();
        break;
      case  'Cut Rows':
        this.cutRows();
        break;
      case  'Paste Next':
        this.pasteNext();
        break;
      case  'Paste Child':
        this.pasteChild();
        break;
      case 'Multi Select Rows' :
        this.multiSelectRows();
        break;
    }
  }

  showEditRowDialog(): void {
    this.editRowDialog.show();
  }

  hideEditRowDialog(): void {
    this.editRowDialog.hide();
  }


  itemRenderHeaderMenu(args: MenuEventArgs): void {
    if (args.item.text === 'Freeze Column' ||
      args.item.text === 'Filter Column' ||
      args.item.text === 'Multi Sort') {
      const check: Element = createCheckBox(createElement, false, {
        label: args.item.text,
        checked: (args.item.text === 'Freeze Column' && this.columnsConfig[this.selectedColumnId]?.frozen) ? true : false
      });
      args.element.innerHTML = '';
      args.element.appendChild(check);
    }
  }

  itemRenderRowMenu(args: MenuEventArgs): void {
    if (args.item.text === 'Multi Select Rows') {
      const check: Element = createCheckBox(createElement, false, {
        label: args.item.text
      });
      args.element.innerHTML = '';
      args.element.appendChild(check);
    }
  }

  beforeClose(args: BeforeOpenCloseMenuEventArgs): void {
    if ((args.event.target as Element).closest('.e-menu-item')) {
      const selectedElem: NodeList = args.element.querySelectorAll('.e-selected');
      // @ts-ignore
      for (const el of selectedElem) {
        const ele: Element = el as Element;
        ele.classList.remove('e-selected');
      }
      const checkbox: HTMLElement = closest(args.event.target as Element, '.e-checkbox-wrapper') as HTMLElement;
      if (checkbox) {
        args.cancel = true;
        const frame: HTMLElement = checkbox.querySelector('.e-frame');
        if (checkbox && frame.classList.contains('e-check')) {
          frame.classList.remove('e-check');
        } else if (checkbox) {
          frame.classList.add('e-check');
        }
      }

    }
  }

  setSelectedColumn(event): void {
    if (event.target.innerText) {
      for (const col in this.columnsConfig) {
        if (this.columnsConfig[col].displayName === event.target.innerText) {
          this.selectedColumnId = col;
        }
      }
    }
  }


  setSelectedRow(event): void {
    this.selectedRowIndex = event.rowIndex;
    this.selectedRowData = event.data;
  }

  deselectRow(event): void {
    this.selectedRowIndex = null;
    this.selectedRowData = null;
  }

  addNext(): void {
    if (this.selectedRowIndex >= 0) {
      const newRow: any = this.createNewEmptyRow();
      this.httpService.post(`add-row/${this.selectedRowIndex + 1}/`, newRow).subscribe(res => {
        if (res.success) {
          this.treeData.splice(this.selectedRowIndex + 1, 0, newRow);
          this.grid.refresh();
          this.selectedRowIndex = null;
          this.selectedRowData = null;
        }
      });
    }
  }

  addChild(): void {
    if (this.selectedRowIndex >= 0) {
      const newRow: any = this.createNewEmptyRow();
      this.httpService.post(`add-row/${this.selectedRowIndex + 1}/${this.treeData[this.selectedRowIndex]?.rowId}`, newRow)
        .subscribe(res => {
          if (res.success) {
            this.treeData[this.selectedRowIndex].children.push(this.createNewEmptyRow());
            this.grid.refresh();
            this.selectedRowIndex = null;
          }
        });
    }
  }

  removeByKey(arr, rowId): any {
    return arr.filter(a => a.rowId !== rowId).map(e => {
      return {...e, children: this.removeByKey(e.children || [], rowId)};
    });
  }

  deleteRow(): void {
    this.hideRowDeleteConfirmationDialog();
    if (this.selectedRowIndex >= 0) {
      this.deleteRowWithChildren(this.selectedRowData);
      (this.grid as TreeGridComponent).dataSource = this.removeByKey(this.treeData, this.selectedRowData.rowId);
      this.selectedRowIndex = null;
    }
  }

  hideRowDeleteConfirmationDialog(): void {
    this.rowDeleteConfirmation.hide();
  }

  deleteRowWithChildren(deleteItem): void {
    this.httpService.delete(`rows/${deleteItem.rowId}`).subscribe(res => {
    });
    this.deleteFromBaseData(deleteItem.rowId);
    if (deleteItem.children.length === 0) {
      return;
    } else {
      for (const node of deleteItem.children) {
        this.deleteRowWithChildren(node);
      }
    }
  }

  deleteFromBaseData(rowId): void {
    const rowIndex = this.data.findIndex(item => item.rowId === rowId);
    if (rowIndex > 0) {
      this.data.splice(rowIndex, 1);
    }
  }

  editRow(): void {
    this.prepareRowDataForEdit();
    this.showEditRowDialog();
  }

  prepareRowDataForEdit(): void {
    this.editRowBody = {...this.selectedRowData};
  }

  onSaveRowData(): void {
    this.hideEditRowDialog();
    this.httpService.put(`rows/${this.editRowBody.rowId}`, this.editRowBody).subscribe(res => {
      this.getTableData();
    });
  }

  multiSelectRows(): void {
    this.allowMultiSelectRow = !this.allowMultiSelectRow;
    this.grid.selectionSettings.type = this.allowMultiSelectRow ? 'Multiple' : 'Single';
  }

  copyRows(): void {
    this.copyActive = true;
    this.selectedRowDataToCopyOrCut = {...this.selectedRowData};
  }

  cutRows(): void {
    this.cutActive = true;
    this.selectedRowDataToCopyOrCut = {...this.selectedRowData};
  }

  pasteNext(): void {
    if (this.selectedRowIndex >= 0) {
      const parentId = this.selectedRowData?.parentItem ? this.selectedRowData?.parentItem.rowId : this.parentId;
      this.addByChildren(this.selectedRowDataToCopyOrCut, this.selectedRowIndex, parentId);
    }
    if (this.cutActive) {
      this.deleteRowWithChildren(this.selectedRowDataToCopyOrCut);
    }
  }

  pasteChild(): void {
    if (this.selectedRowIndex >= 0) {
      this.addByChildren(this.selectedRowDataToCopyOrCut, this.selectedRowIndex, this.selectedRowDataToCopyOrCut.rowId);
    }
    if (this.cutActive) {
      this.deleteRowWithChildren(this.selectedRowDataToCopyOrCut);
    }
  }

  addByChildren(addItem, index, parentId): void {
    const newRow = {};
    for (const col in this.columnsConfig) {
      newRow[col] = addItem[col];
    }

    this.httpService.post(`add-row/${++index}/${parentId ? parentId : ''}`, newRow).subscribe(res => {
      if (res.success) {
        if (addItem.children.length > 0) {
          for (const child of addItem.children) {
            this.addByChildren(child, index, res.data);
          }
        } else {
          this.getTableData();
        }
      }
    });
  }

  resizeStop(event): void {
  }

  actionComplete(args: ActionEventArgs): void {
    if (args.requestType === 'reorder') {

    }
    if (args.requestType === 'sorting') {
      for (const columns of this.grid.getColumns()) {
        for (const sortColumns of this.grid.sortSettings.columns) {
          if (this.allowMultiSorting) {
            this.grid.sortByColumn(sortColumns.field, 'Ascending', true);
          }
        }
      }
    }
  }
}
