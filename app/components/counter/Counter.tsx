"use client";


import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import { selectTrellos } from '@/lib/features/trelloAPI';
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import AddIcon from "@mui/icons-material/Add";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Modal, TextField, TextareaAutosize, Tooltip } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import { pink } from "@mui/material/colors";
import Switch from "@mui/material/Switch";
import { useCallback, useState } from "react";

import { useForm } from 'react-hook-form';
import { TrelloSliceState , addTodo, updateTodo, deleteTodo, setTodo, setTypeTodo} from '@/lib/features/trelloAPI';
import update from 'immutability-helper'
import { Card } from '../Card/Card';
import { store } from '@/lib/store';
import { useDrop } from 'react-dnd';


const schemUpdate = Joi.object({
  name : Joi.string().required(),
  content : Joi.string().required(),
  id : Joi.allow(),
  date : Joi.date().required(),
  status : Joi.boolean(),
  type : Joi.allow()
})

interface IFormShow {
  isShow : boolean;
  tab : string;
}




const schema = Joi.object({
   name: Joi.string().required(),
   id : Joi.allow(),
   content : Joi.allow(),
   date : Joi.allow(),
   status : Joi.allow(),
   type : Joi.allow()
});


export const Counter = () => {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [edit, setEdit] = useState<TrelloSliceState>({
     name : '',
     id : 0,
     content : '',
     date : '',
     status : true,
     type : 0
  });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TrelloSliceState>({
    resolver: joiResolver(schema),
  });
  const [formShow, setFormShow] = useState<IFormShow>({
    isShow : false,
    tab : ''
 })
  const onSubmit = (data : any) => {
    let type = 0;
   
    if(formShow.tab == 'todo'){
      type = 1;
    }else if(formShow.tab == 'doing'){
      type = 2;
    }else if(formShow.tab == 'done'){
      type = 3;
    }
    const payload = {
      ...data,
      id :  Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000,
      content : '',
      date : '',
      status : true,
      type : type
    }
    dispatch(addTodo(payload));
    reset();
    console.log(payload)
  }



 
  const PinkSwitch = styled(Switch)(({ theme }) => ({
    "& .MuiSwitch-switchBase.Mui-checked": {
      color: pink[600],
      "&:hover": {
        backgroundColor: alpha(pink[600], theme.palette.action.hoverOpacity),
      },
    },
    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
      backgroundColor: pink[600],
    },
  }));

  const label = { inputProps: { "aria-label": "Color switch demo" } };
   const dispatch = useAppDispatch();
 const tasks = useAppSelector(selectTrellos);
 console.log(tasks)
 




  const {  reset : resetUpdate,register : registerUpdate , handleSubmit : handleSubmitUpdate, formState: { errors : errorsUpdate } } = useForm<TrelloSliceState>({
    resolver: joiResolver(schemUpdate),
  });

  const onSubmitUpdate = (data : any) => {
  
    const newDate = data.date;
    delete data.date;


    const payload = {
      ...data,
      date : String(newDate)
      
    }
  
    dispatch(updateTodo(payload))
    handleClose();
 
  };
  const [open, setOpen] = useState(false);


  const handleOpen = (id : number) => {
 // alert(id)

 store.getState().trello.map((item) => {
       if(item.id == id){

        let dateString = item.date;
        let date = new Date(dateString);
        let year = date.getFullYear();
        let month = ("0" + (date.getMonth() + 1)).slice(-2);
        let day = ("0" + date.getDate()).slice(-2);

        let formattedDate = `${year}-${month}-${day}`;
        setEdit(item);
        resetUpdate({...item, date : formattedDate});
       } 
    })
   
    setOpen(true)
  };
  const handleClose = () => setOpen(false);
  const handleDelete = () => {
     setOpenConfirm(true);
  }

  
  const handleCancelPopupDelete = () => {
    setOpenConfirm(false);
  
  }
  const handleCloseCofirm = () => {
  
    dispatch(deleteTodo({id : edit.id} as any))
    setOpenConfirm(false);
    handleClose();
  };


 

  const moveCard = useCallback((dragIndex: number, hoverIndex: number, dragColumnIndex  : number, hoverColumnIndex : number) => {
    //console.log(dragIndex, hoverIndex)
    
    //console.log('>>old task', tasks)
 

    

    console.log(">>>>>>", dragColumnIndex, hoverColumnIndex)
   // console.log('>>new task', newArr)
   dispatch(setTypeTodo({id : dragColumnIndex, type : hoverColumnIndex} as TrelloSliceState))


   const prevTask = store.getState().trello;


    const newArr = update(prevTask, {
      $splice: [
        [dragIndex, 1],
        [hoverIndex, 0, prevTask[dragIndex] as any],
      ],
    });
   dispatch(setTodo(newArr));
    //console.log(newArr);


    // setCards((prevCards: any[]) =>
    //   update(prevCards, {
    //     $splice: [
    //       [dragIndex, 1],
    //       [hoverIndex, 0, prevCards[dragIndex] as any],
    //     ],
    //   }),
    // )




  }, [])
  

  const renderCard = useCallback(
    (card: { id: number; name: string; type : number }, index: number, columnIndex : number) => {
      return (
        <Card
          key={card.id}
          index={index}
          id={card.id}
          name={card.name}
          columnIndex={columnIndex}
          type={card.type}
          moveCard={moveCard}
          handleOpen={handleOpen}
        />
      )
    },
    [],
  )


  const DroppableArea: React.FC<any> = ({ onDrop }) => {
    const [{ isOver }, drop] = useDrop({
      accept:  'card',
      drop: (item) => onDrop(item),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    });
  
    return (
      <div ref={drop} style={{ backgroundColor: isOver ? 'rgba(255, 255, 255, 0.226)' : 'black' , height : '45px'}}>
           
      </div>
    );
  };


  const handleDrop = (type : number, item: any) => {
   // console.log('Item dropped:',type, item);
    dispatch(setTypeTodo({id : Number(item.id), type : type} as TrelloSliceState))
  };

 const getTotalTypeTrello = (list : TrelloSliceState[], type : number) => {
    let temp = 0;
    list.map((item) => {
       if(item.type == type){
        temp ++;
       }
    })
    return temp;
 }


  return (
    

    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className="app__popup--container">
          <h1> Edit task "{edit.name}" - {edit.type == 1 && <span>Todo</span>} {edit.type == 2 && <span>Doing</span>} {edit.type == 3 && <span>Done</span>}</h1>
          <div className="app__popup--content">
            <form onSubmit={handleSubmitUpdate(onSubmitUpdate)}  className="app__popup--content-form">
              <div className="app__popup--content-form-item">
                <TextField
               
                  {...registerUpdate('name')}
                  label="Name"
                
               
                  size="small"
                  color="warning"
                  sx={{ width: "100%" }}
                />
                {errorsUpdate?.name && <span>{errorsUpdate?.name?.message}</span>}
              </div>
              <div className="app__popup--content-form-item">

              <TextareaAutosize

         {...registerUpdate('content')}
        minRows={3}
        placeholder="Content"
      />
                {errorsUpdate?.content && <span>{errorsUpdate?.content?.message}</span>}
              
              </div>

              <div className="app__popup--content-form-item">
                 <input type='date' {...registerUpdate('date')} />
                 {errorsUpdate?.date && <span>{errorsUpdate?.date?.message}</span>}
              </div>
              <div className="app__popup--content-form-item app__popup--content-form-item-delete">
                <PinkSwitch defaultChecked={edit.status}  {...registerUpdate('status')} {...label}  />
                

                <div>

                <Button onClick={() => handleDelete()} variant="outlined" color="error">
                      Delete this task
                </Button>
              
      <Dialog
        open={openConfirm}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Do you want to delete ?"}
        </DialogTitle>
        <DialogContent>
        
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelPopupDelete}>Disagree</Button>
          <Button onClick={handleCloseCofirm} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
                </div>
              </div>
              <div className="app__popup--content-form-item">
                <Button type='submit' variant="contained">Update</Button>
              </div>

            </form>
          </div>
        </Box>
      </Modal>

      <div className="container-fluid" style={{marginTop : '50px'}}>
        <div className="container ">
          <div className="row">
            <div className="col-sm-4">
              <div className="app__todo">
                <div className="app__todo--title">
                  <h1> Todo</h1>
                </div>
                <div className="app__todo--content">
                 { getTotalTypeTrello(tasks, 1) == 0 &&  <DroppableArea onDrop={(item : { id : number, index : number}) => handleDrop(1, item)} />}
                  
               
                {tasks.map((card, i) => {
                   return renderCard(card, i, 1)
                })}

                   {/* {tasks?.map((item, key) => {
                       if(item.type == 1){
                        return  (  <div key={key} className="app__todo--content-item">
                 
                        <div >
                             <span>{item.name}</span>
                           </div>
                         <div
                           onClick={() => handleOpen(item.id)}
                           className="app__todo--content-item-icon"
                         >
                           <Tooltip title="Edit">
                             <EditNoteIcon />
                           </Tooltip>
                         </div>
                       </div>)
                       }
                    })} */}




                 
                </div>

              
                <div className="app__todo--content-form">

             
                    {
                        formShow.tab != 'todo' &&       <div onClick={() => {
                          setFormShow({
                            isShow : true,
                            tab : 'todo'
                          });
                          reset();
                        }} 
                        className="app__todo--content-form-btn">
                        <AddIcon />
                        <span> Add a Card</span>
    
                      </div> 
                    }

            

                  {formShow.isShow && formShow.tab == 'todo' &&      <div className="app__todo--content-form-btns">
                        <form onSubmit={handleSubmit(onSubmit)} className="app__todo--content-form-add">
                            <div className="">
                                <TextField
                                {...register('name')}
                                  label="Name"
                                  id="outlined-size-small"
                                  size="small"
                                  color="warning"
                                  sx={{ width: "100%" }}
                                  autoFocus
                                  inputRef={(input) => input?.focus()}
                                />

                                {errors?.name && <span> {errors.name.message}</span>}
                            </div>

                            <div className="app__todo--content-form-add-btn">
                            <Button type="submit" variant="contained">Add</Button>
                            <CloseIcon onClick={() => {
                                setFormShow({
                                      isShow : false,
                                      tab : ''
                                });
                              }
                               
                            } sx={{color : 'black', cursor : 'pointer'}} />
                            </div>
                        </form>
                  </div>}
                </div>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="app__todo">
                <div className="app__todo--title">
                  <h1> Doing</h1>
                </div>
                <div className="app__todo--content">
                { getTotalTypeTrello(tasks, 2) == 0 &&  <DroppableArea onDrop={(item : { id : number, index : number}) => handleDrop(2, item)} />}
                
                {tasks.map((card, i) => {
                     return renderCard(card, i, 2)
                })}
                {/* {tasks?.map((item, key) => {
                       if(item.type == 2){
                        return  (  <div key={key} className="app__todo--content-item">
                 
                        <div >
                             <span>{item.name}</span>
                           </div>
                         <div
                           onClick={() => handleOpen(item.id)}
                           className="app__todo--content-item-icon"
                         >
                           <Tooltip title="Edit">
                             <EditNoteIcon />
                           </Tooltip>
                         </div>
                       </div>)
                       }
                    })} */}
                     
                </div>

              
                <div className="app__todo--content-form">

             
                    {
                        formShow.tab != 'doing' &&       <div onClick={() => {
                          setFormShow({
                            isShow : true,
                            tab : 'doing'
                          });
                          reset();
                        }} 
                        className="app__todo--content-form-btn">
                        <AddIcon />
                        <span> Add a Card</span>
    
                      </div> 
                    }

            


{formShow.isShow && formShow.tab == 'doing' &&      <div className="app__todo--content-form-btns">
                        <form onSubmit={handleSubmit(onSubmit)} className="app__todo--content-form-add">
                            <div className="">
                                <TextField
                                {...register('name')}
                                  label="Name"
                                  id="outlined-size-small"
                                  size="small"
                                  color="warning"
                                  sx={{ width: "100%" }}
                                  autoFocus
                                  inputRef={(input) => input?.focus()}
                                />

                                {errors?.name && <span> {errors.name.message}</span>}
                            </div>

                            <div className="app__todo--content-form-add-btn">
                            <Button type="submit" variant="contained">Add</Button>
                            <CloseIcon onClick={() => setFormShow({
                              isShow : false,
                              tab : ''
                        }) } sx={{color : 'black', cursor : 'pointer'}} />
                            </div>
                        </form>
                  </div>}

                </div>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="app__todo">
                <div className="app__todo--title">
                  <h1> Done</h1>
                </div>
                <div className="app__todo--content">
               
                { getTotalTypeTrello(tasks, 3) == 0 &&  <DroppableArea onDrop={(item : { id : number, index : number}) => handleDrop(3, item)} />}

                {tasks.map((card, i) => {
                     return renderCard(card, i, 3)
                })}
                {/* {tasks?.map((item, key) => {
                       if(item.type == 3){
                        return  (  <div key={key} className="app__todo--content-item">
                 
                        <div >
                             <span>{item.name}</span>
                           </div>
                         <div
                            onClick={() => handleOpen(item.id)}
                           className="app__todo--content-item-icon"
                         >
                           <Tooltip title="Edit">
                             <EditNoteIcon />
                           </Tooltip>
                         </div>
                       </div>)
                       }
                    })} */}
                </div>

                <div className="app__todo--content-form">

             
                    {
                        formShow.tab != 'done' &&       <div onClick={() => {
                          setFormShow({
                            isShow : true,
                            tab : 'done'
                          });
                          reset();
                        }} 
                        className="app__todo--content-form-btn">
                        <AddIcon />
                        <span> Add a Card</span>
    
                      </div> 
                    }

            

{formShow.isShow && formShow.tab == 'done' &&      <div className="app__todo--content-form-btns">
                        <form onSubmit={handleSubmit(onSubmit)} className="app__todo--content-form-add">
                            <div className="">
                                <TextField
                                {...register('name')}
                                  label="Name"
                                  id="outlined-size-small"
                                  size="small"
                                  color="warning"
                                  sx={{ width: "100%" }}
                                  autoFocus
                                  inputRef={(input) => input?.focus()}
                                />

                                {errors?.name && <span> {errors.name.message}</span>}
                            </div>

                            <div className="app__todo--content-form-add-btn">
                            <Button type="submit" variant="contained">Add</Button>
                            <CloseIcon onClick={() => setFormShow({
                              isShow : false,
                              tab : ''
                        }) } sx={{color : 'black', cursor : 'pointer'}} />
                            </div>
                        </form>
                  </div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
