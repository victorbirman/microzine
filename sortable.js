import { layout } from "./script.js"

export let sortable = new Sortable(document.getElementById("pagesContainer"), {
  animation: 150,
  ghostClass: "sortable-ghost",
  chosenClass: "sortable-chosen",
  dragClass: "sortable-drag",
  onEnd: function () {
    layout.pagesOrder = Array.from(pagesContainer.children).map(item =>
      parseInt(item.id.replace("slot-", ""))
    )
  },
})
