/*
 * Copyright 2016-2017 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Author - Sagar Jadhav
 *
 */

/*
 Component Name : Amexio candlestick waterfall chart
 Component Selector : <amexio-chart-candlestick-waterfall>
 Component Description : A candlestick waterfall chart is used to show an opening and closing
 value overlaid on top of a total variance. Candlestick charts are often used to show stock value behavior.
*/
import {AfterContentInit, Component, ContentChildren, ElementRef, Input, OnInit, QueryList, ViewChild} from '@angular/core';
import {ChartAreaComponent} from '../chartarea/chart.area.component';
import {ChartTitleComponent} from '../charttitle/chart.title.component';
import {HorizontalAxisComponent} from '../horizontalaxis/chart.horizontalaxis.component';
import {VerticalAxisComponent} from '../verticalaxis/chart.verticalaxis.component';

import {ChartLoaderService} from '../chart.loader.service';

declare var google: any;
@Component({
  selector: 'amexio-chart-candlestick-waterfall', template: `
    <div *ngIf="showChart" #candlestickwaterfall
         [style.width]="width"
         [style.height]="height" (window:resize)="onResize($event)">
      <div *ngIf="!hasLoaded" class="lmask">
      </div>
    </div>
  `, styles: [`.lmask {
    position: absolute;
    height: 100%;
    width: 100%;
    background-color: #000;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
    z-index: 9999;
    opacity: 0.4;
  }

  .lmask.fixed {
    position: fixed;
  }

  .lmask:before {
    content: '';
    background-color: transparent;
    border: 5px solid rgba(0, 183, 229, 0.9);
    opacity: .9;
    border-right: 5px solid transparent;
    border-left: 5px solid transparent;
    border-radius: 50px;
    box-shadow: 0 0 35px #2187e7;
    width: 50px;
    height: 50px;
    -moz-animation: spinPulse 1s infinite ease-in-out;
    -webkit-animation: spinPulse 1s infinite linear;
    margin: -25px 0 0 -25px;
    position: absolute;
    top: 50%;
    left: 50%;
  }

  .lmask:after {
    content: '';
    background-color: transparent;
    border: 5px solid rgba(0, 183, 229, 0.9);
    opacity: .9;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-radius: 50px;
    box-shadow: 0 0 15px #2187e7;
    width: 30px;
    height: 30px;
    -moz-animation: spinoffPulse 1s infinite linear;
    -webkit-animation: spinoffPulse 1s infinite linear;
    margin: -15px 0 0 -15px;
    position: absolute;
    top: 50%;
    left: 50%;
  }

  @-moz-keyframes spinPulse {
    0% {
      -moz-transform: rotate(160deg);
      opacity: 0;
      box-shadow: 0 0 1px #2187e7;
    }
    50% {
      -moz-transform: rotate(145deg);
      opacity: 1;
    }
    100% {
      -moz-transform: rotate(-320deg);
      opacity: 0;
    }
  }

  @-moz-keyframes spinoffPulse {
    0% {
      -moz-transform: rotate(0deg);
    }
    100% {
      -moz-transform: rotate(360deg);
    }
  }

  @-webkit-keyframes spinPulse {
    0% {
      -webkit-transform: rotate(160deg);
      opacity: 0;
      box-shadow: 0 0 1px #2187e7;
    }
    50% {
      -webkit-transform: rotate(145deg);
      opacity: 1;
    }
    100% {
      -webkit-transform: rotate(-320deg);
      opacity: 0;
    }
  }

  @-webkit-keyframes spinoffPulse {
    0% {
      -webkit-transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
    }
  }

  ` ],
})

export class CandlestickWaterfallChartComponent implements AfterContentInit, OnInit {

  private options: any;
  private candlestickData: any;
  private chart: any;

  id: any;

  /*
Properties
name : width
datatype : any
version : 4.0 onwards
default : none
description : width of chart
*/
  @Input() width: string;

  /*
Properties
name : height
datatype : string
version : 4.0 onwards
default : none
description : height of chart
*/
  @Input() height: string;

  showChart: boolean;
  _data: any;

  get data(): any {
    return this._data;
  }

  /*
Properties
name : data
datatype : any
version : 4.0 onwards
default : none
description : Local data for AreaChart
*/
  @Input('data')
  set data(data: any) {
    if (data) {
      this._data = data;
      this.showChart = true;
    } else {
      this.showChart = false;
    }
  }

  /*
Properties
name : background-color
datatype : string
version : 4.0 onwards
default : none
description : sets background color
*/
  @Input('background-color') backgroundcolor: string;

  /*
Properties
name : bar-width
datatype : string
version : 4.0 onwards
default : none
description : To remove the space between the bars.
*/
  @Input('bar-width') barwidth: string;

  /*
Properties
name : falling-color
datatype : string
version : 4.0 onwards
default : none
description : The fill color of falling candles, as an HTML color string.Example:'#FF0000' or 'red'
*/
  @Input('falling-color') fallingcolor: string;

  /*
Properties
name : rising-color
datatype : string
version : 4.0 onwards
default : none
description : The fill color of rising candles, as an HTML color string.Example:'#0f9d58' or 'green'
*/
  @Input('rising-color') risingcolor: string;

  hasLoaded: boolean;

  @ContentChildren(ChartAreaComponent) chartAreaComp: QueryList<ChartAreaComponent>;

  @ContentChildren(ChartTitleComponent) chartTitleComp: QueryList<ChartTitleComponent>;

  @ContentChildren(HorizontalAxisComponent) horizontalComp: QueryList<HorizontalAxisComponent>;

  horizontalArray: HorizontalAxisComponent[];

  horizontalComponent: HorizontalAxisComponent;

  @ContentChildren(VerticalAxisComponent) verticalComp: QueryList<VerticalAxisComponent>;

  verticalArray: HorizontalAxisComponent[];

  verticalComponent: HorizontalAxisComponent;

  chartAreaArray: ChartAreaComponent[];

  chartAreaComponent: ChartAreaComponent;

  chartTitleArray: ChartTitleComponent[];

  chartTitleComponent: ChartTitleComponent;

  @ViewChild('candlestickwaterfall') private candlestickwaterfall: ElementRef;

  constructor(private loader: ChartLoaderService) {
    this.width = '100%';
  }

  drawChart() {
    if (this.showChart) {
      this.candlestickData = google.visualization.arrayToDataTable(this._data, true);
      this.options = {
        title: this.chartTitleComponent ? this.chartTitleComponent.title : null,
        titleTextStyle: this.chartTitleComponent ? {
          color: this.chartTitleComponent.color ? this.chartTitleComponent.color : null,
          fontName: this.chartTitleComponent.fontname ? this.chartTitleComponent.fontname : null,
          fontsize: this.chartTitleComponent.fontsize ? this.chartTitleComponent.fontsize : null,
          bold: this.chartTitleComponent.bold ? this.chartTitleComponent.bold : null,
          italic: this.chartTitleComponent.italic ? this.chartTitleComponent.italic : null,
        } : null,
        backgroundcolor: this.backgroundcolor,
        legend: 'none',
        chartArea: this.chartAreaComponent ? {
          backgroundcolor: this.chartAreaComponent.chartbackgroundcolor ? this.chartAreaComponent.chartbackgroundcolor : null,
          left: this.chartAreaComponent.leftposition ? this.chartAreaComponent.leftposition : null,
          top: this.chartAreaComponent.topposition ? this.chartAreaComponent.topposition : null,
          height: this.chartAreaComponent.chartheight ? this.chartAreaComponent.chartheight : null,
          width: this.chartAreaComponent.chartwidth ? this.chartAreaComponent.chartwidth : null,
        } : null,
        vAxis: this.verticalComponent ? {
          title: this.verticalComponent.title ? this.verticalComponent.title : null,
          titleTextStyle: {color: this.verticalComponent.titlecolor ? this.verticalComponent.titlecolor : null},
        } : null,
        hAxis: this.horizontalComponent ? {
          title: this.horizontalComponent.title ? this.horizontalComponent.title : null,
          titleTextStyle: {color: this.horizontalComponent.titlecolor ? this.horizontalComponent.titlecolor : null},
        } : null,
        bar: {groupWidth: this.barwidth ? this.barwidth : null},
         // Remove space between bars.
        candlestick: {
          fallingColor: this.fallingcolor ? {strokeWidth: 0, fill: this.fallingcolor ? this.fallingcolor : null} : null, // red
          risingColor: this.risingcolor ? {strokeWidth: 0, fill: this.risingcolor ? this.risingcolor : null} : null,  // green
        },
      };
      if (this.candlestickData) {
        this.chart = new google.visualization.CandlestickChart(this.candlestickwaterfall.nativeElement);
        this.hasLoaded = true;
        this.chart.draw(this.candlestickData, this.options);
        google.visualization.events.addListener(this.chart, 'click', this.click);
      }

    }

  }

  click(e: any) {

  }

  // after content init for inner directive is run
  ngAfterContentInit(): void {
    this.chartAreaArray = this.chartAreaComp.toArray();
    this.horizontalArray = this.horizontalComp.toArray();
    this.verticalArray = this.verticalComp.toArray();
    this.chartTitleArray = this.chartTitleComp.toArray();

    // take first component
    if (this.chartTitleArray.length === 1) {
      this.chartTitleComponent = this.chartTitleArray.pop();
    }
    if (this.chartAreaArray.length === 1) {
      this.chartAreaComponent = this.chartAreaArray.pop();
    }
    if (this.horizontalArray.length === 1) {
      this.horizontalComponent = this.horizontalArray.pop();
    }
    if (this.verticalArray.length === 1) {
      this.verticalComponent = this.verticalArray.pop();
    }
  }

  ngOnInit(): void {
    this.hasLoaded = false;
    this.loader.loadCharts('CandlestickChart').subscribe((value) => console.log(), (errror) => console.error(errror), () => {
      this.drawChart();
    });
  }

  onResize(event: any) {
    this.drawChart();
  }
}
