const express = require("express");
const bodyParser = require("body-parser");
const _ = require('lodash')
const mongoose = require('mongoose');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const app = express();

mongoose.connect(process.env.MONGO_URI).then(()=>console.log("connected to DataBase")).catch(()=>console.log(error));


const ItemSchema = new mongoose.Schema({
    name:String
})

const Item = mongoose.model("Item",ItemSchema);

const item1 = new Item({
    name:"Welcome to todoList!"
});
const item2 = new Item({
    name:"Hit + button for add to list!"
});
const item3 = new Item({
    name:"<---Hit this button for delete!"
});

const defaultItems = [item1,item2,item3]

app.use(bodyParser.urlencoded({extended:true}))

app.use(express.static("public"))

app.set("view engine","ejs")

// main page

app.get("/",function (req,res) {

    Item.find({}).then((data)=>{

        if (data.length === 0) {
            Item.insertMany(defaultItems).then(()=>console.log("Items inserted to DB!")).catch((err)=>console.log(err));
            res.redirect("/")
        } else {
        
            res.render("list",{ Date: "Today" , listItems:data })
       }
      
        }
       
    ).catch((err)=>console.log(err))
    
});

app.post("/",function (req,res) {
     const SingleAddedItems = req.body.Items;
   const listItemsAdded = req.body.listForWork;


const addedItem = new Item({
    name: SingleAddedItems
});
  
if (listItemsAdded === "Today") {
    addedItem.save();
res.redirect("/")
} else {
    List.findOne({name:listItemsAdded}).then(function (foundedList){
        // console.log(foundedList.item);
            foundedList.item.push(addedItem);
            foundedList.save();
            res.redirect("/" + listItemsAdded);
    }).catch((err)=>console.log(err))
}
  
});

app.post("/delete", function (req,res) {
    const checkedById = req.body.checked;
    const paramHeader = req.body.paramHeader;


    if (paramHeader === "Today") {
        Item.findOneAndRemove({_id: checkedById}).then(()=>{
            console.log("deleted");
            res.redirect("/")
        }).catch((err)=>console.log(err))
    } else {
        List.findOneAndUpdate({name:paramHeader},{$pull:{item:{_id:checkedById}}}).then(()=>{
            console.log("deleted!");
            res.redirect("/"+paramHeader)
        }).catch((err)=>console.log(err))
        
    }
  
})

// Route Parameters!

const ListSchema = new mongoose.Schema({
    name:String,
    item:[ItemSchema]
})

const List = mongoose.model("List",ListSchema);

app.get("/:paramName",function (req,res) {

    const ParamName =_.capitalize(req.params.paramName) 

    List.findOne({name:ParamName}) .then( function (foundList) {
        if (!foundList) {
          const list = new List({
            name: ParamName,
            item: defaultItems
          })
         list.save()
        
              console.log("saved");
              res.redirect("/" + ParamName ); // Redirect after saving the new list
         
        } else {
           
          res.render("list", { Date: foundList.name, listItems: foundList.item });
        }
      })
      .catch(function (err) {
        console.log(err);
      });
});

// port

app.listen(PORT,function () {
    console.log(`The server is running on port ${PORT}`);
});