//=========== Initialize Slots
export class SlotList {
  constructor(numberOfPages) {
    this.slotsList = new Array(numberOfPages).fill(null)
  }
  get length() {
    return this.slotsList.length
  }
  get emptySlotsCount() {
    return this.slotsList.filter(slot => slot == null).length
  }
  get nextEmptySlot() {
    return this.slotsList.findIndex(x => x == null)
  }
}
