'use strict'

class Tags {
  _tagItemList;
  _byNameAsc;
  _byNameDesc;
  _byCountAsc;
  _byCountDesc;

  // [{name: 'foo', count.10}, ...]
  constructor(tagItemList) {
    this._tagItemList = tagItemList;
  }

  get byNameAsc() {
    if (!this._byNameAsc) {
      this._byNameAsc = this._tagItemList.concat([]).sort(
          (b, a) => b.name.localeCompare(a.name))
    }
    return this._byNameAsc;
  }

  get byNameDesc() {
    if (!this._byNameDesc) {
      this._byNameDesc = this._byNameAsc = this._tagItemList.concat([]).sort(
          (b, a) => b.name.localeCompare(a.name))
    }
    return this._byNameDesc;
  }

  get byCountAsc() {
    if (!this._byCountAsc) {
      this._byCountAsc = this._tagItemList.concat([]).sort(
          (a, b) => a.count - b.count);
    }
    return this._byCountAsc;
  }

  get byCountDesc() {
    if (!this._byCountDesc) {
      this._byCountDesc = this._tagItemList.concat([]).sort(
          (b, a) => a.count - b.count);
    }
    return this._byCountDesc;
  }

}

module.exports = Tags
