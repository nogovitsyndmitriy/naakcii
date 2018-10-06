import {Injectable} from '@angular/core';
import {Chain, ChainLine} from '../chain/chain.model';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import {Cart} from "../cart/cart.model";
import {UndiscountService} from "./undiscount.service";

@Injectable()
export class PdfGeneratorService {
  constructor(public cart: Cart, private undiscountStorage: UndiscountService) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    pdfMake.width = '1400px';
  }

  generatePDF() {
    let data = this.cart.generateJsonListPDF(); //сформированный список по сетям
    const docDefinition = {};
    const docContent = [];
    const docStyle = {};
    const chainSum = [];
    let sumAfter = '';
    let benefit = '';
    const date = new Date().toLocaleString("ru", {day: '2-digit', month: '2-digit', year: '2-digit'});

    function numberFormater(number: number): string {
      return number.toString().replace('.', ',');
    }

    let totalSum = {};
    totalSum = data['totalSum'];
    sumAfter = numberFormater((totalSum['sumAfter']).toFixed(2)) + ' руб.';
    benefit = numberFormater((totalSum['discountSum']).toFixed(2)) + ' руб. (' + (totalSum['discountPersent']).toFixed(0) + ' %)';

    docContent.push({
      text: 'Список покупок ' + date,
      style: 'header'
    });

    for (let chain in data['ChainList']) {
      //заголовок текущей сети
      docContent.push({text: '', margin: [0, 25, 0, 0]}); //пустая строка
      let table = {}; //обрамление
      let bodyTable = {};
      let bodyBodyTable = [];
      let sum = 0;
      let widthParam = [];
      widthParam.push('100%');
      bodyTable['widths'] = widthParam;
      let tableLine = [];
      data['ChainList'][chain].map(item => {
        sum = Number(item['priceSum']) + sum;
      });
      tableLine.push({
        alignment: 'left',
        bold: true,
        fillColor: '#656565',
        color: 'white',
        fontSize: '38',
        columns: [{width: '70%', text: chain}, {
          width: '30%',
          text: 'Итого : ' + numberFormater(Number(sum.toFixed(2)))
        }]
      });
      chainSum.push(sum);
      bodyBodyTable.push(tableLine);
      bodyTable['body'] = bodyBodyTable;
      table['table'] = bodyTable;
      table['layout'] = 'noBorders';
      docContent.push(table);
      //--------------------------------------------------------------

      data['ChainList'][chain].map(item => {  //перебираем товарные позиции
        let itemColumnList = {}; //строка
        let columns = [];
        let itemNameComment = '';
        if (item['Comment'] == '') {
          itemNameComment = item['Name'];
        } else {
          itemNameComment = item['Name'] + '\n' + '(' + item['Comment'] + ')';
        }
        columns.push({width: '60%', text: itemNameComment, margin: [0, 15]});
        columns.push({width: '10%', text: '', margin: [0, 15]});
        columns.push({
          width: '10%',
          text: numberFormater(item['priceOne']),
          style: 'itemSumStyle',
          alignment: 'center',
          margin: [0, 15]
        });
        columns.push({
          width: '10%',
          text: '×' + item['amount'],
          style: 'itemSumStyle',
          alignment: 'center',
          margin: [0, 15]
        });
        columns.push({width: '10%', text: numberFormater(item['priceSum']), style: 'itemSumStyle', margin: [0, 15]});

        itemColumnList['columns'] = columns;
        itemColumnList['style'] = 'itemStyle';
        docContent.push(itemColumnList);
      });
    }
//--------------------------------------------------------------------------
    let table = {}; //обрамление
    let bodyTable = {};
    let bodyBodyTable = [];
    let sum = 0;
    let widthParam = [];
    widthParam.push('100%');
    bodyTable['widths'] = widthParam;
    let tableLine = [];
    tableLine.push({
      alignment: 'left',
      bold: true,
      fillColor: '#656565',
      color: 'white',
      fontSize: '38',
      columns: [{width: '70%', text: "Неакционные товары"}]
    });
    chainSum.push(sum);
    bodyBodyTable.push(tableLine);
    bodyTable['body'] = bodyBodyTable;
    table['table'] = bodyTable;
    table['layout'] = 'noBorders';
    if (this.undiscountStorage.getFromUndiscount()[0]) {
      docContent.push(table);
    }
//---------------------------------------------------------------------

    this.undiscountStorage.getFromUndiscount().map(item => {
      let itemColumnList = {}; //строка
      let columns = [];
      columns.push({
        width: '70%',
        text: item.text,
        style: 'itemSumStyle',
        alignment: 'left',
        margin: [0, 15]
      });

      itemColumnList['columns'] = columns;
      itemColumnList['style'] = 'itemStyle';
      if (this.undiscountStorage.getFromUndiscount()[0]) {
        docContent.push(itemColumnList);
      }
    });

    //итоговая сумма------------------------------
    let itemColumnList = {}; //строка
    let columns = [];

    columns.push({width: '70%', text: 'Общий итог :', bold: true, margin: [0, 30, 0, 10]});
    columns.push({width: '30%', text: sumAfter, bold: true, style: 'itemSumStyle', margin: [0, 30, 0, 10]});

    itemColumnList['columns'] = columns;
    itemColumnList['style'] = 'totalStyle';
    docContent.push(itemColumnList);
    //----------------------------------------

    //Ваша выгода-----------------------------------
    docContent.push({text: 'Экономия :    ' + benefit, bold: true, style: 'totalStyle', margin: [0, 20]});
    //-----------------------------------------------

    //Штампик----------------------------------------
    docContent.push({
      image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAR0AAAEYCAYAAABhpyLIAAAACXBIWXMAAAsTAAALEwEAmpwYAAA4JmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxMzggNzkuMTU5ODI0LCAyMDE2LzA5LzE0LTAxOjA5OjAxICAgICAgICAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgICAgICAgICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgICAgICAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgICAgICAgICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIj4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5BZG9iZSBQaG90b3Nob3AgQ0MgMjAxNyAoV2luZG93cyk8L3htcDpDcmVhdG9yVG9vbD4KICAgICAgICAgPHhtcDpDcmVhdGVEYXRlPjIwMTgtMDktMjBUMDA6MjQ6MTMrMDM6MDA8L3htcDpDcmVhdGVEYXRlPgogICAgICAgICA8eG1wOk1vZGlmeURhdGU+MjAxOC0xMC0wNlQxNDoxMTo0MiswMzowMDwveG1wOk1vZGlmeURhdGU+CiAgICAgICAgIDx4bXA6TWV0YWRhdGFEYXRlPjIwMTgtMTAtMDZUMTQ6MTE6NDIrMDM6MDA8L3htcDpNZXRhZGF0YURhdGU+CiAgICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2UvcG5nPC9kYzpmb3JtYXQ+CiAgICAgICAgIDxwaG90b3Nob3A6Q29sb3JNb2RlPjM8L3Bob3Rvc2hvcDpDb2xvck1vZGU+CiAgICAgICAgIDx4bXBNTTpJbnN0YW5jZUlEPnhtcC5paWQ6OTI1MjMyMWYtYzA5YS1kZjQ3LWFhZTYtODVhYjYwMTViNzRjPC94bXBNTTpJbnN0YW5jZUlEPgogICAgICAgICA8eG1wTU06RG9jdW1lbnRJRD54bXAuZGlkOjkyNTIzMjFmLWMwOWEtZGY0Ny1hYWU2LTg1YWI2MDE1Yjc0YzwveG1wTU06RG9jdW1lbnRJRD4KICAgICAgICAgPHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD54bXAuZGlkOjkyNTIzMjFmLWMwOWEtZGY0Ny1hYWU2LTg1YWI2MDE1Yjc0YzwveG1wTU06T3JpZ2luYWxEb2N1bWVudElEPgogICAgICAgICA8eG1wTU06SGlzdG9yeT4KICAgICAgICAgICAgPHJkZjpTZXE+CiAgICAgICAgICAgICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6YWN0aW9uPmNyZWF0ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0Omluc3RhbmNlSUQ+eG1wLmlpZDo5MjUyMzIxZi1jMDlhLWRmNDctYWFlNi04NWFiNjAxNWI3NGM8L3N0RXZ0Omluc3RhbmNlSUQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDp3aGVuPjIwMTgtMDktMjBUMDA6MjQ6MTMrMDM6MDA8L3N0RXZ0OndoZW4+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpzb2Z0d2FyZUFnZW50PkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE3IChXaW5kb3dzKTwvc3RFdnQ6c29mdHdhcmVBZ2VudD4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgIDwvcmRmOlNlcT4KICAgICAgICAgPC94bXBNTTpIaXN0b3J5PgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICAgICA8dGlmZjpYUmVzb2x1dGlvbj43MjAwMDAvMTAwMDA8L3RpZmY6WFJlc29sdXRpb24+CiAgICAgICAgIDx0aWZmOllSZXNvbHV0aW9uPjcyMDAwMC8xMDAwMDwvdGlmZjpZUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MjwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICAgICAgICAgPGV4aWY6Q29sb3JTcGFjZT42NTUzNTwvZXhpZjpDb2xvclNwYWNlPgogICAgICAgICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+Mjg1PC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6UGl4ZWxZRGltZW5zaW9uPjI4MDwvZXhpZjpQaXhlbFlEaW1lbnNpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAg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',
      width: 280,
      margin: [340, 40, 0, 0]

    });
    //-----------------------------------------------

    let pageSize = {};
    pageSize['width'] = 1000;
    pageSize['height'] = 'auto';

    docDefinition['content'] = docContent;
    docDefinition['pageSize'] = pageSize;
    //docDefinition['pageSize'] = 'A4';
    //стили***************************************************
    let headerStyle = {};
    headerStyle['fontSize'] = 44;
    headerStyle['bold'] = true;
    headerStyle['alignment'] = 'center';

    let itemStyle = {};
    itemStyle['fontSize'] = 32;
    let itemSumStyle = {};
    itemSumStyle['alignment'] = 'right';

    let totalStyle = {};
    totalStyle['fontSize'] = 38;
    //totalStyle['color'] = 'white';
    //totalStyle['background'] = '#656565';

    let anotherStyle = {};
    anotherStyle['italic'] = true;
    anotherStyle['alignment'] = 'right';

    docStyle['header'] = headerStyle;
    docStyle['itemStyle'] = itemStyle;
    docStyle['itemSumStyle'] = itemSumStyle;
    docStyle['totalStyle'] = totalStyle;
    docStyle['anotherStyle'] = anotherStyle;
    docDefinition['styles'] = docStyle;

    pdfMake.createPdf(docDefinition).download('Список покупок - ' + date + '.pdf');
    pdfMake.createPdf(docDefinition).open();
    //**********************************************************************
  }
}
