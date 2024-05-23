import { createAppSlice } from "@/lib/createAppSlice";
import { PayloadAction } from "@reduxjs/toolkit";


export interface TrelloSliceState {
  id : number;
  name : string;
  content : string;
  date : string;
  status : boolean;
  type : number;
}

const initialState: TrelloSliceState[] = [];


export const trelloSlice = createAppSlice({
  name: "trello",

  initialState,

  reducers: (create) => ({
    addTodo: create.reducer((state, action : PayloadAction<TrelloSliceState>) => {
       state.push(action.payload); //Argument of type 'void' is not assignable to parameter of type 'WritableDraft<TrelloSliceState>'
    }),
    updateTodo: create.reducer((state, action : PayloadAction<TrelloSliceState>) => {
          return state.map(todo => {
            if (todo.id === action.payload.id) {
              return action.payload;
            } else {
              return todo;
            }
          });
     }),
     deleteTodo: create.reducer((state, action : PayloadAction<TrelloSliceState>) => {
        return state.filter((item) => item.id != action.payload.id)
    }),

    setTodo: create.reducer((state, action : PayloadAction<TrelloSliceState[]>) => {
      return action.payload;
    }),

    setTypeTodo  : create.reducer((state, action : PayloadAction<TrelloSliceState>) => {
      return state.map(todo => {
        if (todo.id === action.payload.id && action.payload.type != todo.type) {
          return {
            ...todo,
            type : action.payload.type
          }
        } else {
          return todo;
        }
      });
     })



  }),

  selectors: {
    selectTrellos: (counter) => counter,
  },
});


export const { addTodo, updateTodo , deleteTodo, setTodo, setTypeTodo} =
trelloSlice.actions;


export const { selectTrellos } = trelloSlice.selectors;


