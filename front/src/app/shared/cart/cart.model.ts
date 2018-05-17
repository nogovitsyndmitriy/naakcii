import { Injectable } from '@angular/core';
import {FoodList} from '../foodList/foods.foodList.model';
import {Chain, ChainLine} from '../chain/chain.model';
import {isUndefined} from "util";


@Injectable()
export class Cart {
  public lines: CartLine[] = [];
  public itemCount: number = 0;
  public cartAllPrice: number = 0;    //без скидок
  public cartTotalPrice: number = 0;  //с учетом скидок
  public cartAverageDiscount = 0;    //средний процент скидки по всем карточкам

  constructor(public  chainLst: Chain) {
  }

  addLine(product: FoodList, quantity: number) {
    let line = this.lines.find(line => line.product.id == product.id);
    if (line != undefined) {
      line.quantity += quantity;
    } else {
      this.lines.push(new CartLine(product, quantity, ""));
    }
    this.recalculate();
  }

  updateQuantity(product: FoodList, quantity: number) {
    let line = this.lines.find(line => line.product.id == product.id);
    if (line != undefined) {
      line.quantity = Number(quantity);
    }
    this.recalculate();
  }

  removeLine(id: number) {
    let index = this.lines.findIndex(line => line.product.id == id);
    this.lines.splice(index,1);
    this.recalculate();
  }

  //генерация JSON итогового списка для PDF-----------------------------------
  generateJsonListPDF() {
    let pdf = {};
    let chainSort = {};
    let totalSum = {};
    let sumBefore = 0;
    let sumAfter = 0;

    let chainListExist: ChainLine[] = [];
    this.lines.forEach(line => {
      if (isUndefined(chainListExist.find(x => x.chain.id == line.product.idStrore))) {
        chainListExist.push(this.getStorageByID(line.product.idStrore));
      }
    });

    chainListExist.forEach(chain => {
      let curCartList = [];
      this.lines.forEach(cart => {
        if (chain.chain.id == cart.product.idStrore) {
          let curCart = {};
          curCart['Name'] = cart.product.name;
          curCart['Comment'] = cart.comment;
          curCart['priceOne'] = (cart.product.totalPrice).toFixed(2);
          curCart['amount'] = cart.quantity;
          curCart['priceSum'] = (cart.product.totalPrice*cart.quantity).toFixed(2);
          curCartList.push(curCart);
          if (cart.product.allPrice > 0) {
            sumBefore += cart.product.allPrice*cart.quantity;
          } else  {
            sumBefore += cart.product.totalPrice*cart.quantity;
          }
          sumAfter += cart.product.totalPrice*cart.quantity;
        }
      });
      chainSort[chain.chain.name] = curCartList;
    });

    totalSum['sumBefore'] = sumBefore.toFixed(2);
    totalSum['sumAfter'] = sumAfter.toFixed(2);
    totalSum['discountSum'] = (sumBefore - sumAfter).toFixed(2);
    totalSum['discountPersent'] = (100 - (sumAfter/sumBefore)*100).toFixed(0);

    pdf['ChainList'] = chainSort;
    pdf['totalSum'] = totalSum;
    return pdf;
  }

  getStorageByID(id: number): ChainLine {
    return this.chainLst.lines.find(x => x.chain.id === id);
  }
  //-------------------------------------------------------------------------

  clear() {
    this.lines = [];
    this.itemCount = 0;
    this.cartAllPrice = 0;
    this.cartTotalPrice = 0;
    this.cartAverageDiscount = 0;
  }

  private recalculate() {
    this.itemCount = 0;
    this.cartAllPrice = 0;
    this.cartTotalPrice = 0;
    this.cartAverageDiscount = 0;
    this.lines.forEach(l => {
      this.itemCount += l.quantity;
      if (l.product.allPrice > 0) {
        this.cartAllPrice += (l.quantity * l.product.allPrice);
      } else {
        this.cartAllPrice += (l.quantity * l.product.totalPrice);
      }
      this.cartTotalPrice += (l.quantity * l.product.totalPrice);
    })
  }
}
export class CartLine {

  constructor(public product: FoodList,
              public quantity: number,
              public comment: string) {}

  get lineTotal() {
    return this.quantity * this.product.totalPrice;
  }
}
