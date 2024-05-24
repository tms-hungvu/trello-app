import { TrelloSliceState } from "@/lib/features/trelloAPI";

export const getTotalTypeTrello  = (list: TrelloSliceState[], type: number) => {
    let temp = 0;
    list.map((item) => {
      if (item.type == type) {
        temp++;
      }
    });
    return temp;
  };