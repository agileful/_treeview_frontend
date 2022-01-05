import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {TreeGridModule, SortService, FilterService, TreeGridAllModule} from '@syncfusion/ej2-angular-treegrid';
import {ContextMenuModule} from '@syncfusion/ej2-angular-navigations';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import {DropDownListModule, MultiSelectAllModule} from '@syncfusion/ej2-angular-dropdowns';
import {ColorPickerModule} from '@syncfusion/ej2-angular-inputs';
import { CheckBoxModule, ButtonAllModule } from '@syncfusion/ej2-angular-buttons';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpService} from './http.service';
import {HttpClientModule} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    TreeGridModule,
    TreeGridAllModule,
    MultiSelectAllModule,
    ContextMenuModule,
    DialogModule,
    DropDownListModule,
    ColorPickerModule,
    CheckBoxModule,
    ButtonAllModule,
    DatePickerModule
  ],
  providers: [SortService, FilterService, HttpService],
  bootstrap: [AppComponent]
})
export class AppModule { }
