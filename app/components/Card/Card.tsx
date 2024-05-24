import { Tooltip } from '@mui/material'
import type { Identifier, XYCoord } from 'dnd-core'
import type { FC } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import EditNoteIcon from "@mui/icons-material/EditNote";
import { TrelloSliceState , addTodo, updateTodo, deleteTodo, setTodo, setTypeTodo} from '@/lib/features/trelloAPI';
import { useAppDispatch } from '@/lib/hooks'
import { store } from '@/lib/store'
import DeleteIcon from '@mui/icons-material/Delete';
const  ItemTypes =  {
    CARD: 'card',
}
const style = {
  border: '1px dashed gray',
  padding: '0.5rem 1rem',
  marginBottom: '.5rem',
  backgroundColor: 'white',
  cursor: 'move',
}

export interface CardProps {
  id: any
  name: string
  index: number
  columnIndex : number
  type :number;
  moveCard: (dragIndex: number, hoverIndex: number, dragColumnIndex  : number, hoverColumnIndex : number) => void
  handleOpen : any
  handleDelete : any
}

interface DragItem {
  index: number
  id: string
  type: string
}

export const Card: FC<CardProps> = ({ id, name, index, columnIndex,type,  moveCard, handleOpen, handleDelete }) => {
  

  const ref = useRef<HTMLDivElement>(null)
  const refTemp = useRef<any>(null)
  const [{ handlerId }, drop ] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: DragItem, monitor) {

  
     

      if (!ref.current) {
        
        return
      }


     

     
     
      const dragColumnIndex = Number(item.id) 
      const dragIndex = item.index


      const hoverIndex = index
      const hoverColumnIndex = columnIndex;



      if (dragIndex === hoverIndex) {
        return
      }


      const hoverBoundingRect = ref.current?.getBoundingClientRect()

  
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

 
      const clientOffset = monitor.getClientOffset()

    
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

     
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }


      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

 
      moveCard(dragIndex, hoverIndex, dragColumnIndex, hoverColumnIndex)
  
      item.index = hoverIndex
     
    },
    
  })

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      return { id, index }
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => {
     
      const divsWithoutDraggable = document.querySelectorAll('.app__todo--content-item:not([draggable])');
      divsWithoutDraggable.forEach((div) => {
     
        div.setAttribute('draggable', 'true');
        refTemp.current = div;
      });
      
    },
   
  })

  const opacity = isDragging ? 0 : 1

  


  if(refTemp.current && !ref.current){
    drag(drop(refTemp))
   
  }else {
    drag(drop( ref))
  }
 
 
 return (
    <>
      {type == columnIndex && (
        <div
          ref={ref}
          style={{ ...style, opacity }}
          data-handler-id={handlerId}
          className="app__todo--content-item"
        >
          <div>
            <span>{name}</span>
          </div>
          <div  className="app__todo--content-item-icon">
            <Tooltip  onClick={() => handleOpen(id)} title="Edit">
              <EditNoteIcon />
            </Tooltip>
            <Tooltip onClick={() => handleDelete(id)} title="Delete" >
              <DeleteIcon  sx={{color : 'red'}} />

              
            </Tooltip>
          </div>
        </div>
      ) }
    </>
  );
}
